import { useGoogleLogin } from "@react-oauth/google";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import stepChampLogo from "../../assets/images/step-champ-logo.png"
import microsoftLogo from "../../assets/images/microsoft-logo.png"
import googleLogo from "../../assets/images/google-logo.png"
import loginCardImage from "../../assets/images/login-card-image.png"
import geveoLogo from "../../assets/images/geveo.png"
import packageJson from '../../../package.json';
import AuthService from "../../services/services-common/AuthService";
import LoadingScreen from "../../components/features/LoadingScreen/LoadingScreen";
import { PublicClientApplication } from "@azure/msal-browser";
import { MSALConfig } from "../../configs/authConfig";
import { LocalStorageKeys } from "../../utils/constants";
import SSOLoginService from "../../services/services-common/SSOLoginService";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setLoginErrorMessage } from "../../redux/LoginErrorMessageSlice";
import { setShowScreenLoader } from "../../redux/screenLoaderSlice";

const pca = new PublicClientApplication(MSALConfig);

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const appVersion = packageJson.version;
    const [showLoadPopup, setShowLoadPopup] = useState(false);
    const isError = useSelector((state: RootState) => state.loginErrorMessage.isError);
    const errorMessage = useSelector((state: RootState) => state.loginErrorMessage.message)
    
    const onSignInComplete = (res: {type: 'success' | 'error' | 'contractError', error?: any}) => {
      switch(res.type) {
        case 'success':
          break;
        case 'error':
            dispatch(setLoginErrorMessage({isError: true, message: res.error.displayErrorMessage}));
            break;  
        case 'contractError': 
            dispatch(setLoginErrorMessage({isError: true, message: res.error.displayErrorMessage}));
            break; 

      }
      dispatch(setShowScreenLoader(false));
    };
    
    const loginSSOService = SSOLoginService('/', onSignInComplete );
    const initializeGoogleSignIn1 = loginSSOService.initializeGoogleSignIn;
    const initializeMicrosoftSignIn1 = loginSSOService.initializeMicrosoftSignIn;

   
    const sigIn = async (serviceProvider: 'google' | 'microsoft') => {
      dispatch(setShowScreenLoader(true));
      dispatch(setLoginErrorMessage({isError: false, message: ''}))
      try {
        if(serviceProvider === 'google') {
          initializeGoogleSignIn1();
        } else if(serviceProvider === 'microsoft') {
          await initializeMicrosoftSignIn1();
        }
        
      } catch (error) {
        dispatch(setLoginErrorMessage({isError: false, message: 'Login failed!'}))
        setShowLoadPopup(false)
        navigate('/auth/login');
      } finally {
        // setShowLoadPopup(false);
      }
    }

    const customOutlineStyle = {
        borderColor: '#23D856',
        color: '#000000',
      };

    const signInText = {
        paddingTop: "70px",
        fontSize: "33px",
        fontWeight: "600",
    }

    const signInSubText = {
        fontSize: "16px",
        fontWeight: "400",
        color: "#8A92A6"
    }

    const signInErrorText = {
        fontSize: "16px",
        fontWeight: "400",
        color: "#ff0000"
    }

    const versionText = {
        fontSize: "12px",
        fontWeight: "300",
        color: "#0F2851"
    }

    const buttonSet = {
        paddingTop: "20px"
    }

    const signInCard = {
        borderRadius: '14px',
        maxWidth: '500px',
        maxHeight: '600px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
    }

    return (
        <React.Fragment>
        <LoadingScreen showLoadPopup={showLoadPopup} />
            <Container>
                <Row>
                    <Col lg={{span: 6}} className="d-none d-lg-block">
                        <div  className="d-flex align-items-center justify-content-center" style={{height:"100vh"}}>
                        <Image src={stepChampLogo}/>
                        </div>
                    </Col>
                    <Col md={{span: 12}} lg={{span: 6}}>
                    <Row className="d-flex align-items-center justify-content-center" style={{height:"100vh"}}>
                        <Col md={{span: 12}} >
                            <Card className="text-center mx-auto" style={signInCard}>
                                <Card.Body className="p-0" >
                                    <Card.Title style={signInText} className="mt-3">Sign In</Card.Title>
                                    <Card.Text style={signInSubText}>
                                        Sign in to stay connected.
                                    </Card.Text>
                                    {isError ? (
                                        <Card.Text style={signInErrorText}>
                                            {errorMessage ? errorMessage : "Access denied!"}
                                        </Card.Text>
                                    ) : (
                                        <></>
                                    )}
                                    <Row>
                                        <Col lg={{ span: 6, offset: 3 }} xs={{ span: 8, offset: 2 }}>
                                            <div className="d-grid gap-3" style={buttonSet}>
                                                <Button
                                                    onClick={() =>sigIn('microsoft')} 
                                                    variant="outline-light"
                                                    style={customOutlineStyle}
                                                    >
                                                    <img
                                                        src={microsoftLogo}
                                                        alt="Microsoft Logo"
                                                        style={{ marginRight: '10px', width: '22px' }}
                                                    />
                                                    <span style={{ fontSize: '16px'}}>Sign in with Microsoft</span>
                                                </Button>
                                                <Button
                                                    onClick={() => sigIn('google')} 
                                                    variant="outline-light"
                                                    style={customOutlineStyle}
                                                    >
                                                    <img
                                                    src={googleLogo}
                                                    alt="Google Logo"
                                                    style={{ marginRight: '10px', width: '22px' }}
                                                    />
                                                    <span style={{ fontSize: '16px'}}>Sign in with Google</span>
                                                </Button>
                                            </div>  
                                        </Col>
                                    </Row>
                                    <Row className="mt-5">
                                        <Col>
                                            <Image src={geveoLogo} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <span style={versionText}>Version: {appVersion}</span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="d-flex justify-content-end">
                                            <Image src={loginCardImage} />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
}
export default Login;