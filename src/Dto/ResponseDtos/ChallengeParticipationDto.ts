export interface ChallengeParticipationDto {
    UserId: number;
    Email: string;
    Name: string;
    Source: string;
    IsActive: number;
    UserChallengeId: number;
    ChallengeId: number;
    ConcurrencyKey: string;

}