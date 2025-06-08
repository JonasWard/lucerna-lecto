import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { ColorType, LocalTransformType, Version0Type } from 'src/modelDefinition/types/version0.generatedType'
import { MainMethods } from 'src/modelDefinition/types/methodSemantics'
import { getSdMethodNameForMethodName, ShaderMethods } from './sdMethods'
import { contentForSwapYZ, getRotationMatrixData } from '../../helpers/sharedMethods'
import { RotationNumbers } from '../../helpers/transformationContentType'
import { getMaxExpression, getOffsetAndMultiplierForRemapFromUnitToArbitrary } from '../../helpers/remapRange'

const getStringRepresentationOfValue = (value: number): string => value.toFixed(4)

const getMat3FromNumbers = (vs: RotationNumbers): string => `mat3(
  ${vs.slice(0, 3).map(getStringRepresentationOfValue).join(', ')},
  ${vs.slice(3, 6).map(getStringRepresentationOfValue).join(', ')},
  ${vs.slice(6, 9).map(getStringRepresentationOfValue).join(', ')}
)`

const getRotationMatrix = (data: LocalTransformType): string => getMat3FromNumbers(getRotationMatrixData(data))
const getSwapYZMatrix = (): string => getMat3FromNumbers(contentForSwapYZ)

const getTranslationVector = (data: LocalTransformType): string =>
  `vec3(${getStringRepresentationOfValue(data[AttributeNames.X].value)},${getStringRepresentationOfValue(
    data[AttributeNames.Y].value
  )},${getStringRepresentationOfValue(data[AttributeNames.Z].value)})`

const getTranslationData = (data: Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v'][0]): string => {
  if (data[AttributeNames.LocalTransformationOrNot].s.value) {
    const translationVector = getTranslationVector(data[AttributeNames.LocalTransformationOrNot].v)
    const rotationMatrix = getRotationMatrix(data[AttributeNames.LocalTransformationOrNot].v)

    return `v * ${rotationMatrix} + ${translationVector}`
  }
  return 'v'
}

/**
 * Method that constructs the content of the distance method
 * @param data - `Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v']`
 */
export const getShaderDistanceMethod = (
  data: Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v']
): string =>
  data.length === 1
    ? `${getSdMethodNameForMethodName(MainMethods[data[0].MainMethodEnum.value])}(${getTranslationData(
        data[0]
      )}, ${getStringRepresentationOfValue(data[0].MethodScale.value)})`
    : `${getSdMethodNameForMethodName(MainMethods[data[0].MainMethodEnum.value])}(${getTranslationData(
        data[0]
      )}, ${getStringRepresentationOfValue(data[0].MethodScale.value)} * ${getShaderDistanceMethod(
        data.slice(1) as Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v']
      )})`

/**
 * Method that constructs the fragment shader
 * @param data - `Version0Type[AttributeNames.MainMethods]['v']`
 */
export const getDistanceContentString = (data: Version0Type[AttributeNames.Pattern]): string => {
  const { offset, multiplier } = getOffsetAndMultiplierForRemapFromUnitToArbitrary([
    data[AttributeNames.RemapRange].from.value,
    data[AttributeNames.RemapRange].to.value,
  ])

  return [
    'varying float mD;',
    'varying vec3 p;',
    ...[...new Set(data[AttributeNames.MainMethods]['v'].map((d) => MainMethods[d.MainMethodEnum.value]))].map(
      (method) => ShaderMethods[method]
    ),
    `float sdMain(vec3 v) { return ${getStringRepresentationOfValue(offset)} + ${getStringRepresentationOfValue(
      multiplier
    )} * ${getShaderDistanceMethod(data[AttributeNames.MainMethods]['v'])}; }`,
  ].join('\n\n')
}

/**
 * Method to get vec3 values for the color
 * @param data - `Version0Type[AttributeNames.Material]['Normal Material']
 */
export const getColorString = (color: ColorType): string =>
  `vec3(${getStringRepresentationOfValue(color.R.value / 255)}, ${getStringRepresentationOfValue(
    color.G.value / 255
  )}, ${getStringRepresentationOfValue(color.B.value / 255)})`

/**
 * Helper method to get the scale values along z direction stored in a vec3
 * @param data
 * @returns
 */
const getScale = (data: Version0Type): string =>
  `vec3(1.0, 1.0, ${getStringRepresentationOfValue(
    1 / data[AttributeNames.Pattern][AttributeNames.ExpressionScale].value
  )})`

/**
 * Method that constructs the fragment shader
 * @param data - `Version0Type[AttributeNames.MainMethods]['v']`
 */
export const getFragmentShader = (data: Version0Type): string => `const vec3 color = vec3(${getColorString(
  data[AttributeNames.Material].color as ColorType
)});
${getDistanceContentString(data[AttributeNames.Pattern])}

void main() {
  if (p.z == ${getStringRepresentationOfValue(data[AttributeNames.LampShades].v.h.value)} || mD == 0.0) {
    gl_FragColor = vec4(color, 1.0);
    return;
  }
  float d = sdMain(p * ${getScale(data)});
  float colorD = max(0.0, min(1.0, d * ${getStringRepresentationOfValue(1 / (getMaxExpression(data) ?? 1.0))}));
  if (d * ${getStringRepresentationOfValue(data[AttributeNames.Pattern].expression.value)} > mD) {
    gl_FragColor = vec4(color, 1.0);
    return;
  }
  gl_FragColor = vec4(color * (1.0 - (d * ${getStringRepresentationOfValue(
    data[AttributeNames.Material]['color-expression'].value
  )})), 1.0);
}`

/**
 * Method that constructs the vertex shader
 * @param data - `Version0Type`
 */
export const getVertexShader = (data: Version0Type): string => `attribute float maxDistance;
${getDistanceContentString(data[AttributeNames.Pattern])}

void main() { 
  mD = maxDistance;
  vec3 transformed = position + normal * max(0.0, min(mD, sdMain(position * ${getScale(
    data
  )}) * ${getStringRepresentationOfValue(data[AttributeNames.Pattern].expression.value)}));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed * ${getSwapYZMatrix()}, 1.0);
  p = position;
}`

