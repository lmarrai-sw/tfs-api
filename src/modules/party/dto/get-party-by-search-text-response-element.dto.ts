import { ApiResponseProperty } from '@nestjs/swagger';

export type GetPartyBySearchTextResponse = GetPartyBySearchTextResponseElement[];

export class GetPartyBySearchTextResponseElement {
  @ApiResponseProperty()
  alternateIdentifier: string;

  @ApiResponseProperty()
  industryClassification: string;

  @ApiResponseProperty()
  name1: string;

  @ApiResponseProperty()
  name2: string;

  @ApiResponseProperty()
  name3: string;

  @ApiResponseProperty()
  smeType: string;

  @ApiResponseProperty()
  citizenshipClass: string;

  @ApiResponseProperty()
  officerRiskDate: string;

  @ApiResponseProperty()
  countryCode: string;
}
