import { ChallengeParticipatioRequestDto } from "../../Dto/RequestDtos/ChallengeParticipationDto";
import { ChallengeParticipationDto } from "../../Dto/ResponseDtos/ChallengeParticipationDto";
import { ErrorResponseDto } from "../../Dto/ResponseDtos/ErrorResponseDto";
import { ParticipationDto } from "../../Dto/ResponseDtos/ParticipationDto";
import ContractService from "../../lib/contractService";
import { LocalStorageKeys } from "../../utils/constants";
import ErrorHandlerService from "../services-common/ErrorHandlerService";


export default class MemberService {
    private _contractService: ContractService;
    private messageService = "Challenge";
    private sessionId = localStorage.getItem(LocalStorageKeys.sessionId);
    private errorHandler: ErrorHandlerService;

    constructor() {
        this._contractService = ContractService.getInstance();
        localStorage.getItem(LocalStorageKeys.sessionId)
        this.errorHandler = new ErrorHandlerService();
    }

    async getChallengeParticipationDetails(challengeId: number) {
        const action = "GetChallengeParticipationDetails";

        const request = {
            Service: this.messageService,
            Action: action,
            data: {
                challengeId: challengeId
            },
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, ""),
            }
        }

        return (await this.submitReadRequest(request)) as ParticipationDto;
    }

    async saveMemberUpdates(updatedAssignings: { [key: number]: { assignedMembers: ChallengeParticipatioRequestDto[] } }, challengeId: number,  membersToRemove: number[] = []) {
        const action = "SaveMemberUpdates";
        const request = {
            Service: this.messageService,
            Action: action,
            data: {
                updatedAssignings: updatedAssignings,
                challengeId: challengeId,
                membersToRemove:  membersToRemove
            },
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, ""),
            }
        }

        return (await this.submitRequest(request)) as string;
    }
   
    async loadGeveoUsers(challengeId: number) {
        const action = "LoadAzureADUsersToChallenge";
        const request = {
            Service: this.messageService,
            Action: action,
            data: {
                challengeId: challengeId
            },
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, ""),
            }
        }
        
        return (await this.submitRequest(request)) as ChallengeParticipationDto[];
    }
   
/* Remove method
    async removeMembers(challengeId: number, selctedMembers:  number[]) {
        const action = 'removeMembers';
        const request = {
            Service: this.messageService,
            Action: action,
            data: {
                challengeId: challengeId,
                selectedList: selctedMembers
            },
            Auth: {
                sessionId: this.sessionId?.replace(/['"]/g, ""),
            }
        }

        try {
            const responseMessage = await this._contractService.submitInputToContract(request);
            return responseMessage;
        } catch (error) {
            throw error;
        }
    }*/

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