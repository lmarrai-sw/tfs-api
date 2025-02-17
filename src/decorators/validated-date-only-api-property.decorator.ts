import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_FORMATS } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers';
import { IsISO8601, IsOptional, Matches } from 'class-validator';

interface Options {
  description: string;
  example?: DateOnlyString;
  required?: boolean;
  default?: DateOnlyString | null;
}

export const ValidatedDateOnlyApiProperty = ({ description, example, required, default: theDefault }: Options) => {
  const decoratorsToApply = [
    ApiProperty({
      description,
      type: Date,
      format: 'date',
      example,
      default: theDefault,
    }),
    IsISO8601({ strict: true }),
    Matches(DATE_FORMATS.DATE_ONLY_STRING.regex),
  ];

  const isRequiredProperty = required ?? true;
  if (!isRequiredProperty) {
    decoratorsToApply.push(IsOptional());
  }
  return applyDecorators(...decoratorsToApply);
};
