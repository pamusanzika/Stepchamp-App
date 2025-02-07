import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dropdown } from "react-bootstrap";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { googleLogout } from "@react-oauth/google";

const UserProfile = () => {
    const [showDropdown, setShowDropdown] = useState(false);

    const navigate = useNavigate();
    const { instance } = useMsal();
    const handleLogout = () => {
        if (localStorage.getItem('token-provider') === 'google'){
            googleLogout();
            localStorage.clear();
            navigate('/auth/login');
        }
        else {
            instance.logoutPopup().then((res: any)=> {
                localStorage.clear();
                navigate('/auth/login');
            });
        }
    }

  return (
    <div className="d-flex">
    <Button
        className="profile-photo"
        onClick={() => setShowDropdown(!showDropdown)}>
        <FontAwesomeIcon icon={faUser} size="lg" color="white" />
    </Button>
    <Dropdown show={showDropdown} align="end">
        <Dropdown.Toggle as={Button} className="d-none"></Dropdown.Toggle>
        <Dropdown.Menu>
        <Dropdown.Item onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
    </div>
);
};

export default UserProfile;
