import React from "react";
import { Outlet } from "react-router-dom";
import AuthHeader from "../AuthHeader/AuthHeader";
import AuthFooter from "../AuthFooter/AuthFooter";
import './AuthLayout.scss'
const AuthLayout = () => {
    return (
        <React.Fragment>
            <div className="auth-container">
                {/* <AuthHeader /> */}
                <Outlet />
                {/* <AuthFooter/> */}
            </div>
        </React.Fragment>
    );
}
export default AuthLayout;