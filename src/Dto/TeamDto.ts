import { BaseDto } from "./BaseDto";

export interface TeamDto extends BaseDto{
    Id: number;
    Name: string;
    ChallengesId: number;
}