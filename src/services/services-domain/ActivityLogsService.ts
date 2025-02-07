import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";
import ErrorHandlerService from "../services-common/ErrorHandlerService";

export default class ActivityLogsService {
  private static instance: ActivityLogsService;
  private _contractService: ContractService;
  private sessionId = localStorage.getItem(LocalStorageKeys.sessionId);
  private errorHandler: ErrorHandlerService;

  public constructor() {
    this._contractService = ContractService.getInstance();
    this.errorHandler = new ErrorHandlerService();
  }

  public static getInstance(): ActivityLogsService {
    if (!ActivityLogsService.instance) {
      ActivityLogsService.instance = new ActivityLogsService();
    }
    return ActivityLogsService.instance;
  }

  async getActivityLogs(pageNo: any, filter: any = null) {
      const messageService = "ActivityLogs";
      const messageAction = "GetActivityLogs";

      const message = {
        Service: messageService,
        Action: messageAction,
        Auth: {
          sessionId: this.sessionId?.replace(/['"]/g, ""),
        },
        Page: pageNo,
        Filter: filter,
      };
      
      return await this.submitReadRequest(message)
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
