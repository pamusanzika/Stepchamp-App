import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";
import ErrorHandlerService from "../services-common/ErrorHandlerService";

export default class RulesService {
    private static instance: RulesService;
    private _contractService: ContractService;
    private sessionId = localStorage.getItem(LocalStorageKeys.sessionId);
    private errorHandler: ErrorHandlerService;

    public constructor() {
        this._contractService = ContractService.getInstance();
        this.errorHandler = new ErrorHandlerService();
    }

    public static getInstance(): RulesService {
        if (!RulesService.instance) {
            RulesService.instance = new RulesService();
        }
        return RulesService.instance;
    }

    async getRules(message: any) {
        const messageService = 'Rules';
        const messageAction = 'GetRules'

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

    async updateRules(data: any) {
        const messageService = 'Rules';
        const messageAction = 'UpdateRules';

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