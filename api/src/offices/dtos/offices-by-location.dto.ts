import { IsNumber } from "class-validator";

export class OfficesByLocationDto {
    @IsNumber()
    provinceId: number;

    @IsNumber()
    districtId: number;

    @IsNumber()
    municipalityId: number;

    @IsNumber()
    wardId: number;
}