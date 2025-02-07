import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, OverlayTrigger, Row, Spinner, Tab, Tabs, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import './NewChallenge.scss';
import DirtyValidationService from '../../../services/services-common/DirtyValidationService';
import ChallengeService from '../../../services/services-domain/ChallengeService';
import Rules from '../Rules/Rules';
import Teams from '../Teams/Teams';
import LoadingScreen from '../../../components/features/LoadingScreen/LoadingScreen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Members from '../Members/Members';
import Admins from '../Admins/Admins';
import { ErrorResponseDto } from '../../../Dto/ResponseDtos/ErrorResponseDto';

function NewChallengeEdit() {
  const { id } = useParams();
  const challengeId = parseInt(id ?? "0", 10);

  const _dirtyValidationService = DirtyValidationService.getInstance();
  const _challengeService = new ChallengeService();

  const dateObj = new Date();
  const today = new Date();

  const convertDateToString = (date: Date) => {
    return date.toISOString().slice(0, 10);
  }

  const calculateEndDate = (date: Date) => {
    let eDate = new Date(date.setDate(date.getDate() + 27));
    return convertDateToString(eDate);
  }
  const calculatedEndDate = calculateEndDate(dateObj);
  const [activeTab, setActiveTab] = useState('general');
  const [tabEnabled, setTabEnabled] = useState(false);
  const [generatingInvitationCode, setGeneratingInvitationCode] = useState(false);
  const [challengeData, setChallengeData] = useState({
    challengeTitle: '',
    startDate: convertDateToString(today),
    endDate: calculatedEndDate,
    publicJoining: false,
    invitationCode: '',
    concurrencyKey: '',
  });
  const [challengeTitle, setChallengeTitle] = useState('');
  const [startDate, setStartDate] = useState(convertDateToString(today));
  const [endDate, setEndDate] = useState(calculatedEndDate);
  const [publicJoining, setPublicJoining] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [loader, setLoader] = useState(true);
  const [showLoadPopup, setShowLoadPopup] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    if (challengeId > 0) {
      setTabEnabled(true);
    }
  }, [challengeId])

  useEffect(() => {
    function loadChallengeDetails() {
      const msgObj = {
        challengeId: challengeId
      };

      _challengeService.getChallenge(msgObj).then(response => {
        if (response) {
          var data = response[0];
          if (data) {
            const newData = {
              challengeTitle: data.Name,
              startDate: data.StartDate,
              endDate: data.EndDate,
              publicJoining: data.IsPublicJoining,
              invitationCode: data.InvitationCode,
              concurrencyKey: data.ConcurrencyKey,
            };
  
            setChallengeData(newData);
  
            // Set form field values
            setChallengeTitle(data.Name);
            setStartDate(data.StartDate);
            setEndDate(data.EndDate);
            setPublicJoining(data.IsPublicJoining);
            setInvitationCode(data.InvitationCode);
            setTabEnabled(true);
            setLoader(true);
          }
        }
        setShowLoadPopup(false);
        _dirtyValidationService.resetAll();

      }).catch((error: ErrorResponseDto) => {
        if (error.displayErrorMessage === "You do not have access to this challenge") {
          setHasAccess(false);
        }
        setShowLoadPopup(false);
        _dirtyValidationService.resetAll();
      });  
    }

    loadChallengeDetails();
  }, [challengeId]);

  const handleTabChange = async (tabKey: any) => {
    if (await _dirtyValidationService.canCancelDirtyView()) {
      setToDefaults();
      setActiveTab(tabKey);
      _dirtyValidationService.resetAll();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === null || newValue === undefined || newValue === '') {
      _dirtyValidationService.markFieldAsUndirty('challengeTitle');
    }
    else {
      _dirtyValidationService.markFieldAsDirty('challengeTitle');
    }
    setChallengeTitle(newValue);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const chosendate = new Date(newValue);

    if (newValue !== '') {
      if (newValue === convertDateToString(today)) {
        _dirtyValidationService.markFieldAsUndirty('startDate');
        _dirtyValidationService.markFieldAsUndirty('endDate');
      } else {
        _dirtyValidationService.markFieldAsDirty('startDate');
        _dirtyValidationService.markFieldAsDirty('endDate');
      }
      setStartDate(newValue);
      setEndDate(calculateEndDate(chosendate));
    } else {
      if (newValue === convertDateToString(today)) {
        _dirtyValidationService.markFieldAsUndirty('startDate');
      } else {
        _dirtyValidationService.markFieldAsDirty('startDate');
      }
      setStartDate(newValue);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === calculatedEndDate) {
      _dirtyValidationService.markFieldAsUndirty('endDate');
    } else {
      _dirtyValidationService.markFieldAsDirty('endDate');
    }

    setEndDate(newValue);
  };

  const handlePublicJoiningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    if (newValue && invitationCode === '') {
      refreshInvitationCode();
    }
    if (!newValue && invitationCode === '') {
      _dirtyValidationService.markFieldAsUndirty('publicJoining');
    }
    else {
      _dirtyValidationService.markFieldAsDirty('publicJoining');
    }
    setPublicJoining(newValue);
  };

  const setToDefaults = () => {
    setChallengeTitle(challengeData.challengeTitle)
    setStartDate(challengeData.startDate);
    setEndDate(challengeData.endDate);
    setPublicJoining(challengeData.publicJoining);
    setInvitationCode(challengeData.invitationCode);
    setLoader(true);
  };

  const refreshInvitationCode = () => {
    setLoader(false);
    setGeneratingInvitationCode(true);

    _challengeService.generateInvitationCode()
      .then((data: any) => {
        setInvitationCode(data);
        _dirtyValidationService.markFieldAsDirty('invitationCode');
        setLoader(true);
        setGeneratingInvitationCode(false);
      }).catch(error => {
        setLoader(true);
        setGeneratingInvitationCode(false);
      });
  };

  const isFormDirty = () => {
    if (!publicJoining || (publicJoining && invitationCode !== '' && !generatingInvitationCode)) {
      return (
        _dirtyValidationService.isDirty() && challengeTitle !== '' && startDate !== '' && endDate !== ''
      );
    }
    else {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowLoadPopup(true);
    const data = {
      id: challengeId,
      name: challengeTitle,
      startDate,
      endDate,
      isPublicJoining: !publicJoining ? 0 : 1,
      invitationCode,
      concurrencyKey: challengeData.concurrencyKey,
    };
    _challengeService.updateChallenge(data)
      .then(async (data: any) => {
        setShowLoadPopup(false);
        toast.success("Saved Successfully")
        const msgObj = {
          challengeId: challengeId
        };

        _challengeService.getChallenge(msgObj).then((response: any) => {
          if (response) {
            var challengeData = response[0];
            const newData = {
              challengeTitle: challengeData.Name,
              startDate: challengeData.StartDate,
              endDate: challengeData.EndDate,
              publicJoining: challengeData.IsPublicJoining,
              invitationCode: challengeData.InvitationCode,
              concurrencyKey: challengeData.ConcurrencyKey,
            };

            setChallengeData(newData);

            // Set form field values
            setChallengeTitle(challengeData.Name);
            setStartDate(challengeData.StartDate);
            setEndDate(challengeData.EndDate);
            setPublicJoining(challengeData.IsPublicJoining);
            setInvitationCode(challengeData.InvitationCode);
            setTabEnabled(true);
            setLoader(true);
          } else {
            toast.error("Failed to save. Please try again");
            setShowLoadPopup(false);
          }
        }).catch((error) => {
          setShowLoadPopup(false);
        });
      });

    _dirtyValidationService.resetAll();
  };

  const handleCancel = async () => {
    if (await _dirtyValidationService.canCancelDirtyView()) {
      // Clear form fields and reset dirty fields when the Cancel button is clicked
      setToDefaults();
    }
  };

  const startDateIsInPast = startDate <= convertDateToString(new Date());
  const endDateDateInPast = endDate < convertDateToString(new Date());

  return (
    <Container fluid className='bg-white rounded-3 new-main-container'>
      <LoadingScreen showLoadPopup={showLoadPopup} />
      <ToastContainer />
      {!hasAccess ? <Col style={{ display: 'flex', justifyContent: 'center' }}><h1>You are not an admin of this challenge!</h1></Col> :
        <>
          <h2 className='title'>Step Challenge {challengeTitle !== '' ? ' - ' + challengeTitle : ''}</h2>
          <Tabs
            activeKey={activeTab} // Set the active tab based on state
            onSelect={handleTabChange} // Handle tab change
            className='mb-3'
          >
            <Tab eventKey="general" title='General' id='generalTab'>
              <Form onSubmit={handleSubmit}>
                <Row className='mb-3 new-row align-items-center'>
                  <Col xs={2}>
                    <Form.Label>Name<div className='required-asterix'>*</div></Form.Label>
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type='text'
                      id='challengeTitle'
                      value={challengeTitle}
                      maxLength={50}
                      required
                      onChange={handleTitleChange}
                    />
                  </Col>
                </Row>
                <Row className='mb-3 new-row align-items-center'>
                  <Col xs={2}>
                    <Form.Label>Period<div className='required-asterix'>*</div></Form.Label>
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type='date'
                      id='startDate'
                      value={startDate}
                      min={convertDateToString(today)}
                      required
                      onChange={handleStartDateChange}
                      onKeyDown={(e) => e.preventDefault()} // Prevent pasting in the input field
                      onCut={(e) => e.preventDefault()} // Prevent cutting in the input field
                      disabled={startDateIsInPast}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type='date'
                      id='endDate'
                      value={endDate}
                      min={convertDateToString(today)}
                      required
                      onChange={handleEndDateChange}
                      onKeyDown={(e) => e.preventDefault()} // Prevent pasting in the input field
                      onCut={(e) => e.preventDefault()} // Prevent cutting in the input field
                      disabled={endDateDateInPast}
                    />
                  </Col>
                </Row>
                <Row className='mb-5 new-row align-items-center'>
                  <Col xs={2}>
                    <Form.Label>Public Joining</Form.Label>
                  </Col>
                  <Col xs={1} className='toggle-switch'>
                    <Form.Check
                      className='form-switch .form-check-input'
                      type='switch'
                      id='enablePublicJoining'
                      checked={publicJoining}
                      onChange={handlePublicJoiningChange}
                    />
                  </Col>
                  {publicJoining ? (
                    <>
                      <Col xs={2}>
                        <Form.Label className='invitation-code'>Invitation Code</Form.Label>
                      </Col>
                      <Col xs={2}>
                        <Form.Control
                          type='text'
                          id='invitationCode'
                          value={invitationCode}
                          disabled 
                          className='invitation-code-input-box'
                        />
                      </Col>
                      <Col xs={2}>
                        <OverlayTrigger
                          placement='bottom'
                          overlay={<Tooltip>Copy to Clipboard</Tooltip>}
                        >
                          <Button
                            variant='light'
                            size='sm'
                            onClick={() => navigator.clipboard.writeText(invitationCode)}
                            id='copyToClipboardBtn'
                            className='icon-btn'
                            disabled={!(invitationCode !== '' && publicJoining)}
                          >
                            <FontAwesomeIcon icon={faClone} className='icon' />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement='bottom'
                          overlay={<Tooltip>Regenarate Invitation Code</Tooltip>}
                        >
                          <Button
                            variant='light'
                            size='sm'
                            onClick={refreshInvitationCode}
                            id='refreshInvitationCodeBtn'
                            className='icon-btn'
                            disabled={!(invitationCode !== '' && publicJoining)}
                          >
                            <Spinner as='span' animation='border' size='sm' hidden={loader} />
                            <div hidden={!loader}><FontAwesomeIcon icon={faRefresh} className='icon' /></div>
                          </Button>
                        </OverlayTrigger>
                      </Col>
                    </>
                  ) : null}
                </Row>
                <Row className='mb-3 new-row'>
                  <Col xs={8}>
                    <Button variant='success' type='submit' id='submitBtn' disabled={!isFormDirty()} className='new-save-button'>Save</Button>{' '}
                    <Button variant='secondary' id='cancelBtn' className='cancel-btn' disabled={!isFormDirty()} onClick={handleCancel}>Cancel</Button>
                  </Col>
                </Row>
              </Form>
            </Tab>
            <Tab eventKey="rules" title='Rules' id='rulesTab' className="custom-tab" disabled={!tabEnabled}>
              {activeTab === 'rules' && <Rules challengeId={challengeId} />}
            </Tab>
            <Tab eventKey="teams" title='Teams' id='teamsTab' disabled={!tabEnabled}>
              {activeTab === 'teams' && <Teams challengeId={challengeId} />}
            </Tab>
            <Tab eventKey="members" title='Members' id='membersTab' disabled={!tabEnabled}>
              {activeTab === 'members' && <Members challengeId={challengeId} />}
            </Tab>
            <Tab eventKey="admins" title='Admins' id='adminsTab' disabled={!tabEnabled}>
              {activeTab === 'admins' && <Admins challengeId={challengeId} />}
            </Tab>
          </Tabs></>}
    </Container>
  );
}

export default NewChallengeEdit;
