import { BaseDto } from "./BaseDto";

export interface UserDto extends BaseDto {
    Id: number;
    Email: string;
    Name: string;
    IsActive: number;
    AccessLevel: string;
    LastLogOn: string;
}