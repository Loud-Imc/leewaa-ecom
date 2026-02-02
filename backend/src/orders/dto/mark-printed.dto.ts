import { IsArray, IsString } from 'class-validator';

export class MarkPrintedDto {
    @IsArray()
    @IsString({ each: true })
    orderIds: string[];
}
