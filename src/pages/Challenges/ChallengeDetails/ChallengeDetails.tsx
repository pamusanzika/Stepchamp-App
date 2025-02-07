import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap"
import { Link, useParams } from "react-router-dom";
import ChallengeService from "../../../services/services-domain/ChallengeService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faCalendarAlt, faHourglassHalf, faCheckCircle, faTimes, faPersonRunning, faUsers } from "@fortawesome/free-solid-svg-icons";
import DateService from "../../../services/services-common/DateService";
import LoadingScreen from "../../../components/features/LoadingScreen/LoadingScreen";
import './ChallengeDetails.scss';

const ChallengeDetails = (props: any) => {
  const { id } = useParams();
  const challengeId = parseInt(id ?? "0", 10);

  type ChallengeDetails = {
    Id: number,
    Name: string,
    StartDate: string,
    EndDate: string,
    InvitationCode: string,
    IsPublicJoining: number,
    Status: string,
    teamCount: number,
    participantCount: number,
    CreatedOn: string,
    LastUpdatedOn: string,
    ConcurrencyKey: string
  };

  const _challengeService = new ChallengeService();
  const _dateService = DateService.getInstance();

  const [challengeDetails, setChallengeDetails] = useState<ChallengeDetails>();
  const [hasAccess, setHasAccess] = useState(true);
  const [showLoadPopup, setShowLoadPopup] = useState(true);

  const refreshList = async () => {
    const msgObj = {
      challengeId: challengeId
    };

    try {
      let response: any = await _challengeService.getChallengeDetails(msgObj);
      setChallengeDetails(response);
      setShowLoadPopup(false);
    } catch(error: any) {
      if (error.displayErrorMessage && error.displayErrorMessage === "You do not have access to this challenge") {
        setHasAccess(false);
      }
    };
  }

  useEffect(() => {
    refreshList();
  }, [])

  return (
    <>
      <LoadingScreen showLoadPopup={showLoadPopup} />
      {!hasAccess ? (
        <Col style={{ display: 'flex', justifyContent: 'center' }}>
          <h1>You are not an admin of this challenge!</h1>
        </Col>
      ) : (
        challengeDetails ? (
          <>
            <Container fluid className="bg-white rounded-3 mb-3">
              <Row className="p-3 d-flex align-items-center">
                <Col>
                  <h2>
                    {challengeDetails.Name !== "" ? challengeDetails.Name : ""}
                  </h2>
                </Col>
                <Col xs={2}>
                  <Link to={`/challenge/edit/${challengeId}`}>
                    <Button
                      variant="success"
                      className="configureBtn float-end"
                      id="configureBtn"
                    >
                      <FontAwesomeIcon icon={faCog} size="lg" />&nbsp;
                      Configure
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Container>
            <Container fluid className="bg-white rounded-3">
              <Row className="p-3">
                <Col className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} size="xl" color="gray" />&nbsp;&nbsp;
                  {_dateService.getThemedDate(challengeDetails.StartDate)} - {_dateService.getThemedDate(challengeDetails.EndDate)}
                </Col>
                <Col className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUsers} size="xl" color="gray" /> &nbsp;&nbsp;
                  {challengeDetails.teamCount} Teams with {challengeDetails.participantCount} participants
                </Col>
                <Col>
                  {(() => {
                    switch (challengeDetails.Status) {
                      case 'Pending':
                        return (
                          <div className="status-pending">
                            <FontAwesomeIcon icon={faHourglassHalf} size="xl" color="orange" />&nbsp;&nbsp;&nbsp;Pending
                          </div>
                        );
                      case 'Ongoing':
                        return (
                          <div className="status-ongoing">
                            <FontAwesomeIcon icon={faPersonRunning} size="xl" color="rgb(91, 178, 249)" />&nbsp;&nbsp;&nbsp;Ongoing
                          </div>
                        )
                      case 'Completed':
                        return (
                          <div className="status-completed">
                            <FontAwesomeIcon icon={faCheckCircle} size="xl" color="#23d856" />&nbsp;&nbsp;&nbsp;Completed
                          </div>
                        )
                      case 'Deleted':
                        return (
                          <div>
                            <FontAwesomeIcon icon={faTimes} size="xl" />&nbsp;Deleted
                          </div>
                        )
                      default:
                        return null;
                    }
                  })()}
                </Col>
              </Row>
            </Container>
          </>
        ) : null
      )}
    </>
  );
  
}

export default ChallengeDetails;