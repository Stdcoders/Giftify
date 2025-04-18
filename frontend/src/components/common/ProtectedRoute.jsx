import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {

    const { userInfo } = useSelector((state) => state.auth);

    if (!userInfo || (role && userInfo.role !== role)) {
        return <Navigate to='/login' replace />;
    }

    return children;

}
export default ProtectedRoute;