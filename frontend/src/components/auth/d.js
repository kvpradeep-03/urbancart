import axios from "axios";

// backend api baseURL is https://domain/api/ {api endpoint} and anything outside /api/ is served by frontend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// tracks whether a token refresh request is already happening.
let isRefreshing = false;

// stores all the requests that failed with 401 while a refresh is in progress, After refresh finishes a new obtained token is given to all the queued request and retry them.
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    //if success all queued req are resolved elseif it failed the req will be rejected
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = []; //resetting the array to prevent duplicity.
};

// interceptor syntax api.interceptors.response.use(successHandler, errorHandler)
// registers a response interceptor. The success handler returns the response unchanged. The error handler runs when a response has an error (like 401).
api.interceptors.response.use(
  (response) => response, //returns normal responses
  async (error) => {
    // originalRequest contains the full config (method, headers, URL, body, etc.) of the failed request.
    const originalRequest = error.config;
    if (!originalRequest || !originalRequest.url) {
      return Promise.reject(error);
    }

    const reqUrl = originalRequest.url || "";
    // Skip refresh for auth-related endpoints (handle both absolute and relative URLs)
    // Important: also skip any endpoint containing '/refresh' to avoid intercepting
    // the refresh endpoint if its path differs (e.g. '/refresh/' vs '/auth/refresh/').
    if (
      reqUrl.includes("/auth/login/") ||
      reqUrl.includes("/auth/refresh/") ||
      reqUrl.includes("/auth/signup/") ||
      reqUrl.includes("/refresh") ||
      reqUrl.includes("/login") ||
      reqUrl.includes("/signup")
    ) {
      return Promise.reject(error);
    }

    // Only handle refresh endpoints 401 error, rejects this refresh's 401 error and makes the user for login
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Avoiding infinite retry loops by creating and setting the custom flag to true so if once tried it wont try again
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue the request until refresh finishes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    // If multiple req raises at sametime when token is expired it first triggers refresh api
    // while during refresh (isRefreshing = true) they wont call refresh endpoint again instead the requests are queued
    isRefreshing = true;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh/`,
        {},
        { withCredentials: true },
      );
      isRefreshing = false;
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError);
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  },
);

export default api;
