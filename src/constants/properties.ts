const DEFAULTS = {
  DEAL: {
    dealOriginationCode: 'C',
    isDealSyndicationIndicator: true,
    dealInitialStatusCode: 'A',
    dealOverallStatusCode: 'A',
    dealTypeCode: '500',
    dealReviewFrequencyTypeCode: ' ',
    previousDealPortfolioIdentifier: '',
    dealLegallyBindingIndicator: false,
    dealUserDefinedList5Code: 'N',
    dealDefaultPaymentInstruction: null,
    dealExternalReferences: '[]',
    portfolioIdentifier: 'E1',
    currencyIsActiveIndicator: true,
    bookingDate: null,
    finalAvailableDate: null,
    isFinalAvailableDateMaximum: true,
    expirationDate: '2050-12-31T00:00:00Z',
    isExpirationDateMaximum: true,
    memoLimitAmount: 0,
    withheldAmount: 0,
    bookingClassCode: 'A',
    memoUsedAmount: 0,
    memoAvailableAmount: 0,
    memoWithheldAmount: 0,
    lineOfficerIdentifier: 'DCIS',
    generalLedgerUnitIdentifier: 'ECGD',
    servicingUnitIdentifier: 'ACBS',
    servicingUnitSectionIdentifier: 'ACBS',
    agentBankPartyIdentifier: '00000000',
    riskCountryCode: 'GBR',
    purposeTypeCode: '   ',
    capitalClassCode: 'A',
    capitalConversionFactorCode: ' ',
    financialFXRate: 1,
    financialFXRateOperand: 'M',
    financialRateFXRateGroup: 'UKRATEGRP',
    financialFrequencyCode: 'M',
    financialBusinessDayAdjustment: 'S',
    financialDueMonthEndIndicator: false,
    financialcalendarIdentifier: 'UK',
    financialLockMTMRateIndicator: true,
    financialNextValuationDate: '2060-12-25T00:00:00Z',
    customerFXRateGroup: 'UKRATEGRP',
    customerFrequencyCode: 'M',
    customerBusinessDayAdjustment: 'S',
    customerDueMonthEndIndicator: false,
    customerCalendarIdentifier: 'UK',
    customerLockMTMRateIndicator: true,
    customerNextValuationDate: '2060-12-25T00:00:00Z',
    limitRevolvingIndicator: true,
    servicingUser: {
      userAcbsIdentifier: 'OPERATIONS',
      userName: 'OPERATIONS',
    },
    administrativeUser: {
      userAcbsIdentifier: 'OPERATIONS',
      userName: 'OPERATIONS',
    },
    creditReviewRiskTypeCode: '04',
    nextReviewDate: '2050-01-01T00:00:00Z',
    isNextReviewDateZero: true,
    officerRiskRatingTypeCode: '99',
    isOfficerRiskDateZero: false,
    isCreditReviewRiskDateZero: true,
    regulatorRiskDate: null,
    isRegulatorRiskDateZero: true,
    multiCurrencyArrangementIndicator: true,
    isUserDefinedDate1Zero: true,
    isUserDefinedDate2Zero: true,
    isUserDefinedDate3Zero: true,
    isUserDefinedDate4Zero: true,
    sharedNationalCredit: '',
    defaultReasonCode: ' ',
    accountStructureCode: 'C',
    lenderTypeCode: '100',
    riskMitigationCode: '',
  },
};

export { DEFAULTS };
