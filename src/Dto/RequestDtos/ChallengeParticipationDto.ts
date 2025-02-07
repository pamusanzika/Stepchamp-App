export interface ChallengeParticipatioRequestDto {
    UserId: number;
    Email: string;
    Name: string;
    Source: string;
    IsActive: number;
    UserChallengeId: number;
    ChallengeId: number;
    ConcurrencyKey: string;
    // Following properties aren't considered in the backend
    value?: number;
    text?: string;
    subText?: string;

}