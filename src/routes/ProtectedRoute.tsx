import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalStorageKeys } from "../utils/constants";
const ProtectedRoute = (props:any) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const checkUserToken = () => {
        const userToken = localStorage.getItem(LocalStorageKeys.sessionId);
        if (!userToken || userToken === 'undefined') {
            setIsLoggedIn(false);
            navigate('/auth/login', { replace: true });
        }else {
            setIsLoggedIn(true);
        }

    }
    useEffect(() => {
        checkUserToken();
    }, [isLoggedIn]);
    return (
        <React.Fragment>
            {
                isLoggedIn ? props.children : null
            }
        </React.Fragment>
    );
}
export default ProtectedRoute;