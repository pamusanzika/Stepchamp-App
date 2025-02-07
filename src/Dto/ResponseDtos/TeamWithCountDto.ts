import { TeamDto } from "../TeamDto";

export interface TeamWithCountDto extends TeamDto {
    MemberCount: number;
}