import { DateString } from '@ukef/helpers';

export interface AcbsGetFacilityResponseDto {
  FacilityIdentifier: string;
  Description: string;
  Currency: {
    CurrencyCode: string;
  };
  OriginalEffectiveDate: DateString;
  DealIdentifier: string;
  DealPortfolioIdentifier: string;
  DealBorrowerPartyIdentifier: string;
  ExpirationDate: DateString;
  LimitAmount: number;
  ExternalReferenceIdentifier: string;
  FacilityType: {
    FacilityTypeCode: string;
  };
  FacilityInitialStatus: {
    FacilityInitialStatusCode: string;
  };
  AgentBankPartyIdentifier: string;
  IndustryClassification: {
    IndustryClassificationCode: string;
  };
  RiskCountry: {
    CountryCode: string;
  };
  FacilityReviewFrequencyType: {
    FacilityReviewFrequencyTypeCode: string;
  };
  CapitalConversionFactor: {
    CapitalConversionFactorCode: string;
  };
  CreditReviewRiskType: {
    CreditReviewRiskTypeCode: string;
  };
  OfficerRiskRatingType: {
    OfficerRiskRatingTypeCode: string;
  };
  FacilityUserDefinedList1: {
    FacilityUserDefinedList1Code: string;
  };
  FacilityUserDefinedList6: {
    FacilityUserDefinedList6Code: string;
  };
  UserDefinedDate1: DateString | null;
  UserDefinedDate2: DateString;
  UserDefinedAmount3: number;
  ProbabilityofDefault: number;
  FacilityOverallStatus: {
    FacilityStatusCode: string;
  };
  BorrowerParty: {
    PartyIdentifier: string;
    PartyName1: string;
  };
  CompBalPctReserve: number | null;
  CompBalPctAmount: number | null;
}
