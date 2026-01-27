import axios from "axios";

// backend api baseURL is https://domain/api/ {api endpoint} and anything outside /api/ is served by frontend
const api = axios.create({
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
        await api.post("/auth/refresh/", {}, { withCredentials: true });
        // After refreshing the token, retry the original request
        return api(originalRequest);
      } catch (err) {
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
