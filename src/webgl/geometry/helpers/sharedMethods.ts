import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { LocalTransformType } from 'src/modelDefinition/types/version0.generatedType'
import { RotationNumbers } from './transformationContentType'

// prettier-ignore
/**
 * Content for 3x3 matrix describing the swapping of the Y and Z axis
 */
export const contentForSwapYZ = [
  1.0, 0.0, 0.0,
  0.0, 0.0, 1.0,
  0.0, -1.0, 0.0
] as RotationNumbers

/**
 * Method to get the values for the 3x3 rotation matrix
 * @param data - LocalTransformType
 * @returns number[] (length 9)
 */
export const getRotationMatrixData = (data: LocalTransformType): RotationNumbers => {
  const aC = Math.cos((data[AttributeNames.Roll].value * Math.PI) / 180)
  const aS = Math.sin((data[AttributeNames.Roll].value * Math.PI) / 180)
  const bC = Math.cos((data[AttributeNames.Pitch].value * Math.PI) / 180)
  const bS = Math.sin((data[AttributeNames.Pitch].value * Math.PI) / 180)
  const cC = Math.cos((data[AttributeNames.Yaw].value * Math.PI) / 180)
  const cS = Math.sin((data[AttributeNames.Yaw].value * Math.PI) / 180)

  // prettier-ignore
  return [
    aC * bC, aC * bS * cS - aS * cC, aC * bS * cC + aS * cS,
    aS * bC, aS * bS * cS - aC * cC, aS * bS * cC - aC * cS,
    -bS, bC * cS, bC * cC,
  ]
}
