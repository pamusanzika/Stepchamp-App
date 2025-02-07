import { Container, Row, Col, Button } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";
import './Challenges/Challenges.scss';

function ChallengesLayout() {
  return (
    <>
      <Container fluid className="bg-white rounded mb-4">
        <Row className="p-4">
          <Col><h2>Step Challenges</h2></Col>
          <Col>
            <Link to="/challenges/new">
              <Button
                variant="success"
                className="float-end add-btn"
                id="addChallengeBtn"
              >
                Add
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
        <Outlet />
    </>
  );
}

export default ChallengesLayout;
