import { Container, Table } from "react-bootstrap";
import ChallengeService from "../../services/services-domain/ChallengeService";
import { useEffect, useState } from "react";
import Alert from 'sweetalert2';
import LoadingScreen from "../../components/features/LoadingScreen/LoadingScreen";
import PaginationComponent from "../../components/features/PaginationComponent/PaginationComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faHourglassHalf, faPersonRunning, faSort, faSortAsc, faSortDesc } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import ContractService from "../../lib/contractService";
import DateService from "../../services/services-common/DateService";
import './Challenges.scss';
import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import { toast } from "react-toastify";

function Challenges() {
  let _challengeService = new ChallengeService();
  let _dateService = DateService.getInstance();

  const [challengesList, setChallengesList] = useState([]);
  const [showLoadPopup, setShowLoadPopup] = useState(true);
  const [noOfPages, setNoOfPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState(null);
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

  const sortData = (data: any[]) => {
    if (sortColumn) {
      return data.slice().sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (sortColumn === 'teamCount' || sortColumn === 'participantCount') {
          // Convert values to numbers for numeric comparison
          const numericAValue = parseFloat(aValue);
          const numericBValue = parseFloat(bValue);

          // If both values are numeric, perform numeric comparison
          if (sortOrder === 'asc') {
            return numericAValue - numericBValue;
          } else {
            return numericBValue - numericAValue;
          }
        } else {
          // If one or both values are not numeric, fallback to string comparison
          if (sortOrder === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }
      });
    }
    return data;
  };
  
  const fetchData = async (pageNo: any) => {
      _challengeService.getAllChallenges(pageNo)
        .then((response:any) => {
          if (response) {
            setChallengesList(response.data);
            setNoOfPages(response.totalPages);
            setCurrentPage(response.page);
            setShowLoadPopup(false);
          } else {
            setShowLoadPopup(false);
          }
        })
        .catch((error: ErrorResponseDto) => {
          setShowLoadPopup(false);
          
        });
    
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

  useEffect(() => {
    refreshList(1);
  }, []);

  return (
    <>
      <LoadingScreen showLoadPopup={showLoadPopup} />
      <Container fluid className="bg-white rounded">
        <Table striped responsive>
          <thead>
            <tr>
              <th onClick={() => handleSort('CreatedOn')}>
                Created&nbsp;
                {sortColumn === 'CreatedOn' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                {sortColumn === 'CreatedOn' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                {sortColumn !== 'CreatedOn' && <FontAwesomeIcon icon={faSort} />}
              </th>
              <th onClick={() => handleSort('Name')}>
                Name&nbsp;
                {sortColumn === 'Name' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                {sortColumn === 'Name' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                {sortColumn !== 'Name' && <FontAwesomeIcon icon={faSort} />}
              </th>
              <th onClick={() => handleSort('StartDate')}>
                Period&nbsp;
                {sortColumn === 'StartDate' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                {sortColumn === 'StartDate' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                {sortColumn !== 'StartDate' && <FontAwesomeIcon icon={faSort} />}
              </th>
              <th onClick={() => handleSort('teamCount')} style={{textAlign: 'center'}}>
                # Teams&nbsp;
                {sortColumn === 'teamCount' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                {sortColumn === 'teamCount' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                {sortColumn !== 'teamCount' && <FontAwesomeIcon icon={faSort} />}
              </th>
              <th onClick={() => handleSort('participantCount')} style={{textAlign: 'center'}}>
                # Participants&nbsp;
                {sortColumn === 'participantCount' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                {sortColumn === 'participantCount' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                {sortColumn !== 'participantCount' && <FontAwesomeIcon icon={faSort} />}
              </th>
              <th onClick={() => handleSort('Status')}>
                Status&nbsp;
                {sortColumn === 'Status' && sortOrder === 'asc' && <FontAwesomeIcon icon={faSortAsc} />}
                {sortColumn === 'Status' && sortOrder === 'desc' && <FontAwesomeIcon icon={faSortDesc} />}
                {sortColumn !== 'Status' && <FontAwesomeIcon icon={faSort} />}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortData(challengesList).map((challenge: any) => (
              <tr key={challenge.Id}>
                <td>{_dateService.getThemedDate(challenge.CreatedOn)}</td>
                <td><Link className="link-style" to={`/challenge/${challenge.Id}`}>{challenge.Name}</Link></td>
                <td>{_dateService.getThemedDate(challenge.StartDate)} - {_dateService.getThemedDate(challenge.EndDate)}</td>
                <td  style={{textAlign: 'center'}}>{challenge.teamCount}</td>
                <td  style={{textAlign: 'center'}}  >{challenge.participantCount}</td>
                {(() => {
                  switch (challenge.Status) {
                    case 'Ongoing':
                      return <td><FontAwesomeIcon icon={faPersonRunning} color="rgb(91, 178, 249)" style={{marginRight: '2px'}}/>
                        &nbsp;{challenge.Status}
                      </td>
                    case 'Pending':
                      return <td><FontAwesomeIcon icon={faHourglassHalf} color="orange" style={{marginRight: '5px'}}/>
                        &nbsp;{challenge.Status}
                      </td>
                    case 'Completed':
                      return <td><FontAwesomeIcon icon={faCheckCircle} color="#23d856"/>
                        &nbsp;{challenge.Status}
                      </td>
                    case 'Deleted':
                      return <td style={{color: 'red'}}>{challenge.Status}</td>
                    default:
                      break;
                  }
                })()}
              </tr>
            ))}
          </tbody>
        </Table>
      </Container><br />
      {(noOfPages && noOfPages > 1) ?
        <PaginationComponent noOfPages={noOfPages} onPageChange={onPageChange} currentPage={currentPage}/> : ''
      }
    </>
  );
}

export default Challenges;
