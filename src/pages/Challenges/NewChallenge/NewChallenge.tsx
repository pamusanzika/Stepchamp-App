import { useState } from 'react';
import { Button, Col, Container, Form, OverlayTrigger, Row, Spinner, Tab, Tabs, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './NewChallenge.scss';
import DirtyValidationService from '../../../services/services-common/DirtyValidationService';
import ChallengeService from '../../../services/services-domain/ChallengeService';
import Rules from '../Rules/Rules';
import LoadingScreen from '../../../components/features/LoadingScreen/LoadingScreen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NewChallenge() {
  const _dirtyValidationService = DirtyValidationService.getInstance();
  const _challengeService = new ChallengeService();
  const dateObj = new Date();
  const today = new Date();
  const navigate = useNavigate();

  const convertDateToString = (date: Date) => {
    return date.toISOString().slice(0, 10);
  }

  const calculateEndDate = (date: Date) => {
    let eDate = new Date(date.setDate(date.getDate() + 27));
    return convertDateToString(eDate);
  }

  const [activeTab, setActiveTab] = useState('general');
  const [tabEnabled, setTabEnabled] = useState(false);
  const [generatingInvitationCode, setGeneratingInvitationCode] = useState(false);
  const calculatedEndDate = calculateEndDate(dateObj);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [startDate, setStartDate] = useState(convertDateToString(today));
  const [endDate, setEndDate] = useState(calculatedEndDate);
  const [publicJoining, setPublicJoining] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [loader, setLoader] = useState(true);
  const [showLoadPopup, setShowLoadPopup] = useState(false);

  const handleTabChange = (tabKey: any) => {
    setActiveTab(tabKey);
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
    setChallengeTitle('');
    setStartDate(convertDateToString(today));
    setEndDate(calculatedEndDate);
    setPublicJoining(false);
    setInvitationCode('');
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
      }) ;
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
      name: challengeTitle,
      startDate,
      endDate,
      isPublicJoining: publicJoining ? 1 : 0,
      invitationCode
    };
     _challengeService.addChallenge(data)
      .then((data: any) => {
        if (parseInt(data.rowId, 10) > 0) {
          setShowLoadPopup(false);
          _challengeService.challengeId = parseInt(data.rowId, 10);
          setTabEnabled(true);
          navigate(`/challenge/${_challengeService.challengeId}`);
        }
        else {
          toast.error("Failed to save. Please try again");
          setShowLoadPopup(false);
        }
      }).catch((error) => {
        setShowLoadPopup(false);
      });

    _dirtyValidationService.resetAll();
  };

  const handleCancel = async () => {
    if (await _dirtyValidationService.canCancelDirtyView()) {
      // Clear form fields and reset dirty fields when the Cancel button is clicked
      setToDefaults();
    }
  };


  return (
    <Container fluid className='bg-white rounded-3 new-main-container'>
      <ToastContainer />
      <LoadingScreen showLoadPopup={showLoadPopup} />
      <h2 className='title'>New Step Challenge</h2>
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
                  className='input-control'
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
                />
              </Col>
              <Col xs={3}>
                <Form.Control
                  type='date'
                  id='endDate'
                  value={endDate}
                  min={startDate}
                  required
                  onChange={handleEndDateChange}
                />
              </Col>
            </Row>
            <Row className='mb-4 new-row align-items-center'>
              <Col xs={2}>
                <Form.Label>Public Joining</Form.Label>
              </Col>
              <Col xs={1} className='toggle-switch'>
                <Form.Check
                  type='switch'
                  id='enablePublicJoining'
                  checked={publicJoining}
                  onChange={handlePublicJoiningChange}
                  className='form-switch .form-check-input'
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
                <Button variant='secondary' id='cancelBtn' className='cancel-btn' disabled={!_dirtyValidationService.isDirty()} onClick={handleCancel}>Cancel</Button>
              </Col>
            </Row>
          </Form>
        </Tab>
        <Tab eventKey="rules" title='Rules' id='rulesTab' disabled={!tabEnabled}>
          {activeTab === 'rules' && <Rules />}
        </Tab>
        <Tab eventKey="teams" title='Teams' id='teamsTab' disabled={!tabEnabled}>
          {/* <Teams challengeId={challengeId} /> */}
        </Tab>
        <Tab eventKey="memebers" title='Members' id='memebersTab' disabled={!tabEnabled}>
          memebersTab
        </Tab>
        <Tab eventKey="admins" title='Admins' id='adminsTab' disabled={!tabEnabled}>
          adminsTab
        </Tab>
      </Tabs>
    </Container>
  );
}

export default NewChallenge;
