import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";

export default class ActivityLogsService {
  private static instance: ActivityLogsService;
  private _contractService: ContractService;
  private sessionId = localStorage.getItem(LocalStorageKeys.sessionId);

  private constructor() {
    this._contractService = ContractService.getInstance();
  }

  public static getInstance(): ActivityLogsService {
    if (!ActivityLogsService.instance) {
      ActivityLogsService.instance = new ActivityLogsService();
    }
    return ActivityLogsService.instance;
  }

  async getActivityLogs(pageNo: any, filter: any = null) {
    try {
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

      const response = await this._contractService.submitReadRequest(message);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
