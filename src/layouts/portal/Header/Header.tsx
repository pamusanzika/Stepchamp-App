import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { Offcanvas } from "react-bootstrap";
import { useState } from "react";
import SideNavBarItemList from "../SideNavbar/SideNavBarItemList";
import UserProfile from "../../../components/features/UserProfile/UserProfile";
import logo from "../../../assets/images/Logo.png";
import "./Header.scss";

function Header() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <Navbar bg="light" data-bs-theme="light">
      <div className="open-side-menu-mobile">
        <Button
          onClick={handleShow}
          className="open-side-menu-mobile-button btn-outline-secondary"
        >
          <FontAwesomeIcon icon={faBars} size="lg" color="black" />
        </Button>
        <Offcanvas show={show} onHide={handleClose}>
          <Offcanvas.Header closeButton>
            <Container className="logo-container">
              <img src={logo} alt="logo" className="logo-image" />
            </Container>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="d-flex align-items-center flex-column">
              <UserProfile />
              <Nav.Link href="#features">User Name</Nav.Link>
            </div>
            <SideNavBarItemList isCollapsed={false} />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
      <div className="d-flex justify-content-end align-items-center flex-grow-1">
        <Form className="search-bar">
          <Row>
            <Col xs="auto">
              <Form.Control
                type="text"
                placeholder="Search"
                className="mr-sm-2"
              />
            </Col>
          </Row>
        </Form>
        <div className="me-auto"></div>
        <Button className="notification-button">
          <FontAwesomeIcon
            className="notification-icon"
            icon={faBell}
            size="lg"
          />
        </Button>
        <div className="profile-button-web">
          <UserProfile />
        </div>
      </div>
    </Navbar>
  );
}

export default Header;
