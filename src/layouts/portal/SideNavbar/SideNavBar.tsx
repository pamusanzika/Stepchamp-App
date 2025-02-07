import { useState } from "react";
import { Button, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import "./SideNavBar.scss";
import logo from "../../../assets/images/Logo.png";
import SideNavBarItemList from "./SideNavBarItemList";

function SideNavbar() {
  const [isCollapsed, setisCollapsed] = useState(false);

  const handleButtonClick = () => {
    setisCollapsed(!isCollapsed);
  };
  return (
    <div className="SideNavbar">
      <div className={`SideNavbarHeader ${isCollapsed ? "collapsed" : ""}`}>
        <Container className="logo-container">
          <img src={logo} alt="logo" className="logo-image" />
        </Container>
        <Button onClick={handleButtonClick} className="CollapseSideBarButton">
          <FontAwesomeIcon icon={faChevronRight} size="lg" color="white" className={`icon-wrapper ${isCollapsed ? "" : "Rotate180"}`} />
        </Button>
      </div>
      <SideNavBarItemList isCollapsed={isCollapsed} />
    </div>
  );
}

export default SideNavbar;
