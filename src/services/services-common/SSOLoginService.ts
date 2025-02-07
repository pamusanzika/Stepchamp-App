import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { PublicClientApplication } from "@azure/msal-browser";
import packageJson from "../../../package.json";
import AuthService from "../../services/services-common/AuthService";
import { MSALConfig } from "../../configs/authConfig";
import { LocalStorageKeys } from "../../utils/constants";

const pca = new PublicClientApplication(MSALConfig);

/**
 * 
 * @param redirectUrl Navigation path
 * @param onSignInComplete A callback function to be called once google SignIn completes
 * @returns 
 */
const SSOLoginService = (redirectUrl: string | null = null, onSignInComplete: any = null) => {
  const navigate = useNavigate();
  const location = useLocation();

    const handleLoginResponse = async ( data: any, redirectUrl: string) => {
        let _authService = AuthService.getInstance();
        let response: any = null;
        try {
            response = await _authService.submitLoginRequest(data);
            localStorage.setItem(LocalStorageKeys.tokenProvider, data.authProvider);

            if (response.sessionId) {
                localStorage.setItem(
                    LocalStorageKeys.sessionId,
                    JSON.stringify(response.sessionId)
                );
                localStorage.setItem(LocalStorageKeys.user, JSON.stringify(response.user));

            navigate(redirectUrl);
            }
        } catch (error) {
            onSignInComplete({type: "contractError", error: error})
        }
        
        
    };

    const initializeMicrosoftSignIn = async () => {
        const loginRequest = {
        scopes: ["user.read"],
        responseType: "code",
        };

        try {
            await pca.initialize();
            const tokens = await pca.loginPopup(loginRequest);
            const data = {
                idToken: tokens.idToken,
                authProvider: "microsoft",
            };
            
            await handleLoginResponse(data, redirectUrl ?? location.pathname);  
            
    
            if(onSignInComplete)
                onSignInComplete({type: 'success'});

            return true;
            
        } catch (error) {
            if(onSignInComplete)
                onSignInComplete({type: 'error', error: error});
        }

        return true;
    };

    const initializeGoogleSignIn = useGoogleLogin({
        flow: "auth-code",
        onSuccess: async (codeResponse: any) => {
            let data = {
                authorizationCode: codeResponse.code,
                authProvider: "google",
            };
            try {
                await handleLoginResponse(data, redirectUrl ?? location.pathname);
                if(onSignInComplete)
                    onSignInComplete({type: 'success'});
            } catch (e) {
               onSignInComplete({type: 'contractError'})
            }

        },
        onError: (error) => {
            if(onSignInComplete)
                onSignInComplete({type: 'error', error: error});
        },
        onNonOAuthError: (error) =>  {
            if(onSignInComplete)
                onSignInComplete({type: 'error', error: error});
        }
    });

    return {
        initializeGoogleSignIn,
        initializeMicrosoftSignIn
      };


};

export default SSOLoginService;
