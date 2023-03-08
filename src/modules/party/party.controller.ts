import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { GetPartyByIdentifierResponse } from './dto/get-party-by-response.dto';
import { GetPartyBySearchTextResponse, GetPartyBySearchTextResponseElement } from './dto/get-party-by-search-text-response-element.dto';
import { PartyQueryDto } from './dto/party-query.dto';
import { GetPartyBySearchTextService } from './get-party-by-search-text.service';
import { PartyService } from './party.service';

@Controller('parties')
export class PartyController {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly getPartyBySearchTextService: GetPartyBySearchTextService,
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
  async getPartyBySearchText(@Query() query: PartyQueryDto): Promise<GetPartyBySearchTextResponse> {
    const token = await this.acbsAuthenticationService.getIdToken();
    const response = await this.getPartyBySearchTextService.getPartyBySearchText(token, query.searchText);

    return response;
  }

  @Get(':partyIdentifier')
  @ApiOperation({ summary: 'Get the party matching the specified party identifier.' })
  @ApiParam({
    name: 'partyIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the party in ACBS.',
    example: '00000001',
  })
  @ApiOkResponse({
    description: 'The party has been successfully retrieved.',
    type: GetPartyByIdentifierResponse,
  })
  @ApiNotFoundResponse({
    description: 'The specified party was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  getPartyByIdentifier(@Param('partyIdentifier') partyIdentifier: string): Promise<GetPartyByIdentifierResponse> {
    return this.partyService.getPartyByIdentifier(partyIdentifier);
  }
}
