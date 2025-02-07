import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faCirclePlus, faSortAsc, faSortDesc, faSort, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./ManageUsers.scss";
import UserService from "../../services/services-domain/UserService";
import LoadingScreen from "../../components/features/LoadingScreen/LoadingScreen";
import DirtyValidationService from "../../services/services-common/DirtyValidationService";
import Alert from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../../components/features/PaginationComponent/PaginationComponent";
import ContractService from "../../lib/contractService";
import DateService from "../../services/services-common/DateService";
import { LocalStorageKeys } from "../../utils/constants";
import { toast } from "react-toastify";

function ManageUsers() {
  let _userService = new UserService();
  let _dateService = DateService.getInstance();
  const dirtyValidationService = DirtyValidationService.getInstance();
  const [userData, setUserData] = useState(null as any);
  const [usersList, setUsersList] = useState([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAddUserPopup, setshowAddUserPopup] = useState(false);
  const [showDeletePopup, setshowDeletePopup] = useState(false);
  const [showLoadPopup, setShowLoadPopup] = useState(true);
  const [formData, setFormData] = useState(null as any);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState(null);
  const [noOfPages, setNoOfPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);
  const navigate = useNavigate();
  const toast1 = toast

  const onPageChange = async (pageNo: any) => {
    setShowLoadPopup(true);
    refreshList(pageNo);
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (value === formData.name || value === '') {
      dirtyValidationService.markFieldAsUndirty(name);
    } else {
      if(name === "Email") {
        validateEmail(value);
      }
      dirtyValidationService.markFieldAsDirty(name);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSort = (columnName: any) => {
    if (columnName === sortColumn) {
      setSortOrder (sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortOrder('asc');
    }
  }

  const sortData = (data: any[]) => {
    if (sortColumn) {
      return data.slice().sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
  
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }
    return data;
  }

  const isFormDirty = () => {
    return (
      dirtyValidationService.isDirty()
    );
  };

  const handleClosePopup = () => {
    setShowEditPopup(false);
    setshowAddUserPopup(false);
    setshowDeletePopup(false);
    setFormData(null);
    dirtyValidationService.resetAll();
    setIsEmailInvalid(false);
  };

  const handleAddUserClick = () => {
    setFormData({AccessLevel:"Admin"});
    setshowAddUserPopup(true);
  };

  const submitAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!isEmailInvalid) {
      setShowLoadPopup(true);
      _userService.AddUser(formData)
        .then(() => {
          refreshList(currentPage);
        })
        .catch(async (error) => {
          setShowLoadPopup(false);
          await Alert.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'User already exists.',
            confirmButtonColor: 'red',
            iconColor: 'red'
          });
      });
      handleClosePopup();
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    setIsEmailInvalid(email.length > 0 ? !emailRegex.test(email): false);
    return emailRegex.test(email);
  }

  const handleEditUserClick = (user: any) => {
     setFormData(user);
    setShowEditPopup(true);
  };

  const submitUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowLoadPopup(true);
    _userService.updateUserRole(formData.Id, formData.AccessLevel, formData.ConcurrencyKey)
      .then(() => {
        refreshList(currentPage);
      });
    handleClosePopup();
  };

  const handleDeleteUserClick = (user: any) => {
    setFormData(user);
    setshowDeletePopup(true);
  };

  const submitDeleteUser = async () => {
    setShowLoadPopup(true);
    _userService.DeleteUser(formData)
      .then(() => {
        refreshList(currentPage);
      });
    handleClosePopup();
  };

  const checkAccess = () => {
    let user: any = localStorage.getItem(LocalStorageKeys.user);
    const userJson = JSON.parse(user);
    if (userJson == null || userJson.AccessLevel !== 'SysAdmin') {
      setShowLoadPopup(false);
      Alert.fire({
        icon: 'error',
        title: 'Oops...',
        text: "You don't have access to this page!",
        confirmButtonColor: '#23d856',
      }).then((result) => {
        if (result.isConfirmed) {
          handleClosePopup();
          navigate(`/`);
        }
      });
    } else {
      setUserData(JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem(LocalStorageKeys.user)))));
      refreshList(1);
    }
  }

  const refreshList = (pageNo: any) => {
    const fetchData = (pageNo: any) => {
        _userService.getAllActiveUsers(pageNo).then(response => {
          if (response) {
            setUsersList(response.data);
            setNoOfPages(response.totalPages);
            setCurrentPage(response.page);
            setShowLoadPopup(false);
          } else {
            setShowLoadPopup(false);
          }
          dirtyValidationService.resetAll();
        }).catch((error: any) => {
          setShowLoadPopup(false);
          dirtyValidationService.resetAll();
        });
    };

    const waitForContract = () => {
      let scConStatus = localStorage.getItem("sc-con-status");
      
      if (scConStatus === null) {
        ContractService.getInstance()
        .init()
        .then( (isConnected: boolean) => {
          localStorage.setItem("sc-con-status", isConnected.toString());
          if (isConnected) {
            fetchData(pageNo);
          } else {
            setShowLoadPopup(false);
            Alert.fire({
              icon: 'error',
              title: 'Oops...',
              text: "Something went wrong!",
              confirmButtonColor: '#23d856',
            }).then((result) => {
              if (result.isConfirmed) {
                handleClosePopup();
                navigate(`/`);
              }
            });
          }
        });
      } else if (scConStatus === "true") {
        fetchData(pageNo);
      } else {
        setShowLoadPopup(false);
        Alert.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Something went wrong!",
          confirmButtonColor: '#23d856',
        }).then((result) => {
          if (result.isConfirmed) {
            handleClosePopup();
            navigate(`/`);
          }
        });
      }
    };

    waitForContract();
  }

  useEffect(() => {
    checkAccess();
  }, []);

  return (
    <div>
      <LoadingScreen showLoadPopup={showLoadPopup} />
      <div className="d-flex flex-column">
        <div className="d-flex justify-content-between mb-2">
          <div><h2>Manage Users</h2></div>
          <OverlayTrigger
            placement="bottom"
            overlay={
            <Tooltip>Add User</Tooltip> 
            }
          >
            <FontAwesomeIcon
              icon={faCirclePlus}
              size="2xl"
              className="add-icon fa-border-all"
              onClick={() => handleAddUserClick()}
            />
          </OverlayTrigger>
        </div>

        {/* Users Table */}
        <div className="table-responsive rounded-3">
          <Table striped>
            <thead>
              <tr>
                <th onClick={() => handleSort('Email')}>
                  Login&nbsp;
                  {sortColumn === 'Email' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                  {sortColumn === 'Email' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                  {sortColumn !== 'Email' && <FontAwesomeIcon icon={faSort} />}
                </th>
                <th onClick={() => handleSort('Name')}>
                  Name&nbsp;
                  {sortColumn === 'Name' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                  {sortColumn === 'Name' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                  {sortColumn !== 'Name' && <FontAwesomeIcon icon={faSort} />}
                </th>
                <th onClick={() => handleSort('AccessLevel')}>
                  Access Level&nbsp;
                  {sortColumn === 'AccessLevel' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                  {sortColumn === 'AccessLevel' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                  {sortColumn !== 'AccessLevel' && <FontAwesomeIcon icon={faSort} />}
                </th>
                <th onClick={() => handleSort('LastLogOn')}>
                  Last Login&nbsp;
                  {sortColumn === 'LastLogOn' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                  {sortColumn === 'LastLogOn' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                  {sortColumn !== 'LastLogOn' && <FontAwesomeIcon icon={faSort} />}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortData(usersList).map((user: any) => (
                <tr key={user.Id}>
                  <td>{user.Email}</td>
                  <td>
                    {user.Name ? user.Name : "-"}
                  </td>
                  <td>{user.AccessLevel}</td>
                  <td>
                    {(user.LastLogOn && user.LastLogOn !== '') ? _dateService.getThemedTimeStamp(user.LastLogOn) : '-'}
                  </td>
                  <td>
                    <div hidden={user.Email === userData.Email}>
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip>Edit</Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          className="edit-icon"
                          icon={faPenToSquare}
                          onClick={() => handleEditUserClick(user)}
                        />
                      </OverlayTrigger>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip>Delete</Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faXmark}
                          className="delete-icon"
                          size="lg"
                          onClick={() => handleDeleteUserClick(user)}
                        />
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {(noOfPages && noOfPages > 1) ?
          <PaginationComponent noOfPages={noOfPages} onPageChange={onPageChange} currentPage={currentPage}/> : ''
        }

        {/* Add new User */}
        <Modal
          show={showAddUserPopup}
          onHide={handleClosePopup}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New User</Modal.Title>
          </Modal.Header>
          <Form onSubmit={submitAddUser}>
            <Modal.Body>
              <div className="custom-modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="login">Login Email:</label>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="form-group">
                      <Form.Control
                        type="text"
                        className="form-control"
                        id="login"
                        name="Email"
                        required
                        onChange={handleChange}
                      />
                    </div>
                    { isEmailInvalid ? <p className="email-invalid-error-text">Invalid Email address</p> : <></>}
                    
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="access-Level">Access Level:</label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <Form.Select
                      aria-label="access-Level"
                      name="AccessLevel"
                      onChange={handleChange}
                      defaultValue={formData ? formData.AccessLevel : ""}
                    >
                      <option value="Admin">Admin</option>
                      <option value="SysAdmin">Sys Admin</option>
                    </Form.Select>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" className="cancel-btn" onClick={handleClosePopup}>
                Close
              </Button>
              <Button variant="success" type="submit" className="save-btn" disabled={!isFormDirty() || isEmailInvalid}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Edit User */}
        <Modal
          show={showEditPopup}
          onHide={handleClosePopup}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit User {formData ? formData.Name !== 'NULL' ? formData.Name : '' : ""}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={submitUpdateUser}>
            <Modal.Body>
              <div className="custom-modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="login">Login Email:</label>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        id="login"
                        name="Email"
                        value={formData ? formData.Email : ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="access-Level">Access Level:</label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <Form.Select
                      aria-label="access-Level"
                      name="AccessLevel"
                      onChange={handleChange}
                      defaultValue={formData ? formData.AccessLevel : ""}
                    >
                      <option value="Admin">Admin</option>
                      <option value="SysAdmin">Sys Admin</option>
                    </Form.Select>
                  </div>
                </div>
                <div className="row" hidden>
                  <div className="col-md-8">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        id="login"
                        name="ConcurrencyKey"
                        value={formData ? formData.ConcurrencyKey : ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" className="cancel-btn" onClick={handleClosePopup}>
                Close
              </Button>
              <Button variant="success" type="submit" className="save-btn" disabled={!isFormDirty()}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete User */}
        <Modal
          show={showDeletePopup}
          onHide={handleClosePopup}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Are you sure you want to delete user {formData ? formData.Name !== 'NULL' ? formData.Name : '' : ""}?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="custom-modal-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="login">Login Email:</label>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="login"
                      name="Email"
                      readOnly
                      value={formData ? formData.Email : ""}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="access-Level">Access Level:</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    id="access-Level"
                    readOnly
                    name="Name"
                    value={formData ? formData.AccessLevel : ""}
                  />
                </div>
              </div>
              <div className="row" hidden>
                <div className="col-md-8">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="login"
                      name="ConcurrencyKey"
                      value={formData ? formData.ConcurrencyKey : ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="cancel-btn" onClick={handleClosePopup}>
              Close
            </Button>
            <Button variant="danger" className="delete-btn" onClick={submitDeleteUser}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ManageUsers;
