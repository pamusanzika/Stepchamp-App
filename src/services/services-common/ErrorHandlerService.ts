
import { toast } from "react-toastify";
import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import { ErrorCodes, LocalStorageKeys } from "../../utils/constants";
import SSOLoginService from "./SSOLoginService";
import {store} from '../../redux/store';
import { setShowScreenLoader } from '../../redux/screenLoaderSlice'
import DirtyValidationService from "./DirtyValidationService";

export default class ErrorHandlerService {

    private ssoLoginService: any;
    private initializeGoogleSignIn: any;
    private initializeMicrosoftLogin: any;
    private dirtyValidationService: any;

    constructor() {
        this.ssoLoginService = SSOLoginService(null, this.onSSOComplete);
        this.initializeGoogleSignIn = this.ssoLoginService.initializeGoogleSignIn;
        this.initializeMicrosoftLogin =  this.ssoLoginService.initializeMicrosoftSignIn;
        this.dirtyValidationService = DirtyValidationService.getInstance();
    }

    public async handleErrorCode(errorObject: ErrorResponseDto) {
        switch (errorObject.errorCode) {
            case ErrorCodes.AUTHENTICATION_FAILED:
                await this.handleAuthenticationFailed();
                break;
            case ErrorCodes.ACCESS_DENIED:
                 await this.handleAuthenticationFailed();
                 break;
            default:
                this.handleDefaultError(errorObject);
                break;
        }
    }


    private async handleAuthenticationFailed() {
        this.dirtyValidationService.resetAll();
        
        const serviceProvider = localStorage.getItem(LocalStorageKeys.tokenProvider);
        if(serviceProvider === 'google') {
            store.dispatch(setShowScreenLoader(true));
            this.initializeGoogleSignIn();           
        } else if (serviceProvider === 'microsoft') {
            await this.initializeMicrosoftLogin();
        } else {
            //redirect to login page
            // localStorage.clear();
            window.location.href = '/auth/login'
        }

    }


    private handleDefaultError(errorObject: ErrorResponseDto) {
        toast.error(errorObject.displayErrorMessage);
        return errorObject;

    }

    public onSSOComplete(response: {type: 'success' | 'error', error?: any}) {
        if(response.type === 'error') {
            // TODO: Clear the local storage and navigate to the login Page
            localStorage.clear();
            window.location.href = '/auth/login'
        } else if(response.type === 'success') {
            window.location.reload();
        }

        store.dispatch(setShowScreenLoader(false));
    }
}