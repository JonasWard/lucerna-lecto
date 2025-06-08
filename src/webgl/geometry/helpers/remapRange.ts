import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { Version0Type } from 'src/modelDefinition/types/version0.generatedType'

const getDeltaForRange = (range: [number, number]) => range[1] - range[0]
const getMinValueForRange = (range: [number, number]) => range[0]

const getMultiplierForRemapFromTo = (from: [number, number], to: [number, number]) =>
  getDeltaForRange(to) / getDeltaForRange(from)
const getOffsetForRemapFromtTo = (from: [number, number], to: [number, number]) =>
  getMinValueForRange(to) - getMultiplierForRemapFromTo(from, to) * getMinValueForRange(from)

export const getOffsetAndMultiplierForRemapFromUnitToArbitrary = (
  range: [number, number]
): { multiplier: number; offset: number } => ({
  multiplier: getMultiplierForRemapFromTo([-1, 1], range),
  offset: getOffsetForRemapFromtTo([-1, 1], range),
})

export const getMaxExpression = (data: Version0Type) =>
  data[AttributeNames.Pattern]['max-distance']?.v?.['max-distance overwrite']?.value
    ? data[AttributeNames.Pattern]['max-distance']?.v?.['max-distance overwrite']?.value
    : data[AttributeNames.Pattern].expression.value
