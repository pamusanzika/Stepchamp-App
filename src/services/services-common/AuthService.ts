import ContractService from "../../lib/contractService";
import axios from "axios";

export default class AuthService {
  private static instance: AuthService;
  private _contractService: ContractService;

  private constructor() {
    this._contractService = ContractService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async submitLoginRequest(loginData: any) {
    const userCurrentIp = await axios.get("https://api.ipify.org/?format=json");
    
    const message = {
      Service: "User",
      Action: "LoginUser",
      Auth: {
        AuthorizationCode: (loginData.authProvider === "google") ? loginData.authorizationCode : '',
        IdToken: (loginData.authProvider === "microsoft") ? loginData.idToken : '',
        AuthProvider: loginData.authProvider,
        IpAddress: userCurrentIp.data.ip
      }
    };

    try {
      let authResponse = await this._contractService.submitInputToContract(message);
      return authResponse;
    } catch(error) {
      throw error;
    }
  }
}
