import React, { useEffect, useState } from 'react'
import SideNavbar from '../SideNavbar/SideNavBar';
import Header from '../Header/Header';
import { Container } from 'react-bootstrap';
import Footer from '../Footer/Footer';
import { Outlet } from 'react-router-dom';
import { LocalStorageKeys } from '../../../utils/constants';

function MainLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkUserToken = () => {
        const userToken = localStorage.getItem(LocalStorageKeys.sessionId);
        if (!userToken || userToken === 'undefined') {
            setIsLoggedIn(false);
        }
        setIsLoggedIn(true);   
    }

    useEffect(() => {
        checkUserToken();
    }, [isLoggedIn]);

    return (
        <React.Fragment>
        {/* {isLoggedIn && <PortalNavbar />}
        <Outlet />
        {isLoggedIn && <PortalFooter />} */}
            <div className="d-flex">
                <div className={`side-navbar-web`}>
                <SideNavbar />
                </div>
                <div className="dashboard-background">
                <Header />
                <Container className="dashboard-body">
                <Outlet />
                    {/* <nav>
                    <div>
                        Contract status:{" "}
                        {isContractInitiated ? "Connected" : "Not Connected"}
                    </div>
                    </nav> */}
                </Container>
                <Footer />
                </div>
            </div>
        </React.Fragment>
    )
}

export default MainLayout