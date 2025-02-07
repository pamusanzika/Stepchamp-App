import { ChallengeParticipationDto } from "./ChallengeParticipationDto";
import { TeamParticipationDto } from "./TeamParticipationDto";
import { TeamWithCountDto } from "./TeamWithCountDto";

export interface ParticipationDto {
    ChallengeUserDetails: ChallengeParticipationDto[];
    TeamParticipantDetails: TeamParticipationDto[];
    TeamsWithCountDetails: TeamWithCountDto[];
}