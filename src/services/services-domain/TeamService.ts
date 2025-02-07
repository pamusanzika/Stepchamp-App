import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import { TeamDto } from "../../Dto/ResponseDtos/TeamDto";
import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";
import ErrorHandlerService from "../services-common/ErrorHandlerService";


export default class TeamService {
    private static instance: TeamService;
    private _contractService: ContractService;
    private messageService = "Team";
    private sessionId = localStorage.getItem(LocalStorageKeys.sessionId);
    private errorHandler: ErrorHandlerService;

    public constructor() {
        this._contractService = ContractService.getInstance();
        this.errorHandler = new ErrorHandlerService();
    }

    public static getInstance(): TeamService {
        return new TeamService();
    }

    async getTeamsByChallengeId(challengeId: number) {
        const action = "GetAllTeamsByChallengeId";

        const request = {
            Service: this.messageService,
            Action: action,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            data: {
                challengeId: challengeId
            }
        }

        return (await this.submitReadRequest(request)) as TeamDto[];
    }

    async checkForTeamMembers(teamId: number) {
        const action = "CheckForMembers";
        const request = {
            Service: this.messageService,
            Action: action,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            data: {
                id: teamId
            }
        }

        return (await this.submitReadRequest(request)) as { memberCount: number, hasMembers: boolean };
    }

    async addTeam(challengeId: number, teamName: string) {
        const action = "CreateTeam";
        const request = {
            Service: this.messageService,
            Action: action,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            data: {
                challengeId: challengeId,
                name: teamName
            }
        }

        return (await this.submitRequest(request)) as { rowId: number };
    }

    async deleteTeam(teamId: number) {
        const action = "DeleteTeam";
        const request = {
            Service: this.messageService,
            Action: action,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            data: {
                id: teamId
            }
        }

        return (await this.submitRequest(request)) as String; // "Successfully deleted."
    }

    async editTeamName(challengeId: number, teamId: number, newName: string, concurrencyKey: string) {
        const action = "EditTeamName";
        const request = {
            Service: this.messageService,
            Action: action,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            data: {
                id: teamId,
                challengeId: challengeId,
                concurrencyKey: concurrencyKey,
                name: newName
            }
        }

        return (await this.submitRequest(request)) as String; // "Updated Successfully."
    }

    async updateTeams(challengeId: number, newTeams: TeamDto[], editableTeams: TeamDto[], deletePendingTeams: TeamDto[]) {
        const action = "UpdateTeams";
        const request = {
            Service: this.messageService,
            Action: action,
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, '')
            },
            data: {
                challengeId: challengeId,
                newTeams: newTeams,
                editableTeams: editableTeams,
                deletePendingTeams: deletePendingTeams
            }
        }
        
        return await this.submitRequest(request);
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