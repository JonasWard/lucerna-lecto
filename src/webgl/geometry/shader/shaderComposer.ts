import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { ColorType, LocalTransformType, Version0Type } from 'src/modelDefinition/types/version0.generatedType'
import { MainMethods } from 'src/modelDefinition/types/methodSemantics'
import { getSdMethodNameForMethodName, ShaderMethods } from './shaderMethods'

const getStringRepresentationOfValue = (value: number): string => value.toFixed(3)

const getMat3FromNumbers = (
  vs: [number, number, number, number, number, number, number, number, number]
): string => `mat3(
  ${vs.slice(0, 3).map(getStringRepresentationOfValue).join(', ')},
  ${vs.slice(3, 6).map(getStringRepresentationOfValue).join(', ')},
  ${vs.slice(6, 9).map(getStringRepresentationOfValue).join(', ')}
)`

const getRotationMatrix = (data: LocalTransformType): string => {
  const aC = Math.cos((data[AttributeNames.Roll].value * Math.PI) / 180)
  const aS = Math.sin((data[AttributeNames.Roll].value * Math.PI) / 180)
  const bC = Math.cos((data[AttributeNames.Pitch].value * Math.PI) / 180)
  const bS = Math.sin((data[AttributeNames.Pitch].value * Math.PI) / 180)
  const cC = Math.cos((data[AttributeNames.Yaw].value * Math.PI) / 180)
  const cS = Math.sin((data[AttributeNames.Yaw].value * Math.PI) / 180)

  // prettier-ignore
  return getMat3FromNumbers([
    aC * bC, aC * bS * cS - aS * cC, aC * bS * cC + aS * cS,
    aS * bC, aS * bS * cS - aC * cC, aS * bS * cC - aC * cS,
    - bS, bC * cS, bC * cC
  ])
}

const getTranslationVector = (data: LocalTransformType): string =>
  `vec3(${getStringRepresentationOfValue(data[AttributeNames.X].value)},${getStringRepresentationOfValue(
    data[AttributeNames.Y].value
  )},${getStringRepresentationOfValue(data[AttributeNames.Z].value)})`

const getTranslationData = (data: Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v'][0]): string =>
  data[AttributeNames.LocalTransformationOrNot].s.value
    ? `v * ${getRotationMatrix(data[AttributeNames.LocalTransformationOrNot].v)} + ${getTranslationVector(
        data[AttributeNames.LocalTransformationOrNot].v
      )}`
    : 'v'

/**
 * Method that constructs the content of the distance method
 * @param data - `Version0Type[AttributeNames.MainMethods]['v']`
 */
export const getShaderDistanceMethod = (data: Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v']): string =>
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
export const getDistanceContentString = (
  data: Version0Type[AttributeNames.Pattern][AttributeNames.MainMethods]['v']
): string =>
  [
    'varying float mD;',
    'varying vec3 p;',
    ...[...new Set(data.map((d) => MainMethods[d.MainMethodEnum.value]))].map((method) => ShaderMethods[method]),
    `float sdMain(vec3 v) { return ${getShaderDistanceMethod(data)}; }`,
  ].join('\n\n')

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
  `vec3(1.0, ${getStringRepresentationOfValue(
    1 / data[AttributeNames.Pattern][AttributeNames.ExpressionScale].value
  )}, 1.0)`

/**
 * Method that constructs the fragment shader
 * @param data - `Version0Type[AttributeNames.MainMethods]['v']`
 */
export const getFragmentShader = (data: Version0Type): string => `const vec3 color = vec3(${getColorString(
  data[AttributeNames.Material].color as ColorType
)});
${getDistanceContentString(data[AttributeNames.Pattern][AttributeNames.MainMethods]['v'])}

void main() {
  float d = max(0.0, min(mD,sdMain(p * ${getScale(data)})));
  gl_FragColor = vec4(color * (1.0 - (d * ${getStringRepresentationOfValue(
    data[AttributeNames.Material]['color-expression'].value
  )})), 1.0);
}`

/**
 * Method that constructs the vertex shader
 * @param data - `Version0Type`
 */
export const getVertexShader = (data: Version0Type): string => `attribute float maxDistance;
${getDistanceContentString(data[AttributeNames.Pattern][AttributeNames.MainMethods]['v'])}

void main() { 
  mD = maxDistance;
  vec3 transformed = position + normal * max(0.0, min(mD,sdMain(position * ${getScale(
    data
  )}) * ${getStringRepresentationOfValue(data[AttributeNames.GlobalGeometry].expression.value)}));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  p = position;
}`
