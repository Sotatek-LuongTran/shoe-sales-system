import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import {
  PaginationMetaDto,
  PaginationResponseDto,
} from '../dto/pagination-response.dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(PaginationResponseDto, PaginationMetaDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model),
                },
              },
              meta: {
                $ref: getSchemaPath(PaginationMetaDto),
              },
            },
          },
        ],
      },
    }),
  );
