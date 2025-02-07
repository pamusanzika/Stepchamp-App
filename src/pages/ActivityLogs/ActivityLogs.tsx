import { useEffect, useState } from "react";
import LoadingScreen from "../../components/features/LoadingScreen/LoadingScreen";
import ContractService from "../../lib/contractService";
import ActivityLogsService from "../../services/services-domain/ActivityLogsService";
import Alert from 'sweetalert2';
import { ErrorResponse, useNavigate } from "react-router-dom";
import { Button, Col, Container, Form, OverlayTrigger, Row, Table, Tooltip } from "react-bootstrap";
import DateService from "../../services/services-common/DateService";
import PaginationComponent from "../../components/features/PaginationComponent/PaginationComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortAsc, faSortDesc } from "@fortawesome/free-solid-svg-icons";
import DirtyValidationService from "../../services/services-common/DirtyValidationService";
import './ActivityLogs.scss'
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";

function ActivityLogs() {
  let _activityLogsService = new ActivityLogsService();
  const _dirtyValidationService = DirtyValidationService.getInstance();
  let _dateService = DateService.getInstance();
  const dateObj = new Date();
  const today = new Date();

  type ActivityLog = {
    Id: number;
    ActivityType: string;
    User: string;
    Service: string;
    Action: string;
    Message: string;
    ExceptionMessage: string;
    TimeStamp: string;
  }

  const convertDateToString = (date: Date) => {
    return date.toISOString().slice(0, 10);
  }

  // Add two days as activity logs showing period.
  const calculateStartDate = (date: Date) => {
    let sDate = new Date(date.setDate(date.getDate() - 2));
    return convertDateToString(sDate);
  }
  const calculateEndDate = (date: Date) => {
    let eDate = new Date(date.setDate(date.getDate() + 2));
    return convertDateToString(eDate);
  }

  const [showLoadPopup, setShowLoadPopup] = useState(true);
  const [activityLogsList, setActivityLogsList] = useState<ActivityLog[]>([]);
  const [filteredActivityLogsList, setFilteredActivityLogsList] = useState<ActivityLog[]>([]);
  const [noOfPages, setNoOfPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState(null);
  const calculatedStartDate = calculateStartDate(dateObj);
  const [searchName, setSearchName] = useState('');
  const [startDate, setStartDate] = useState(calculatedStartDate);
  const [endDate, setEndDate] = useState(convertDateToString(today));
  const [searchType, setSearchType] = useState('');
  const navigate = useNavigate();


  const onPageChange = async (pageNo: any) => {
    setShowLoadPopup(true);
    refreshList(pageNo);
  }

  const handleSort = (columnName: any) => {
    if (columnName === sortColumn) {
      setSortOrder (sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortOrder('asc');
    }
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const chosendate = new Date(newValue);

    if (newValue !== '') {
      if (newValue === startDate) {
        _dirtyValidationService.markFieldAsUndirty('startDate');
        _dirtyValidationService.markFieldAsUndirty('endDate');
      } else {
        _dirtyValidationService.markFieldAsDirty('startDate');
        _dirtyValidationService.markFieldAsDirty('endDate');
      }
      setStartDate(newValue);
      setEndDate(calculateEndDate(chosendate));
    } else {
      if (newValue === calculatedStartDate) {
        _dirtyValidationService.markFieldAsUndirty('startDate');
      } else {
        _dirtyValidationService.markFieldAsDirty('startDate');
      }
      setStartDate(newValue);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === endDate) {
      _dirtyValidationService.markFieldAsUndirty('endDate');
    } else {
      _dirtyValidationService.markFieldAsDirty('endDate');
    }

    setEndDate(newValue);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === null || newValue === undefined || newValue === '') {
      _dirtyValidationService.markFieldAsUndirty('searchType');
    }
    else {
      _dirtyValidationService.markFieldAsDirty('searchType');
    }
    setSearchType(newValue);
  }

  const handleSearchNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === null || newValue === undefined || newValue === '') {
      _dirtyValidationService.markFieldAsUndirty('searchName');
    }
    else {
      _dirtyValidationService.markFieldAsDirty('searchName');
    }
    setSearchName(newValue);
  };

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
  };

  const fetchData = async (pageNo: any, defaultFilter: any = null) => {
    let filter = {};
    if (defaultFilter) {
      filter = defaultFilter;
    } else {
      filter = {
        name: searchName.toLowerCase(),
        type: searchType,
        startDate: startDate,
        endDate: endDate
      };
    }

    try {
      const response = await _activityLogsService.getActivityLogs(pageNo, filter)
      if (response) {
        setActivityLogsList(response.data);
        setFilteredActivityLogsList(response.data);
        setNoOfPages(response.totalPages);
        setCurrentPage(response.page);
        setShowLoadPopup(false);
      } else {
        setShowLoadPopup(false);
      }
    } catch (error) {
      setShowLoadPopup(false);
      console.error("Error fetching data:", error);
    }
  };

  const refreshList = async (pageNo: any) => {
    const scConStatus = localStorage.getItem("sc-con-status");
    if (scConStatus === null) {
      ContractService.getInstance()
      .init()
      .then(async (isConnected: boolean) => {
        localStorage.setItem("sc-con-status", isConnected.toString());
        if (isConnected) {
          fetchData(pageNo);
        } else {
          setShowLoadPopup(false);
          await Alert.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Something went wrong!",
            confirmButtonColor: '#23d856',
          }).then((result) => {
            if (result.isConfirmed) {
              navigate(`/`);
            }
          });
        }
      });
    } else if (scConStatus === "true") {
        await fetchData(pageNo);
      } else {
        setShowLoadPopup(false);
        await Alert.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Something went wrong!",
          confirmButtonColor: '#23d856',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/`);
          }
        });
      }
  }

  const isFormDirty = () => {
    if (searchName !== '' || (searchType !== '' && searchType !== 'ALL') || startDate !== calculatedStartDate || endDate !== convertDateToString(today)) {
      return true;
    } else {
      return false;
    }
  }
  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchData(1);
    _dirtyValidationService.resetAll();
  }

  const handleClearFilters = () => {
    setSearchName('');
    setSearchType('');
    setStartDate(calculatedStartDate);
    setEndDate(convertDateToString(today));
    let defaultFilter = {
      name: '',
      type: '',
      startDate: calculatedStartDate,
      endDate: convertDateToString(today)
    };
    fetchData(1, defaultFilter);
    _dirtyValidationService.resetAll();
  }

  useEffect(() => {
    refreshList(1);
  }, []);

  return (
    <>
      <LoadingScreen showLoadPopup={showLoadPopup} />
      <Container fluid className="bg-white rounded">
        <Form onSubmit={handleFilter}>
          <Row className="p-4">
            <Col className="col-4">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type="text"
                id="name"
                className="input-control"
                placeholder="Search by user's name or email"
                value={searchName}
                maxLength={50}
                onChange={handleSearchNameChange}
              />
            </Col>
            <Col className="col-2">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={searchType}
                onChange={handleTypeChange}
              >
                <option defaultChecked>ALL</option>
                <option style={{ color: "#23d856" }}>INFO</option>
                <option style={{ color: "red" }}>ERROR</option>
                <option style={{ color: "orange" }}>WARNING</option>
                <option style={{ color: "blue" }}>AUDIT</option>
              </Form.Control>
            </Col>
            <Col className="col-2">
            <Form.Label>From</Form.Label>
              <Form.Control
                type="date"
                id='startDate'
                value={startDate}
                onChange={handleStartDateChange}
              />
            </Col>
            <Col className="col-2">
            <Form.Label>To</Form.Label>
              <Form.Control 
                type="date"
                id="endDate"
                value={endDate}
                min={startDate}
                onChange={handleEndDateChange}
              />
            </Col>
            <Col className="col-2 d-flex align-items-center justify-content-evenly">
              <Button
                type="submit"
                variant="success"
                className="filter-button"
                id="filterButton"
                disabled={!_dirtyValidationService.isDirty()}
              >
                Filter
              </Button>
              <Button
                variant="success"
                className="clear-button"
                id="clearButton"
                onClick={handleClearFilters}
                disabled={!isFormDirty()}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
      <br />
      <Container fluid className="bg-white rounded">
        <Table striped responsive>
          <thead>
            <tr>
              <th onClick={() => handleSort("TimeStamp")}>
                Created&nbsp;
                {sortColumn === "TimeStamp" && sortOrder === "asc" && (
                  <FontAwesomeIcon icon={faSortAsc} />
                )}
                {sortColumn === "TimeStamp" && sortOrder === "desc" && (
                  <FontAwesomeIcon icon={faSortDesc} />
                )}
                {sortColumn !== "TimeStamp" && (
                  <FontAwesomeIcon icon={faSort} />
                )}
              </th>
              <th onClick={() => handleSort("ActivityType")}>
                Type&nbsp;
                {sortColumn === "ActivityType" && sortOrder === "asc" && (
                  <FontAwesomeIcon icon={faSortAsc} />
                )}
                {sortColumn === "ActivityType" && sortOrder === "desc" && (
                  <FontAwesomeIcon icon={faSortDesc} />
                )}
                {sortColumn !== "ActivityType" && (
                  <FontAwesomeIcon icon={faSort} />
                )}
              </th>
              <th onClick={() => handleSort("User")} style={{width: '33%'}}>
                User&nbsp;
                {sortColumn === "User" && sortOrder === "asc" && (
                  <FontAwesomeIcon icon={faSortAsc} />
                )}
                {sortColumn === "User" && sortOrder === "desc" && (
                  <FontAwesomeIcon icon={faSortDesc} />
                )}
                {sortColumn !== "User" && <FontAwesomeIcon icon={faSort} />}
              </th>
              <th onClick={() => handleSort("Message")}>
                Message&nbsp;
                {sortColumn === "Message" && sortOrder === "asc" && (
                  <FontAwesomeIcon icon={faSortAsc} />
                )}
                {sortColumn === "Message" && sortOrder === "desc" && (
                  <FontAwesomeIcon icon={faSortDesc} />
                )}
                {sortColumn !== "Message" && <FontAwesomeIcon icon={faSort} />}
              </th>
              <th onClick={() => handleSort("Service")}>
                Service&nbsp;
                {sortColumn === "Service" && sortOrder === "asc" && (
                  <FontAwesomeIcon icon={faSortAsc} />
                )}
                {sortColumn === "Service" && sortOrder === "desc" && (
                  <FontAwesomeIcon icon={faSortDesc} />
                )}
                {sortColumn !== "Service" && <FontAwesomeIcon icon={faSort} />}
              </th>
              <th onClick={() => handleSort("Action")}>
                Action&nbsp;
                {sortColumn === "Action" && sortOrder === "asc" && (
                  <FontAwesomeIcon icon={faSortAsc} />
                )}
                {sortColumn === "Action" && sortOrder === "desc" && (
                  <FontAwesomeIcon icon={faSortDesc} />
                )}
                {sortColumn !== "Action" && <FontAwesomeIcon icon={faSort} />}
              </th>
            </tr>
          </thead>
          <tbody>
            {activityLogsList && activityLogsList.length > 0 ? (
              filteredActivityLogsList.length > 0 ? (
                sortData(filteredActivityLogsList).map((activityLog: any) => (
                  <tr key={activityLog.Id}>
                    <td>{_dateService.getThemedTimeStamp(activityLog.TimeStamp)}</td>
                    {(() => {
                      switch (activityLog.ActivityType) {
                        case "INFO":
                          return (
                            <td style={{ color: "#23d856" }}>
                              {activityLog.ActivityType}
                            </td>
                          );
                        case "ERROR":
                          return (
                            activityLog.ExceptionMessage !== 'NULL' ? (
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-top-${activityLog.Id}`}>
                                    {activityLog.ExceptionMessage}
                                  </Tooltip>
                                }
                              >
                                <td style={{ color: "red" }}>
                                  {activityLog.ActivityType} {activityLog.ActivityType === 'ERROR' ? (<FontAwesomeIcon icon={solid("circle-exclamation")} />) : ''}
                                </td>
                              </OverlayTrigger>
                            ) : (
                              <td style={{ color: "red" }}>
                                {activityLog.ActivityType} {activityLog.ActivityType === 'ERROR' ? (<FontAwesomeIcon icon={solid("circle-exclamation")} />) : ''}
                              </td>
                            )
                          );
                        case "AUDIT":
                          return (
                            activityLog.ExceptionMessage !== 'NULL' ? (
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-top-${activityLog.Id}`}>
                                    {activityLog.ExceptionMessage}
                                  </Tooltip>
                                }
                              >
                                <td style={{ color: "blue" }}>
                                  {activityLog.ActivityType}
                                </td>
                              </OverlayTrigger>
                            ) : (
                              <td style={{ color: "blue" }}>
                                {activityLog.ActivityType}
                              </td>
                            )
                          );
                        case "WARNING":
                          return (
                            <td style={{ color: "orange" }}>
                              {activityLog.ActivityType}
                            </td>
                          );
                        default:
                          break;
                      }
                    })()}
                    <td>{activityLog.User}</td>
                    <td>{activityLog.Message}</td>
                    <td>{activityLog.Service}</td>
                    <td>{activityLog.Action}</td>
                  </tr>
                ))
              ) : (
                <tr>
                <td colSpan={6} style={{ color: "#23d856", textAlign: 'center' }}>No activity logs available for selected filters!</td>
              </tr>
              )
            ) : (
              <tr>
                <td colSpan={6} style={{ color: "#23d856", textAlign: 'center' }}>No activity logs available!</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
      <br />
      {(noOfPages && noOfPages > 1) ?
        <PaginationComponent
          noOfPages={noOfPages}
          onPageChange={onPageChange}
          currentPage={currentPage}
        /> : ''
      }
    </>
  );
}

export default ActivityLogs;