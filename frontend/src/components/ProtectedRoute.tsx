import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = JSON.parse(localStorage.getItem("user") || "null")

    if (!user) {
        return <Navigate to="/signin" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute