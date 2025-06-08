import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { LocalTransformType, Version0Type } from 'src/modelDefinition/types/version0.generatedType'
import { JavascriptMethods } from './sdMethods'
import { contentForSwapYZ, getRotationMatrixData } from '../../helpers/sharedMethods'
import { MainMethods } from 'src/modelDefinition/types/methodSemantics'
import { getOffsetAndMultiplierForRemapFromUnitToArbitrary } from '../../helpers/remapRange'

const getTranslatedVector = (data: LocalTransformType): ((v: [number, number, number]) => [number, number, number]) => {
  const dX = data[AttributeNames.X].value
  const dY = data[AttributeNames.Y].value
  const dZ = data[AttributeNames.Z].value
  return (v): [number, number, number] => [v[0] + dX, v[1] + dY, v[2] + dZ]
}

const getInvereTranslatedVector = (
  data: LocalTransformType
): ((v: [number, number, number]) => [number, number, number]) => {
  const dX = data[AttributeNames.X].value
  const dY = data[AttributeNames.Y].value
  const dZ = data[AttributeNames.Z].value
  return (v): [number, number, number] => [v[0] - dX, v[1] - dY, v[2] - dZ]
}

const getRotatedVector = (data: LocalTransformType): ((v: [number, number, number]) => [number, number, number]) => {
  const rotationNumbers = getRotationMatrixData(data)
  const rotationMatrix = [rotationNumbers.slice(0, 3), rotationNumbers.slice(3, 6), rotationNumbers.slice(6, 9)]

  return (v) => [
    rotationMatrix[0][0] * v[0] + rotationMatrix[0][1] * v[1] + rotationMatrix[0][2] * v[2],
    rotationMatrix[1][0] * v[0] + rotationMatrix[1][1] * v[1] + rotationMatrix[1][2] * v[2],
    rotationMatrix[2][0] * v[0] + rotationMatrix[2][1] * v[1] + rotationMatrix[2][2] * v[2],
  ]
}

const getVerticalScaledVector = (verticalScale: number) => (v: [number, number, number]) =>
  [v[0], v[1], v[2] / verticalScale] as [number, number, number]
const scaleVector = (v: [number, number, number], s: number) =>
  [v[0] * s, v[1] * s, v[2] * s] as [number, number, number]
const addVector = (a: [number, number, number], b: [number, number, number]) =>
  [a[0] + b[0], a[1] + b[1], a[2] + b[2]] as [number, number, number]

const getTransformedVector = (
  data: Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v'][0]
): ((v: [number, number, number]) => [number, number, number]) => {
  if (data[AttributeNames.LocalTransformationOrNot].s.value) {
    const toPositive = getTranslatedVector(data[AttributeNames.LocalTransformationOrNot].v)
    const rotate = getRotatedVector(data[AttributeNames.LocalTransformationOrNot].v)
    return (v) => toPositive(rotate(v))
  }
  return (v) => v
}

/**
 * Method that constructs the content of the distance method
 * @param data - `Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v']`
 */
export const getGeometryDistanceMethod = (
  data: Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v']
): ((v: [number, number, number]) => number) => {
  const transformedVectorMethod = getTransformedVector(data[0])
  const sdMethod = JavascriptMethods[MainMethods[data[0].MainMethodEnum.value]]
  const scale = data[0].MethodScale.value
  return data.length === 1
    ? (v) => sdMethod(transformedVectorMethod(v), scale)
    : (v) =>
        sdMethod(
          transformedVectorMethod(v),
          scale *
            getGeometryDistanceMethod(
              data.slice(1) as Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v']
            )(v)
        )
}

export const getBumpedVector = (
  data: Version0Type
): ((p: [number, number, number], n: [number, number, number], mD: number) => [number, number, number]) => {
  const { offset, multiplier } = getOffsetAndMultiplierForRemapFromUnitToArbitrary([
    data[AttributeNames.Pattern][AttributeNames.RemapRange].from.value,
    data[AttributeNames.Pattern][AttributeNames.RemapRange].to.value,
  ])

  const distanceMethod = getGeometryDistanceMethod(data[AttributeNames.Pattern][AttributeNames.MainMethods]['v'])
  const verticalScaleMethod = getVerticalScaledVector(
    data[AttributeNames.Pattern][AttributeNames.ExpressionScale].value
  )
  const expression = data[AttributeNames.Pattern].expression.value
  const rotationMatrix = [contentForSwapYZ.slice(0, 3), contentForSwapYZ.slice(3, 6), contentForSwapYZ.slice(6, 9)]
  const transformToXZY = (v: [number, number, number]) =>
    [
      rotationMatrix[0][0] * v[0] + rotationMatrix[0][1] * v[1] + rotationMatrix[0][2] * v[2],
      rotationMatrix[1][0] * v[0] + rotationMatrix[1][1] * v[1] + rotationMatrix[1][2] * v[2],
      rotationMatrix[2][0] * v[0] + rotationMatrix[2][1] * v[1] + rotationMatrix[2][2] * v[2],
    ] as [number, number, number]
  return (p, n, mD) =>
    transformToXZY(
      addVector(
        p,
        scaleVector(
          n,
          Math.max(0.0, Math.min(mD, (offset + multiplier * distanceMethod(verticalScaleMethod(p))) * expression))
        )
      )
    )
}
