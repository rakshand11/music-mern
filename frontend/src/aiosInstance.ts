import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "https://music-mern-1.onrender.com",
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || ""
        const is401 = error.response?.status === 401
        const isAuthRoute = url.includes("/user/login") || url.includes("/user/admin/login")

        // Only redirect if 401 and NOT an auth route
        if (is401 && !isAuthRoute) {
            localStorage.removeItem("user")
            window.location.href = "/signin"
        }

        return Promise.reject(error)
    }
)

export default api