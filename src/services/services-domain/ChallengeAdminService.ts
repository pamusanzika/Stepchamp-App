import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";
import ErrorHandlerService from "../services-common/ErrorHandlerService";

export default class ChallengeAdminService {
    private static instacne: ChallengeAdminService;
    private _contractService: ContractService;
    private sessionId = localStorage.getItem(LocalStorageKeys.sessionId);
    private errorHandler: ErrorHandlerService;

    public constructor() {
        this._contractService = ContractService.getInstance();
        this.errorHandler = new ErrorHandlerService();
    }

    public static getInstance(): ChallengeAdminService {
        return new ChallengeAdminService();
    }

    async getAdminsByChallengeId(challengeId: any) {
        const messageObj = {
            Service: 'ChallengeAdmin',
            Action: 'GetAdminsByChallengeId',
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            filter: {
                challengeId: challengeId
            }
        }
        try {
            let result = await this._contractService.submitReadRequest(messageObj);
            return result;
        } catch (error) {
            throw error;
        }

        return await this.submitReadRequest(messageObj);
    }

    async updateChallengeAdmins(challengeId: any, newAdmins: any, deletedAdmins: any) {
        const messageObj = {
            Service: 'ChallengeAdmin',
            Action: 'UpdateChallengeAdmins',
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            filter: {
                challengeId: challengeId,
            },
            data: {
                added: newAdmins,
                deleted: deletedAdmins,
            }
        }

        return await this.submitRequest(messageObj);
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