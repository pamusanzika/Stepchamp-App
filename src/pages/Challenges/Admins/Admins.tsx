import { useEffect, useState } from "react";
import DirtyValidationService from "../../../services/services-common/DirtyValidationService";
import UserService from "../../../services/services-domain/UserService";
import ChallengeAdminService from "../../../services/services-domain/ChallengeAdminService";
import { Button, Col, Row } from "react-bootstrap";
import AddDeleteInpputBox from "../../../components/features/AddDeleteInputBox/AddDeleteInputBox";
import { UserDto } from "../../../Dto/UserDto";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Admins.scss';
import LoadingScreen from "../../../components/features/LoadingScreen/LoadingScreen";
import { LocalStorageKeys } from "../../../utils/constants";
import React from "react";

function Admins(props: { challengeId?: number}) {
    const challengeId = props.challengeId;
    const _dirtyValidationService = DirtyValidationService.getInstance();
    const _userService = new UserService();
    const _challengeAdminService = new ChallengeAdminService();

    const [inputValue, setInputValue] = useState('');
    const [allAdmins, setAllAdmins] = useState<UserDto[]>([]);
    const [challengeAdmins, setChallengeAdmins] = useState<UserDto[]>([]);
    const [editableChallengeAdmins, setEditableChallengeAdmins] = useState<UserDto[]>([]);
    const [availableAdmins, setAvailableAdmins] = useState<UserDto[]>([]);
    const [ediatbleAvailableAdmins, setEditableAvailableAdmins] = useState<UserDto[]>([]);
    const [suggestions, setSuggestions] = useState<UserDto[]>([]);
    const [userData, setUserData] = useState(null as any);
    const [showLoadPopup, setShowLoadPopup] = useState(true);

    const onInputChange = (text: any) => {
        if (text === '' || text === null || text === undefined) {
            _dirtyValidationService.markFieldAsUndirty('inputValue');
        } else {
            _dirtyValidationService.markFieldAsDirty('inputValue');
        }
        setInputValue(text);
        if (text.length > 2) {
            const filteredSuggestions = getSuggestions(text);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }

    const getSuggestions = (input: any) => {
        return ediatbleAvailableAdmins.filter((admin: any) => admin.Email.toLowerCase().includes(input.toLowerCase()) || admin.Name.toLowerCase().includes(input.toLowerCase()) );
    }

    const onSave = (newEmail = null) => {
        let emailToSave = newEmail ?? inputValue;
        if (!(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(emailToSave))) {
            toast.error('Please add a valid Email');
            setInputValue('');
            setSuggestions([]);
            _dirtyValidationService.markFieldAsUndirty('inputValue');
        } else {
            let newAdmin: UserDto = {
                Id: 0,
                Email: "",
                Name: "",
                IsActive: 0,
                AccessLevel: "",
                LastLogOn: "",
                ConcurrencyKey: "",
                CreatedOn: "",
                LastUpdatedOn: ""
            };
            let found = ediatbleAvailableAdmins.find(item => item.Email === emailToSave);
            if (found) {
                newAdmin = found;
                let index = ediatbleAvailableAdmins.findIndex(item => item.Email === emailToSave);
                ediatbleAvailableAdmins.splice(index, 1);
                setEditableAvailableAdmins([...ediatbleAvailableAdmins]);
            } else {
                newAdmin.Email = emailToSave;
            }
            editableChallengeAdmins.push(newAdmin);
            setEditableChallengeAdmins([...editableChallengeAdmins]);
            if (isFormDirty()) {
                _dirtyValidationService.markFieldAsDirty('adminList');
            } else {
                _dirtyValidationService.markFieldAsUndirty('adminList');
            }
            setInputValue('');
            setSuggestions([]);
            _dirtyValidationService.markFieldAsUndirty('inputValue');
        }
    }

    const onDelete = (index: any) => {
        let deletingadmin = editableChallengeAdmins[index];
        let found = allAdmins.find(item => item.Id === deletingadmin.Id);
        if (found) {
            ediatbleAvailableAdmins.push(deletingadmin);
            setEditableAvailableAdmins([...ediatbleAvailableAdmins]);
        }
        editableChallengeAdmins.splice(index, 1);
        setEditableChallengeAdmins([...editableChallengeAdmins]);
        if (isFormDirty()) {
            _dirtyValidationService.markFieldAsDirty('adminList');
        } else {
            _dirtyValidationService.markFieldAsUndirty('adminList');
        }
    }

    const onCancel = () => {
        setInputValue('');
        setSuggestions([]);
        _dirtyValidationService.markFieldAsUndirty('inputValue');
    }

    const onSubmit = () => {
        setShowLoadPopup(true);
        let newAdmins = editableChallengeAdmins.filter((admin) => {
            return !challengeAdmins.some(item => item.Email === admin.Email);
        });
        let deletedAdmins = challengeAdmins.filter((admin) => {
            return !editableChallengeAdmins.some(item => item.Email === admin.Email)
        })
        _challengeAdminService.updateChallengeAdmins(challengeId, newAdmins, deletedAdmins).then((response: any) => {
            refreshList();
            toast.success("Saved successfully.");
        }).catch ((error) => {
            setShowLoadPopup(false);
            toast.error("Save failed");
        });
        _dirtyValidationService.resetAll();
    }

    const handleCancel = async () => {
        if (await _dirtyValidationService.canCancelDirtyView()) {
            setInputValue('');
            setEditableChallengeAdmins([...challengeAdmins]);
            setEditableAvailableAdmins([...availableAdmins]);
            setSuggestions([]);
            _dirtyValidationService.resetAll();
        }
    }

    const handleOptionClick = (email: any) => {
        setInputValue(email);
        onSave(email);
        setSuggestions([]);
    }

    const isFormDirty = () => {
        return !(JSON.stringify(editableChallengeAdmins) === JSON.stringify(challengeAdmins));
    }

    const refreshList = () => {
        let cAdmins: UserDto[] = [];
      
        _challengeAdminService.getAdminsByChallengeId(challengeId).then((response: any) => {
            cAdmins = response;
            setChallengeAdmins(response);
            setEditableChallengeAdmins([...cAdmins]);
      
            _userService.getAllAdmins().then((adminResponse: any) => {
                setAllAdmins(adminResponse);
                let filtered = adminResponse.filter((admin: any) => {
                    return !cAdmins.some(item => item.Id === admin.Id);
                });
                setAvailableAdmins(filtered);
                setEditableAvailableAdmins([...filtered]);
                setShowLoadPopup(false);
            }).catch((error) => {
                toast.error("Error in fetching Admins list.")
            });
        }).catch((error) => {
            toast.error("Error in fetching Challenge Admins list.")
        });  
    }

    useEffect(() => {
        _dirtyValidationService.resetAll();
        let userString = localStorage.getItem(LocalStorageKeys.user);
        setUserData(userString && JSON.parse(userString));
        refreshList();
    }, [challengeId]);

    return (
        <>
            <p>Admins can configure and view step challenge progress.</p>&nbsp;
            {editableChallengeAdmins.length > 0 && editableChallengeAdmins.map((admin: any, index) => (
                <React.Fragment key={index}>
                    <div>
                        <p className="admin-numbering">{index + 1}.</p>
                        <AddDeleteInpputBox  data={{text:`${admin.Name ? admin.Name : ''} (${admin.Email})`, ...admin}} onDelete={() => onDelete(index)} onSave={onSave} hidden={admin.Email === userData.Email} key={index} readOnly={true} />
                    </div>
                </React.Fragment>
            ))}
            <p className="admin-numbering" style={{ color: "#ffffff" }}></p><AddDeleteInpputBox data={{text:inputValue}} type="email" onInputChange={onInputChange} onSave={onSave} onCancel={onCancel} placeHolder="Email address or name" readOnly={false} />
            {suggestions.length > 0 && (
                <>
                    <p className="admin-numbering" style={{ color: "#ffffff" }}></p>
                    <Col xs={6} className="mb-3 suggestion-box">
                    {suggestions.map((suggestion: any, index) => (
                        <option key={index} onClick={() => handleOptionClick(suggestion.Email)} className="option-item">{suggestion.Name} ({suggestion.Email})</option>
                    ))}
                    </Col>
                </>
            )}
            <Row className="mt-5">
                <Col>
                    <Button variant="success" id="saveBtn" onClick={onSubmit} disabled={!isFormDirty()} className="save-button">Save</Button>{' '}
                    <Button variant="secondary" id="cancelBtn" onClick={handleCancel} disabled={!isFormDirty()} className="cancel-btn">Cancel</Button>
                </Col>
            </Row>
            <LoadingScreen showLoadPopup={showLoadPopup} />
        </>
    )
}

export default Admins;