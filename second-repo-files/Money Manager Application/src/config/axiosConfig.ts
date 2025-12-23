import axios from "axios";

const axiosConfig = axios.create({
  baseURL: "http://localhost:8080/api/v1.0",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
})

const excludeEndpoints = ["/login", "/register"]

// request interceptor
axiosConfig.interceptors.request.use(
  (config) => {
    const shouldSkipToken = excludeEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    )

    if (!shouldSkipToken) {
      // Get token from localStorage - token is set ONLY during login/register
      const accessToken = localStorage.getItem("token")
      if (accessToken) {
        // Add Bearer token to ALL API requests (except login/register)
        config.headers["Authorization"] = `Bearer ${accessToken}`
        console.log(`🔐 Adding Bearer token to request: ${config.method?.toUpperCase()} ${config.url}`)
      } else {
        console.warn(`⚠️ No auth token found for request: ${config.method?.toUpperCase()} ${config.url}`)
        console.warn(`⚠️ Token should be set during login/register. Please login first.`)
      }
    } else {
      console.log(`🔓 Skipping auth token for: ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// response interceptor
axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const method = error.config?.method?.toUpperCase()
    
    if (status === 401) {
      console.warn("🔒 401 Unauthorized - Token invalid or expired")
      console.warn("Request:", method, url)
      // Clear token and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("currentUser")
      localStorage.setItem("backendMode", "offline")
      window.location.href = "/"
    } else if (status === 403) {
      console.error("🚫 403 Forbidden - Access denied")
      console.error("Request:", method, url)
      console.error("Error details:", {
        status: status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        requestHeaders: error.config?.headers
      })
      
      // Check if token exists
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("❌ No token found in localStorage")
        console.error("Please login again")
      } else {
        console.warn("⚠️ Token exists but request was denied")
        console.warn("Possible causes:")
        console.warn("1. CORS not configured in backend")
        console.warn("2. Token format incorrect")
        console.warn("3. Backend security blocking request")
        console.warn("4. User permissions insufficient")
      }
      
      // Don't auto-redirect for 403, let the component handle it
      // This might be a CORS issue that can be resolved
    } else if (status === 500) {
      console.error("💥 500 Server Error")
      console.error("Request:", method, url)
      console.error("Error:", error.response?.data)
    } else if (
      error.code === "ECONNABORTED" ||
      error.message === "Network Error"
    ) {
      console.error("🌐 Network Error - Backend unavailable")
      console.error("Request:", method, url)
      console.error("Switching to offline mode...")
      localStorage.setItem("backendMode", "offline")
    }
    return Promise.reject(error)
  }
)

export default axiosConfig
