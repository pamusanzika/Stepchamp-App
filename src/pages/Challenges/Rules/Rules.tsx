import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import DirtyValidationService from '../../../services/services-common/DirtyValidationService'
import '../Rules/Rules.scss';
import RulesService from "../../../services/services-domain/RulesService";
import LoadingScreen from '../../../components/features/LoadingScreen/LoadingScreen';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Regex } from "../../../utils/constants";

function Rules(props: { challengeId?: number }) {
  const challengeId = props.challengeId;

  const _dirtyValidationService = DirtyValidationService.getInstance();
  const _rulesService = new RulesService();

  const [minStepsCount, setMinStepsCount] = useState('');
  const [personalStrikesCount, setPersonalStrikesCount] = useState('');
  const [teamStrikesCount, setTeamStrikesCount] = useState('');
  const [timeDurationSelectedValue, setTimeDurationSelectedValue] = useState('');
  const [rulesData, setRulesData] = useState({
    id: 0,
    minStepsCount: '',
    personalStrikesCount: '',
    teamStrikesCount: '',
    timeDurationSelectedValue: '',
    concurrencyKey: '',
  });
  const [showLoadPopup, setShowLoadPopup] = useState(true);

  useEffect(() => {
    
      const msgObj = {
        challengeId: challengeId
      };

      _rulesService.getRules(msgObj).then(response => {
        if (response) {
          var data = response[0];
  
          if (data) {
            const newData = {
              id: data.Id,
              minStepsCount: data.MinStepsCount,
              personalStrikesCount: data.PersonalStrikesCount,
              teamStrikesCount: data.TeamStrikesCount,
              timeDurationSelectedValue: data.TimeDurationSelectedValue,
              concurrencyKey: data.ConcurrencyKey,
            };
            setRulesData(newData);
  
            // Set form field values
            setMinStepsCount(data.MinStepsCount);
            setPersonalStrikesCount(data.PersonalStrikesCount);
            setTeamStrikesCount(data.TeamStrikesCount);
            setTimeDurationSelectedValue(data.TimeDuration);
          }
        }
        setShowLoadPopup(false);
        _dirtyValidationService.resetAll();

      }).catch(error => {
        setShowLoadPopup(false);
      });
  }, [challengeId]);

  const handleMinStepCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    _dirtyValidationService.markFieldAsDirty('minStepCount');

    const inputValue = e.target.value.replace(Regex.nonDigitCharactersRegex, '');

    if (inputValue.length <= 6) {
      setMinStepsCount(inputValue.replace(Regex.thousandSeparatorRegex, ','));
    }
  };

  const handlePersonalStrikesCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    _dirtyValidationService.markFieldAsDirty('personalStrikes');
    const inputValue = e.target.value.replace(Regex.nonDigitCharactersRegex, '');

    if (inputValue.length <= 4) {
      setPersonalStrikesCount(inputValue.replace(Regex.thousandSeparatorRegex, ','));
    }
  };

  const handleTeamStrikesCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    _dirtyValidationService.markFieldAsDirty('teamStrikes');
    const inputValue = e.target.value.replace(Regex.nonDigitCharactersRegex, '');

    if (inputValue.length <= 4) {
      setTeamStrikesCount(inputValue.replace(Regex.thousandSeparatorRegex, ','));
    }
  };

  const handleTimeDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    _dirtyValidationService.markFieldAsDirty('timeDuration')
    setTimeDurationSelectedValue(e.target.value.toString());
  };

  const setToDefaults = () => {
    setMinStepsCount(rulesData.minStepsCount);
    setPersonalStrikesCount(rulesData.personalStrikesCount);
    setTeamStrikesCount(rulesData.teamStrikesCount);
    setTimeDurationSelectedValue(rulesData.timeDurationSelectedValue);
  };

  const isFormDirty = () => {
    return (
      _dirtyValidationService.isDirty()
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowLoadPopup(true);

    if (parseInt(personalStrikesCount.toString().replace(/,/g, ''), 10) < parseInt(teamStrikesCount.toString().replace(/,/g, ''), 10)) {
      const data = {
        id: rulesData.id,
        challengeId: challengeId,
        minStepsCount: minStepsCount,
        personalStrikesCount: personalStrikesCount,
        teamStrikesCount: teamStrikesCount,
        timeDurationSelectedValue: timeDurationSelectedValue,
        concurrencyKey: rulesData.concurrencyKey,
      };

      _rulesService.updateRules(data)
        .then(async (data: any) => {
          setShowLoadPopup(false);
          toast.success("Saved successfully")
          const msgObj = {
            challengeId: challengeId
          };

          var response = await _rulesService.getRules(msgObj);

          if (response) {
            var data = response[0];

            if (data) {
              const newData = {
                id: data.Id,
                minStepsCount: data.MinStepsCount,
                personalStrikesCount: data.PersonalStrikesCount,
                teamStrikesCount: data.TeamStrikesCount,
                timeDurationSelectedValue: data.TimeDuration,
                concurrencyKey: data.ConcurrencyKey,
              };

              setRulesData(newData);

              // Set form field values
              setMinStepsCount(data.MinStepsCount);
              setPersonalStrikesCount(data.PersonalStrikesCount);
              setTeamStrikesCount(data.TeamStrikesCount);
              setTimeDurationSelectedValue(data.TimeDuration);
            }
          }
          else {
            toast.error("Failed to save. Please try again");
          }
        }).catch((error) => {
          setShowLoadPopup(false);
          toast.error("An error occurred while saving. Please try again.");
        });
      _dirtyValidationService.resetAll();
    } else {
      setShowLoadPopup(false);
      toast.error("Personal disqualifications should never outweigh team disqualifications. Please try again")
    }
  };

  const handleCancel = async () => {
    if (await _dirtyValidationService.canCancelDirtyView()) {
      setToDefaults();
    }
  };



  return (
    <Container fluid className='bg-white rounded-3 main-container'>
      <LoadingScreen showLoadPopup={showLoadPopup} />
      <Form onSubmit={handleSubmit}>
        <Row className='mb-3 row-styles'>
          <Col xs={4}>
            <Form.Label className="label">Minimum steps per person</Form.Label>
          </Col>
          <Col xs={2}>
            <Form.Control
              className='text-label'
              type='text'
              id='minStepCount'
              value={minStepsCount}
              required
              onChange={handleMinStepCountChange}
            />
          </Col>

          <Col xs={1}>
            <Form.Label className='per-text label'>per</Form.Label>
          </Col>
          <Col xs={1}>
            <select className='duration-dropdown' id="timeDuration" value={timeDurationSelectedValue} onChange={handleTimeDurationChange}>
              <option value="week">week</option>
              <option value="day">day</option>
            </select>
          </Col>
        </Row>

        <Row className='mb-3 row-styles'>
          <Col xs={4}>
            <Form.Label className="label">Personal disqualification - Strikes</Form.Label>
          </Col>
          <Col xs={2}>
            <Form.Control
              className='text-label'
              type='text'
              id='personalStrikes'
              value={personalStrikesCount}
              required
              onChange={handlePersonalStrikesCountChange}
            />
          </Col>

        </Row>
        <Row className='mb-3 row-styles'>
          <Col xs={4}>
            <Form.Label className="label">Team disqualification - Strikes</Form.Label>
          </Col>
          <Col xs={2}>
            <Form.Control
              className='text-label'
              type='text'
              id='teamStrikes'
              value={teamStrikesCount}
              required
              onChange={handleTeamStrikesCountChange}
            />
          </Col>

        </Row>
        <Row className='mb-3 row-styles'>
          <Col xs={8}>
            <Button disabled={!isFormDirty()} variant='success' type='submit' id='submitBtn' className='save-button'>Save</Button>{' '}
            <Button disabled={!isFormDirty()} onClick={handleCancel} variant='secondary' id='cancelBtn' className='cancel-btn'>Cancel</Button>
          </Col>
        </Row>
      </Form>
    </Container>
  )
}

export default Rules