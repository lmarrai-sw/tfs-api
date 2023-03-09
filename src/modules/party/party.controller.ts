import { Controller, Get, Query } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { GetPartyBySearchTextResponse, GetPartyBySearchTextResponseElement } from './dto/get-party-by-search-text-response-element.dto';
import { PartyQueryDto } from './dto/party-query.dto';
import { PartyService } from './party.service';

@Controller('party')
export class PartyController {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly partyService: PartyService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all parties matching the specified search text.',
  })
  @ApiOkResponse({
    description: 'The matching parties have been successfully retrieved.',
    type: GetPartyBySearchTextResponseElement,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getPartiesBySearchText(@Query() query: PartyQueryDto): Promise<GetPartyBySearchTextResponse> {
    const token = await this.acbsAuthenticationService.getIdToken();
    const response = await this.partyService.getPartiesBySearchText(token, query.searchText);

    return response;
  }
}
