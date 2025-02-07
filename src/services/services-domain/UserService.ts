import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import { UserDto } from "../../Dto/UserDto";
import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";
import ErrorHandlerService from "../services-common/ErrorHandlerService";

export default class UserService {
  private static instance: UserService;
  private _contractService: ContractService;
  private sessionId = localStorage.getItem(LocalStorageKeys.sessionId);
  private errorHandler: ErrorHandlerService;

  public constructor() {
    this._contractService = ContractService.getInstance();
    this.errorHandler = new ErrorHandlerService();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getAllActiveUsers(pageNo: any) {
    const dataObj = {
      Service: "User",
      Action: "GetUsers",
      Auth: {
          sessionId: this.sessionId?.replace(/['"]/g, '')
      },
      Page: pageNo
    }

    return await this.submitReadRequest(dataObj);
  }

  async AddUser(newUser: any) {
    const dataObj = {
      Service: "User",
      Action: "AddUser",
      Auth: {
          sessionId: this.sessionId?.replace(/['"]/g, '')
      },
      data: {
        email: newUser.Email,
        accessLevel: newUser.AccessLevel,
      },
    };

    return await this.submitRequest(dataObj);
  }

  async updateUserRole(userID: any, newAccessLevel: any, userConcurrencyKey: any) {
    const dataObj = {
      Service: "User",
      Action: "UpdateUser",
      Auth: {
          sessionId: this.sessionId?.replace(/['"]/g, '')
      },
      data: {
        accessLevel: newAccessLevel,
      },
      filter: { id: userID, concurrencyKey: userConcurrencyKey },
    };

    return await this.submitRequest(dataObj);
  }
  //Soft Delete a User
  async DeleteUser(deletedUser: any) {
    const deletedataObj = {
      Service: "User",
      Action: "DeleteUser",
      Auth: {
          sessionId: this.sessionId?.replace(/['"]/g, '')
      },
      filter: { id: deletedUser.Id, concurrencyKey: deletedUser.ConcurrencyKey},
    };

    return await this.submitRequest(deletedataObj);
  }

  async getAllAdmins() {

    const request = {
      Service: 'User',
      Action: 'GetAdmins',
      Auth: {
        sessionId: this.sessionId?.replace(/['"]/g, '')
      }
    }

    return (await this.submitReadRequest(request)) as UserDto[];
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
