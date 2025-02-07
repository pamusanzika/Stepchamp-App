import { useEffect, useState } from "react";
import AddEditInputBox from "../../../components/features/AddEditInputBox/AddEditInputBox";
import ModalComponent from "../../../components/ModalComponent/ModalComponent";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import "./Teams.scss";
import TeamService from "../../../services/services-domain/TeamService";
import { objectArraySort } from "../../../utils/functions";
import LoadingScreen from "../../../components/features/LoadingScreen/LoadingScreen";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import DirtyValidationService from "../../../services/services-common/DirtyValidationService";
import { TeamDto } from "../../../Dto/TeamDto";

const Teams = (props: any) => {
  const challengeId = props.challengeId;

  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] =
    useState(false);
  const [deletingTeam, setDeletingTeam] = useState<any>(null);
  const [showSavingLoader, setShowSavingLoader] = useState(true);
  const [teamHasMembers, setTeamHasMembers] = useState(false);
  const [editTeams, setEditTeams] = useState<TeamDto[]>([]);
  const [newTeams, setNewTeams] = useState<TeamDto[]>([]);
  const [deletePendingTeams, setDeletePendingTeams] = useState<TeamDto[]>([]);
  const [teamList, setTeamList] = useState<any[]>([]);
  const [editableTeamList, setEditableTeamList] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [prevText, setPrevText] = useState("");

  const _dirtyValidationService = DirtyValidationService.getInstance();
  const _teamService = new TeamService();

    useEffect(() => {
        if (challengeId > 0) {
            _teamService.getTeamsByChallengeId(challengeId)
                .then((data: any) => {
                    if (data) {
                        setTeamList(objectArraySort(data, 'Name'));
                        setEditableTeamList(objectArraySort(data, 'Name'));
                    }
                    setShowSavingLoader(false);
                })
                .catch(err => {
                    console.log(err.thrownError);
                    setShowSavingLoader(false);
                    toast.error("Error in fetching team list.");
                });
        }
    }, [challengeId])

  const onSave = async (data: any): Promise<boolean> => {
    _dirtyValidationService.markFieldAsDirty("inputName");
    const newName = data.newText.replace(/^\s*\d+\.\s+/, "").trim();

    // Validation for team name
    if (newName.length > 0) {
      if (newName.length > 50) {
        toast.error("Team name cannot exceed 50 characters.");
        setPrevText(newName);
        return false;
      }
      try {
        let team: TeamDto = {
          Id: data.Id,
          Name: newName,
          ChallengesId: challengeId,
          ConcurrencyKey: data.Id > 0 ? data.ConcurrencyKey : "",
          CreatedOn: data.Id > 0 ? data.CreatedOn : "",
          LastUpdatedOn: data.Id ? data.LastUpdatedOn : "",
        };
        let prevName = "";
        if (data && data.Name) {
          prevName = data.Name.replace(/^\s*\d+\.\s+/, "").trim();
        }
        if (data.Id > 0) {
          if (newName !== prevName) {
            //update team lists
            let isNameAlreadyExist = teamList.some(
              (team) => team.Name === newName
            );
            if (isNameAlreadyExist) {
              toast.error("Team name already exists!");
              return false;
            } else {
              setTeamList((prevTeamList) =>
                prevTeamList.map((prevTeam) =>
                  prevTeam.Id === team.Id && prevTeam.Name !== team.Name
                    ? team
                    : prevTeam
                )
              );
              setEditTeams((prevEditableTeams) => [...prevEditableTeams, team]);
            }
          }
        } else if (data.Id === 0) {
          let isNameAlreadyExist = teamList.some(
            (team) => team.Name === newName
          );
          if (isNameAlreadyExist) {
            toast.error("Team name already exists!");
            setPrevText(newName);
            return false;
          }

          let isInDeletedTeamList = deletePendingTeams.some(
            (team) => team.Name === newName
          );
          // update new teams list
          if(!isInDeletedTeamList){
            setNewTeams((prevNewTeams) => {
              const teamIndex = prevNewTeams.findIndex(
                (existingTeam) => existingTeam.Name === prevName
              );
  
              if (teamIndex !== -1) {
                return [
                  ...prevNewTeams.slice(0, teamIndex),
                  team,
                  ...prevNewTeams.slice(teamIndex + 1),
                ];
              } else {
                return [...prevNewTeams, team];
              }
            });
          }else{
            setDeletePendingTeams((prevNewTeams) => {
              const teamIndex = prevNewTeams.findIndex(
                (existingTeam) => existingTeam.Name === newName
              );
              if (teamIndex !== -1) {
                const updatedTeams = prevNewTeams.filter((_, index) => index !== teamIndex);
                
                return updatedTeams;
              }
              return prevNewTeams;
            });
          }

          // update existing teams list
          setTeamList((prevNewTeams) => {
            const teamIndex = prevNewTeams.findIndex(
              (existingTeam) => existingTeam.Name === prevName
            );
            let updatedList;
            if (teamIndex !== -1) {
              updatedList = [
                ...prevNewTeams.slice(0, teamIndex),
                team,
                ...prevNewTeams.slice(teamIndex + 1),
              ];
            } else {
              updatedList = [...prevNewTeams, team];
            }
            return objectArraySort(updatedList, "Name");
          });
        }
        setPrevText("");
      } catch (error: any) {
        toast.error(error);
        return false;
      }
    } else {
      return false;
    }
    return true;
  };

  const onTeamDelete = async (team: any) => {
    _dirtyValidationService.markFieldAsDirty("inputName");
    let deletePendingTeam: TeamDto = {
      Id: team.Id,
      Name: team.Name,
      ChallengesId: challengeId,
      ConcurrencyKey: "",
      CreatedOn: "",
      LastUpdatedOn: "",
    };

    setDeletingTeam(deletePendingTeam);
    const res = await _teamService.checkForTeamMembers(team.Id);
    setTeamHasMembers(res.hasMembers);
    // Open the modal
    setIsDeleteConfirmationModalOpen(true);
  };

  const deleteTeam = async () => {
    setIsDeleteConfirmationModalOpen(false);

    try {
      const isInNewTeamList = newTeams.some(
        (newTeam) => newTeam.Name === deletingTeam.Name
      );

      if (isInNewTeamList) {
        const updatedNewTeamList = newTeams.filter(
          (newTeam) => newTeam.Name !== deletingTeam.Name
        );
        setNewTeams(updatedNewTeamList);
      } else {
        deletePendingTeams.push(deletingTeam);
        setDeletePendingTeams(deletePendingTeams);
      }
      const updatedTeamList = teamList.filter(
        (existingTeam) => existingTeam.Name !== deletingTeam.Name
      );
      setTeamList(updatedTeamList);
    } catch (error) {
      toast.error("Error occured when deleting.");
    }
  };

  const closeDeleteConfirmationModal = () => {
    setIsDeleteConfirmationModalOpen(false);
    setDeletingTeam(null);
  };

  const handleMouseLeave = async (e: any) => {
    if(e.target.value != "" && (prevText == "" ? true : e.target.value != prevText)){
      e.stopPropagation();
      e.preventDefault();
      e.target.blur();
      let response = await onSave({ Id: 0, newText: e.target.value  });
      if (response) {
        setText("");
      }
    }
  };

  const onInputChange = (e: any) => {
    _dirtyValidationService.markFieldAsDirty("inputName");
    const newText = e.target.value;
    setText(newText);
  };

  const onSubmit = async () => {
    try {
      setShowSavingLoader(true);
      // Update teams
      const response = await _teamService.updateTeams(
        challengeId,
        newTeams,
        editTeams,
        deletePendingTeams
      );

      if (response) {
            toast.success("Saved successfully.");
            setShowSavingLoader(false);

            // Fetch teams data
            const data = await _teamService.getTeamsByChallengeId(challengeId);

            if (data) {
                // Update state with the new teams data
                setTeamList(objectArraySort(data, "Name"));
                setEditableTeamList(objectArraySort(data, "Name"));
            }

            // Reset state values
            setText("");
            setEditTeams([]);
            setNewTeams([]);
            setDeletePendingTeams([]);
      }
    } catch (error: any) {
      setShowSavingLoader(false);
      toast.error(error.message);
    }

    _dirtyValidationService.resetAll();

  };

  const handleCancel = async () => {
    if (await _dirtyValidationService.canCancelDirtyView()) {
      setEditTeams([]);
      setNewTeams([]);
      setDeletePendingTeams([]);
      setTeamList(editableTeamList);
      _dirtyValidationService.resetAll();
    }
  };

  const isFormDirty = () => {
    return (
      editTeams.length > 0 ||
      newTeams.length > 0 ||
      deletePendingTeams.length > 0
    );
  };

  return (
    <>
      <LoadingScreen showLoadPopup={showSavingLoader} />
      {teamList.map((tn, index) => (
        <React.Fragment key={index}>
          <p className="team-numbering">{index + 1}.</p>
          <AddEditInputBox
            data={{ text: `${tn.Name}`, ...tn }}
            onDelete={onTeamDelete}
            onSave={onSave}
            readOnly={true} 
            length={50}
          />
        </React.Fragment>
      ))}

      <p className="team-numbering" style={{ color: "#ffffff" }}></p>
      <InputGroup className={`custom-inputGroup solid-border-box`}>
        <Form.Control
          type="text"
          value={text}
          maxLength={50}
          placeholder={"Enter a new team"}
          onChange={(e) => onInputChange(e)}
          readOnly={false}
          onMouseLeave={handleMouseLeave}
          className="no-border custom-input"
        />
      </InputGroup>

      <ModalComponent
        isOpen={isDeleteConfirmationModalOpen}
        onClose={closeDeleteConfirmationModal}
        headerRequired={true}
        title="Confirmation!"
      >
        <Row
          className="mb-3 justify-content-left modal-body-content"
          lg="auto"
          md="auto"
          sm="auto"
          xl="auto"
          xxl="auto"
          xs="auto"
        >
          <Col>
            <FontAwesomeIcon
              icon={icon({ name: "circle-exclamation" })}
              beatFade={teamHasMembers}
              size="xl"
              style={{ color: "#dbc533" }}
            />
          </Col>
          <Col style={{ paddingLeft: "0px" }}>
            <p style={{ fontSize: "18px" }}>
              {teamHasMembers ? (
                <span>
                  The team{" "}
                  <b>
                    <i>{deletingTeam ? deletingTeam.Name : ""}</i>
                  </b>{" "}
                  is already assigned with team members. Do you wish to delete?
                </span>
              ) : (
                <span>
                  You are going to delete the team{" "}
                  <b>
                    <i>{deletingTeam ? deletingTeam.Name : ""}</i>
                  </b>
                  .
                </span>
              )}
            </p>
          </Col>
        </Row>
        <Row
          className="justify-content-right"
          lg="auto"
          md="auto"
          sm="auto"
          xl="auto"
          xxl="auto"
          xs="auto"
        >
          <Col className="p-0">
            <Button
              onClick={() => {
                closeDeleteConfirmationModal();
              }}
              variant="secondary"
              className="confirm-cancel-btn"
              size="sm"
            >
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => {
                deleteTeam();
              }}
              className="confirm-delete-btn"
              size="sm"
            >
              Delete
            </Button>
          </Col>
        </Row>
      </ModalComponent>

      <Row className="mt-5">
        <Col>
          <Button
            variant="success"
            id="saveBtn"
            onClick={onSubmit}
            disabled={!isFormDirty()}
            className="save-button"
          >
            Save
          </Button>{" "}
          <Button
            variant="secondary"
            id="cancelBtn"
            onClick={handleCancel}
            disabled={!isFormDirty()}
            className="cancel-btn"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Teams;