/* eslint-disable */
/**
 * This module is pulled out of @prisma/client codebase.
 *
 * TODO Ask client team to expose this helper function from @prisma/client
 */

import { DMMF, DMMF as ExternalDMMF } from '@prisma/generator-helper'
import { capitalize, lowerCase } from 'lodash'
import pluralize from 'pluralize'

export function getCountAggregateOutputName(modelName: string): string {
  return `${capitalize(modelName)}CountAggregateOutputType`
}

/**
 * Turns type: string into type: string[] for all args in order to support union input types
 *
 * @param document
 */
export function externalToInternalDmmf(document: ExternalDMMF.Document): DMMF.Document {
  return {
    ...document,
    mappings: getMappings(document.mappings, document.datamodel),
  }
}

function getMappings(mappings: ExternalDMMF.Mappings, datamodel: DMMF.Datamodel): DMMF.Mappings {
  const modelOperations = mappings.modelOperations
    .filter((mapping) => {
      const model = datamodel.models.find((m) => m.name === mapping.model)
      if (!model) {
        throw new Error(`Mapping without model ${mapping.model}`)
      }
      return model.fields.some((f) => f.kind !== 'object')
    })
    .map((mapping: any) => ({
      model: mapping.model,
      plural: pluralize(lowerCase(mapping.model)),
      findUnique: mapping.findUnique || mapping.findSingle,
      findFirst: mapping.findFirst,
      findMany: mapping.findMany,
      create: mapping.createOne || mapping.createSingle || mapping.create,
      createMany: mapping.createMany,
      delete: mapping.deleteOne || mapping.deleteSingle || mapping.delete,
      update: mapping.updateOne || mapping.updateSingle || mapping.update,
      deleteMany: mapping.deleteMany,
      updateMany: mapping.updateMany,
      upsert: mapping.upsertOne || mapping.upsertSingle || mapping.upsert,
      aggregate: mapping.aggregate,
      groupBy: mapping.groupBy,
    }))

  return {
    modelOperations,
    otherOperations: mappings.otherOperations,
  }
}

export interface BaseField {
  name: string
  type: string | DMMF.SchemaEnum | DMMF.OutputType | DMMF.SchemaArg
  isList: boolean
  isRequired: boolean
}