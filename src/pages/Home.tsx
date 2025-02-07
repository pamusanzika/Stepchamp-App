import React, { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import SampleService from "../services/services-domain/SampleService";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LocalStorageKeys } from '../utils/constants';
const Home = () => {
    const [ profile, setProfile ] : any = useState(null);
    const navigate = useNavigate();
    let _sampleService = SampleService.getInstance();
    
    const  handleSampleRequest =  () => {
        _sampleService.sampleMessageSubmitToContractMethod("Sample Requst Message");
    }

    const showChallenges =  () => {
        navigate('/challenges');
    }

    useEffect(()=>{
        const user: any = localStorage.getItem(LocalStorageKeys.user);
        const userJson = JSON.parse(user);
        setProfile({name: userJson.Name, email: userJson.Email});
      },
    []);

    return (
        <React.Fragment>
            <Container className='py-5'>
                <h3 className='fw-normal'>Welcome Home</h3>
                {profile ? (
                <div>
                    <p>Name: {profile.name}</p>
                    <p>Email Address: {profile.email}</p>
                    <br />
                    <br />
                    {/* <Button onClick={() =>handleSampleRequest()} className="btn-success mt-2" id="login-btn">Sample Requst Message</Button> */}
                    <Button onClick={() =>showChallenges()} className="btn-success mt-2" id="challenges-btn">Show Challenges</Button>
                </div>
            ) : (
                <div>Loading ...</div>
            )}
            </Container>
        </React.Fragment>
    )
}
export default Home;