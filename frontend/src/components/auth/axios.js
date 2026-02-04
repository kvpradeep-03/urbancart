import axios from "axios";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export const getCSRF = () => {
  return axios.get(`${import.meta.env.VITE_API_URL}/auth/csrf/`, {
    withCredentials: true,
  });
};
// Dockerfile contains ARG VITE_API_URL -> ENV VITE_API_URL=$VITE_API_URL before npm run build, then this axios file will be compiled with the production URL baked in.
console.log(import.meta.env.VITE_API_URL);

// backend api baseURL is https://domain/api/ {api endpoint} and anything outside /api/ is served by frontend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// refreshClient: same baseURL and credentials but no interceptors (prevents recursion)
// calling the same api instance for refresh can cause interceptor recursion; using global axios loses baseURL and withCredentials.
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// interceptor syntax api.interceptors.response.use(successHandler, errorHandler)
// registers a response interceptor. The success handler returns the response unchanged. The error handler runs when a response has an error (like 401).
api.interceptors.response.use(
  (response) => response, //returns normal responses
  async (error) => {
    // originalRequest contains the full config (method, headers, URL, body, etc.) of the failed request.
    const originalRequest = error.config;
    // console.log("AXIOS INTERCEPTOR ERROR: ", originalRequest);
    // Skip refresh for these endpoints is these endpoint returns 401 due to unauthorized at initial req
    if (
      originalRequest.url.includes("/auth/login/") ||
      originalRequest.url.includes("/auth/refresh/") ||
      originalRequest.url.includes("/auth/signup/")
    ) {
      return Promise.reject(error);
    }
    // Only handle refresh endpoints 401 error, rejects this refresh's 401 error and makes the user for login
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // custom flag to avoid infinite loop
      originalRequest._retry = true;
      try {
        const refresh = await refreshClient.post("/auth/refresh/");
        if (refresh.status !== 200) {
          // This check ensures the code is running in a browser, not on the server
          if (typeof window !== "undefined") {
            // sending a global event by Creating an event object, Event name = "auth:loginRequired"
            // window.dispatchEvent(...) Broadcasts this event to anyone(entire DOM) listening on window
            window.dispatchEvent(new CustomEvent("auth:loginRequired"));
          }
          // Then the unauthenticated request is rejected to propagate the error
          return Promise.reject(error);
        }
        // After refreshing the token, retry the original request
        return api(originalRequest);
      } catch (err) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:loginRequired"));
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
