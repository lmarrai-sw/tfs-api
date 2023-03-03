import { Controller, Get, Query } from '@nestjs/common';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { GetPartyBySearchTextResponseElement } from './dto/get-party-by-search-text-response-element.dto';
import { GetPartyBySearchTextService } from './get-party-by-search-text.service';

@Controller('party')
export class PartyController {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly getPartyBySearchTextService: GetPartyBySearchTextService,
  ) {}

  @Get()
  async getPartyBySearchText(@Query('searchText') searchText): Promise<GetPartyBySearchTextResponseElement[]> {
    const token = await this.acbsAuthenticationService.getIdToken();
    const response = await this.getPartyBySearchTextService.getPartyBySearchText(token, searchText);

    return response;
  }
}
