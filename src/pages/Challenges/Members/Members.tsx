import { Button, ButtonGroup, Col, Row } from "react-bootstrap";
import MultiSelectListBox from "../../../components/features/MultiSelectListBox/MultiSelectListBox";
import "./Members.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import DirtyValidationService from '../../../services/services-common/DirtyValidationService';
import MemberService from "../../../services/services-domain/MemberService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { objectArraySort } from "../../../utils/functions";
import { TeamWithCountDto } from "../../../Dto/ResponseDtos/TeamWithCountDto";
import { ChallengeParticipationDto } from "../../../Dto/ResponseDtos/ChallengeParticipationDto";
import { TeamParticipationDto } from "../../../Dto/ResponseDtos/TeamParticipationDto";
import LoadingScreen from "../../../components/features/LoadingScreen/LoadingScreen";
import Dropdown from 'react-bootstrap/Dropdown';
import Alert from 'sweetalert2';



const Members = (props: any) => {

    const challengeId = props.challengeId;
    const finalState = useRef<{ [key: number]: { assignedMembers: any[] } }>({});

    const _dirtyValidationService = DirtyValidationService.getInstance();
    const _memberService = new MemberService();

    const [showLoadingScreen, setShowLoadingScreen] = useState(false);
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);

    const [disableSaveButton, setDisableSaveButton] = useState(true);
    const [disableCancelButton, setDisableCancelButton] = useState(true);

    const [disableUnassignButton, setDisableUnassignButton] = useState(true);
    const [disableAssignButton, setDisableAssignButton] = useState(true);

    const [teamAssigningDetails, setTeamAssigningDetails] = useState<TeamParticipationDto[]>([]); // initial team assiging list
    const [challengeParticipants, setChallengeParticipants] = useState<ChallengeParticipationDto[]>([]); // All assigned,unassigned participants of the challenge
    const [teamDetails, setTeamDetails] = useState<TeamWithCountDto[]>([]); // All team names and initial member count details

    const [selectedMemberIdList, setSelectedMemberIdList] =  useState<number[]>([]);
    const [selectedUnassignedIdList, setSelectedUnAssignedIdList] =  useState<number[]>([]);
    const [toBeRemovedList, setToBeRemovedList] =  useState<{ value: number; text: string; subText: string, [key: string]: unknown}[]>([]);
    const [initiallySelectedTeamId, setInitiallySelectedTeamId] = useState(0);
    const [selectedTeamId, setSelectedTeamId] = useState(0); // Currently selected team Id

    const [unassignedMembers, setUnassignedMembers] = useState<{ value: number; text: string; subText: string, [key: string]: unknown}[]>([]); // Always users in unassigned box

    const [assignedMembers, setAssignedMembers] = useState<{ value: number; text: string; subText: string, [key: string]: unknown}[]>([]); // Always users in assigned box

    useEffect(() => {
        if(challengeId > 0) {
            fetchInitialData(challengeId);
        }

    }, [challengeId]);


    const fetchInitialData = (challengeId: number) => {
        setShowLoadingScreen(true);
        updateFinalState(0);

        if(toBeRemovedList.length > 0){
            // clear any members to be removed
            setToBeRemovedList([]);
            setSelectedUnAssignedIdList([]);
        }
        _memberService.getChallengeParticipationDetails(challengeId).then(res => {
                const teamDetails = res.TeamsWithCountDetails;

                setTeamDetails(teamDetails.map(td => ({ value: td.Id, text: `${td.Name} (${td.MemberCount})`, subText: "", ...td})));
                const sortedTeamDetails: TeamWithCountDto[] = objectArraySort(teamDetails, "Name");
                setTeamDetails(sortedTeamDetails.map(td => ({value: td.Id, text: `${td.Name} (${td.MemberCount})`, subText:"", ...td})));
                
                setInitiallySelectedTeamId(sortedTeamDetails[0].Id);
                setSelectedTeamId(sortedTeamDetails[0].Id);

                const challegeParticipants = res.ChallengeUserDetails;
                setChallengeParticipants(challegeParticipants);

                const teamAssignings = res.TeamParticipantDetails;
                setTeamAssigningDetails(teamAssignings);
                
                // Create unassigned participant list.
                // UnAssignedParticipantList is a constant array and it includes all who don't belong to any team.
                const allAssignedUserchallengeIdList = teamAssignings.map(ta => ta.UserChallengeId);
                const unassignedParticipantList =  challegeParticipants.filter(ca => !allAssignedUserchallengeIdList.includes(ca.UserChallengeId));
                setUnassignedMembers(unassignedParticipantList.map(ap => ({value: ap.UserId, text: ap.Name, subText: ap.Email, ...ap})));
                      
                      
                // Separate assignedMembers by selected team Id and set
                separateAssignedMembersByTeamId(challegeParticipants, teamAssignings, sortedTeamDetails[0].Id);
                
                setShowLoadingScreen(false);
                _dirtyValidationService.resetAll();
                resetButtonsDisabled();
            } ).catch(err => {
                toast.error(err);
                setShowLoadingScreen(false);
            });
    }

    /**
     * 
     * @param challegeParticipants It should be always global challengeParticipants variable
     * @param teamAssignings It must be always the global teamAssigningDetails variable
     * @param teamId The selected Team Id
     */
    function separateAssignedMembersByTeamId(challegeParticipants: ChallengeParticipationDto[], teamAssignings: TeamParticipationDto[], teamId: number) {
        const teamAssignedUserchallengeIdList = (teamAssignings.filter(ta => ta.TeamId === teamId)).map(ta => ta.UserChallengeId);

        let assignedParticipantList;
        if(finalState.current[teamId]) {
            assignedParticipantList = finalState.current[teamId].assignedMembers;
        } else {
            assignedParticipantList = challegeParticipants.filter(ca => teamAssignedUserchallengeIdList.includes(ca.UserChallengeId));
        }

        setAssignedMembers(assignedParticipantList.map(ap => ({value: ap.UserId, text: ap.Name, subText: ap.Email, ...ap})));   
    }

    const updateFinalState = (key: number = 0, value: {assignedMembers: any[]} = {assignedMembers: []}) => {
        if(key == 0) {
            finalState.current = {};
        } else {
            finalState.current[key] = value;
        }
      };
    


    const onTeamSelection = (selectedIdList: number[]) => {
        // Preserve the previous state
        updateFinalState(selectedTeamId, {assignedMembers: assignedMembers});
        setSelectedTeamId(selectedIdList[0]);
        separateAssignedMembersByTeamId(challengeParticipants, teamAssigningDetails, selectedIdList[0]);
    }

    const onUnassignedSelection = (selectedIdList: any) => {
        setSelectedUnAssignedIdList(selectedIdList);
        if(selectedIdList.length > 0) {
            setDisableAssignButton(false);
        } else {
            setDisableAssignButton(true);
        }
    }

    const onMemberSelection = (selectedIdList: number[]) => {
        setSelectedMemberIdList(selectedIdList);
        if(selectedIdList.length > 0) {
            setDisableUnassignButton(false);
        } else {
            setDisableUnassignButton(true);
        }
    }

    //On Save
    const onSave = async () => {
        setShowLoadingScreen(true);

       try {
        const res = await _memberService.saveMemberUpdates(finalState.current, challengeId, toBeRemovedList.map(removedUser => removedUser.value) );
        fetchInitialData(challengeId);
        console.log(res)
        toast.success(res);
       } catch (error: any) {
        // console.log(error);
        toast.error(error);
        setShowLoadingScreen(false);
       }

        _dirtyValidationService.resetAll();
        resetButtonsDisabled();
    }

    // On Cancel
    const onCancel = () => {
        if(_dirtyValidationService.isDirty()) {
            _dirtyValidationService.canCancelDirtyView().then((isConfirmed: boolean) => {
                if(isConfirmed) {
                    fetchInitialData(challengeId);
                    resetButtonsDisabled();
                } else {
                    return;
                }
            });
        } else {
            fetchInitialData(challengeId);
            resetButtonsDisabled();
        }

    }

    // On > Unassign button click
    const onUnasssign = () => {
        if(!_dirtyValidationService.isFieldDirty('UnassignButton') && selectedMemberIdList.length > 0) {
            _dirtyValidationService.markFieldAsDirty('UnassignButton');
            setDisableSaveButton(false);
            setDisableCancelButton(false);
        }

        if(selectedMemberIdList.length > 0) {
            const newAssignedMembers = [...assignedMembers.filter(m => !selectedMemberIdList.includes(m.value))];
            setUnassignedMembers([...unassignedMembers, ...assignedMembers.filter(m => selectedMemberIdList.includes(m.value))]);
            setAssignedMembers(newAssignedMembers);

            updateFinalState(selectedTeamId, {assignedMembers: [...assignedMembers.filter(m => !selectedMemberIdList.includes(m.value))]});

             // Update the memberCount
            const updatedTeamDetails = teamDetails.map(td => {
                if(selectedTeamId == td.Id) {
                    const newTd = {...td, MemberCount: newAssignedMembers.length, value: td.Id, text: `${td.Name} (${newAssignedMembers.length})`, subText: ''};
                    return newTd;
                } else {
                    return td;
                }
            });
            setTeamDetails(updatedTeamDetails);
            setInitiallySelectedTeamId(selectedTeamId);



            setDisableUnassignButton(true);
            setSelectedUnAssignedIdList([]);
        }
    }

    // On < Assign button click
    const onAssign = () => {
        if(!_dirtyValidationService.isFieldDirty('AssignButton') && selectedUnassignedIdList.length > 0) {
            _dirtyValidationService.markFieldAsDirty('AssignButton');
            setDisableSaveButton(false);
            setDisableCancelButton(false);
        }

        if(selectedUnassignedIdList.length > 0) {
            const newAssignedMembers = [...assignedMembers, ...unassignedMembers.filter(m => selectedUnassignedIdList.includes(m.value))];
            setAssignedMembers(newAssignedMembers);
            setUnassignedMembers([...unassignedMembers.filter(m => !selectedUnassignedIdList.includes(m.value))]);

            updateFinalState(selectedTeamId, {assignedMembers: [...assignedMembers, ...unassignedMembers.filter(m => selectedUnassignedIdList.includes(m.value))]});

            // Update the memberCount
            const updatedTeamDetails = teamDetails.map(td => {
                if(selectedTeamId == td.Id) {
                    const newTd = {...td, MemberCount: newAssignedMembers.length, value: td.Id, text: `${td.Name} (${newAssignedMembers.length})`, subText: ''}
                    return newTd;
                } else {
                    return td;
                }
            });
            setTeamDetails(updatedTeamDetails)
            setInitiallySelectedTeamId(selectedTeamId);
            setDisableAssignButton(true);
            setSelectedUnAssignedIdList([]);
        }
    }

    // Disable all the buttons
    const resetButtonsDisabled = () => {
        setDisableSaveButton(true);
        setDisableCancelButton(true);
        setDisableAssignButton(true);
        setDisableUnassignButton(true);
    }

    // 3 dropdown button action
    const loadGeveoUsers = async () => {
        setShowLoadingScreen(true);
        try {
            const participants:any[] = await _memberService.loadGeveoUsers(challengeId);
            //adding removed members back to unassigned list if they are geveo users
            participants.push(...toBeRemovedList.filter(user => user.Source === 'geveo'));
            //keeping the non-geveo members in the toBeRemovedList after fetching the geveo users back
            setToBeRemovedList(toBeRemovedList.filter(user => user.Source !== 'geveo'));

            if(participants) {
                const mappedParticipants = participants.map(p => ({value: p.UserId, text: p.Name, subText: p.Email, ...p}));
                let newUpdatedParticipantList = [...unassignedMembers, ...mappedParticipants];
                newUpdatedParticipantList = objectArraySort(newUpdatedParticipantList, 'text')
                setUnassignedMembers(newUpdatedParticipantList);
            }
            setShowLoadingScreen(false);  
        } catch (error) {
            setShowLoadingScreen(false);
        }
    }
    
    const allocateToTeams = async () => {
        if (unassignedMembers.length === 0) {
            toast.error('No Unassigned Members');
            return null;
        }
        if(!_dirtyValidationService.isFieldDirty('AutoAllocate')) {
            _dirtyValidationService.markFieldAsDirty('AutoAllocate');
            setDisableSaveButton(false);
            setDisableCancelButton(false);
        }

        const sortedTeams: any = [...teamDetails].sort((a, b) => a.MemberCount - b.MemberCount);
        const unassignedUsers = [...unassignedMembers];

        for (let i = 0; i < unassignedUsers.length; i++) {
            const user = unassignedUsers[i];
            const smallestTeam = sortedTeams[0];
            if (!smallestTeam.hasOwnProperty("members")) {
                smallestTeam.members = [];
            }
            smallestTeam.members.push(user);
            smallestTeam.MemberCount += 1;

            sortedTeams.sort((a: any, b: any) => a.MemberCount - b.MemberCount);
        }

        sortedTeams.forEach((team: any) => {
            if (team.hasOwnProperty("members")) {
                if (finalState.current[team.Id]) {
                    let existingAssignedMembers = finalState.current[team.Id].assignedMembers;
                    updateFinalState(team.Id, {assignedMembers: [...existingAssignedMembers, ...team.members]});
                } else {
                    const teamAssignedUserchallengeIdList = teamAssigningDetails
                        .filter(ta => ta.TeamId === team.Id)
                        .map(ta => ta.UserChallengeId);
                    const assignedParticipantList = challengeParticipants
                        .filter(ca => teamAssignedUserchallengeIdList.includes(ca.UserChallengeId))
                        .map((item: any) => ({value: item.UserId, text: item.Name, subText: item.Email, ...item}));
                    updateFinalState(team.Id, {assignedMembers: [...assignedParticipantList, ...team.members]});
                }
                if (team.Id === selectedTeamId) {
                    setAssignedMembers([...assignedMembers, ...team.members]);
                }
            }
        });
        setUnassignedMembers([]);

        sortedTeams.forEach((team: any) => {
            delete team.members;
            team.value = team.Id;
            team.text = `${team.Name} (${team.MemberCount})`;
            team.subText = '';
        });
        setTeamDetails([...sortedTeams]);
    }

    const removeSelected  = async () =>  {
        if(!_dirtyValidationService.isFieldDirty('RemoveSelected') && selectedUnassignedIdList.length > 0) {
            _dirtyValidationService.markFieldAsDirty('RemoveSelected');
        }
      
        if (unassignedMembers.length === 0) {
            toast.error('No unassigned members!');
            return null;
        } else if (selectedUnassignedIdList.length === 0) {
            await Alert.fire({
                icon: 'error',
                title: 'Oops...',
                text: "No members selected to remove!",
                confirmButtonColor: '#23d856',
              })
        } else {
           await Alert.fire({
                title: 'Are you sure?',
                text: 'You want to remove these users from the challenge?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                confirmButtonColor: "#23d856",
                cancelButtonColor: "#EA4335",
                reverseButtons: false,
              })
              .then((result) => {
                if(result.isConfirmed){
                    setShowLoadingScreen(true);
                    //adding removed members to the array
                    toBeRemovedList.push(...unassignedMembers.filter(e => selectedUnassignedIdList.includes(e.value)));
                    setToBeRemovedList(toBeRemovedList);
                    setUnassignedMembers(unassignedMembers.filter(e => !selectedUnassignedIdList.includes(e.value)));
                    
                    Alert.fire({
                         title: "Success!",
                         text: "Users will be removed once changes are saved.",
                         icon: "success"
                        });
                    setShowLoadingScreen(false);
                    if( selectedUnassignedIdList.length > 0) {
                        setDisableSaveButton(false);
                        setDisableCancelButton(false);
                    }
                    setSelectedUnAssignedIdList([]);
                } 
            });
        }
    }

    const handleToggle = (isOpen: boolean) => {
        setIsDropDownOpen(isOpen);
    };


    return(
        <>
            <Row>
                <Col lg={3} sm={4} md={2} xs={5}>
                    <Row><Col className="bold-text">Team ({teamDetails.length})</Col></Row>
                    <Row><Col><MultiSelectListBox multiSelect={false} selectedItemValue={initiallySelectedTeamId} width="width-100" optionList={teamDetails} onChange={onTeamSelection}  /></Col></Row>
                </Col>
                <Col lg={1} sm={1} md={1}>
                    <Row><Col></Col></Row>
                </Col>
                <Col lg={3} sm={4} md={2} xs={5}>
                    <Row><Col className="bold-text">Members ({assignedMembers.length})</Col></Row>
                    <Row><Col><MultiSelectListBox multiSelect={true} optionList={assignedMembers} onChange={onMemberSelection}  width="width-100" /></Col></Row>
                </Col>
                <Col className="chevron-button-column" lg={1} sm={1} md={1}>
                    <Row><Col><Button className="arrow-button" title="Unassign" onClick={onUnasssign} disabled={disableUnassignButton}><FontAwesomeIcon icon={faChevronRight} /></Button></Col></Row>
                    <div className="button-spacing"></div>
                    <Row><Col><Button className="arrow-button" title="Assign" onClick={onAssign} disabled={disableAssignButton}><FontAwesomeIcon icon={faChevronLeft} /></Button></Col></Row>
                </Col>
                <Col lg={3} sm={4} md={2} xs={5}>
                    <Row className="unassigned-list-header-row">
                        <Col lg={10} className="bold-text">Unassigned ({unassignedMembers.length})</Col>
                        <Col lg={2} className="dropdown-column">
                            <Dropdown as={ButtonGroup} className="dropdown-action" onToggle={handleToggle}>
                                <Dropdown.Toggle split variant="success" id="dropdown-split-basic" className={`custom-button ${isDropDownOpen ? 'rotated' : ''}`} disabled={teamDetails.length < 1}>
                                <FontAwesomeIcon icon={faChevronDown} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu">
                                <Dropdown.Item eventKey="1" as="button" onClick={() => loadGeveoUsers()}>Add all Geveo members</Dropdown.Item>
                                <Dropdown.Item eventKey="2" as="button" onClick={() => allocateToTeams()}>Automatically allocate to teams</Dropdown.Item>
                                <Dropdown.Item eventKey="3" as="button" onClick={() => removeSelected()}>Remove selected</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                    <Row><Col><MultiSelectListBox multiSelect={true} optionList={unassignedMembers} onChange={onUnassignedSelection} width="width-100"  /></Col></Row>
                </Col>
                <Col lg={1} sm={1} md={1}>
                    <Row><Col></Col></Row>
                </Col>
            </Row>

            <Row className="bottom-strip">
                <Button className="save-button" onClick={onSave} disabled={disableSaveButton}>Save</Button>
                <Button variant="secondary" className="cancel-button" onClick={onCancel} disabled={disableCancelButton}>Cancel</Button>
            </Row>

            <LoadingScreen showLoadPopup={showLoadingScreen} />
            
        </>
    );
}

export default Members;