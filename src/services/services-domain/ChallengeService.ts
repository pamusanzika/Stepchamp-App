import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";
import ErrorHandlerService from "../services-common/ErrorHandlerService";

export default class ChallengeService {
    private static instance: ChallengeService;
    private _contractService: ContractService;
    public challengeId: any = 0;
    private sessionId = localStorage.getItem(LocalStorageKeys.sessionId);
    private errorHandler: ErrorHandlerService;

    public constructor() {
        this._contractService = ContractService.getInstance();
        this.errorHandler = new ErrorHandlerService();
    }

    public static getInstance(): ChallengeService {
        return new ChallengeService();
    }

    /**
     * 
     * @param data 
     * @returns Number  The last challengeId
     */
    async addChallenge(data: any) {
        const messageService = 'Challenge';
        const messageAction = 'CreateNewChallenge';
        let userString = localStorage.getItem(LocalStorageKeys.user);
        const user = userString && JSON.parse(userString);

        const message = {
            Service: messageService,
            Action: messageAction,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            data: data,
            user: user.Id,
        }

        return await this.submitRequest(message);
    }

    /**
     * 
     * @returns a string
     */
    async generateInvitationCode() {
        const messageService = 'Challenge';
        const messageAction = 'GenerateInvitationCode'

        const message = {
            Service: messageService,
            Action: messageAction,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
        }

        return await this.submitRequest(message);
    }

    async getChallenge(message: any) {
        const messageService = 'Challenge';
        const messageAction = 'GetChallenge'

        const messageObj = {
            Service: messageService,
            Action: messageAction,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            Data: message.challengeId,
        }
        
        return await this.submitReadRequest(messageObj);
    }

    async getChallengeDetails(message: any) {
        const messageService = 'Challenge';
        const messageAction = 'GetChallengeDetails'

        const messageObj = {
            Service: messageService,
            Action: messageAction,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            Data: message.challengeId,
        }
        
        return await this.submitReadRequest(messageObj);
    }

    async updateChallenge(data: any) {
        const messageService = 'Challenge';
        const messageAction = 'UpdateChallenge';

        const message = {
            Service: messageService,
            Action: messageAction,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            data: data
        }

        return await this.submitRequest(message);
    }

    async getAllChallenges(pageNo: any) {
        const messageService = 'Challenge';
        const messageAction = 'GetAllChallenges';

        const message = {
            Service: messageService,
            Action: messageAction,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            Page: pageNo
        }

        return await this.submitReadRequest(message);
    }

    private async submitRequest(message: any) {
        try {
            return await this._contractService.submitInputToContract(message);
        } catch (error) {
            await this.errorHandler.handleErrorCode(<ErrorResponseDto>error);
            throw <ErrorResponseDto>error;
        }
    }

    private async submitReadRequest(message: any) {
        try {
            const response = await this._contractService.submitReadRequest(message);
            return(response);
            
        } catch (error) {
            await this.errorHandler.handleErrorCode(<ErrorResponseDto>error);
            throw <ErrorResponseDto>error;

        }
    }
}