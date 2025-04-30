import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { ColorType, Version0Type } from 'src/modelDefinition/types/version0.generatedType'
import { MainMethods } from 'src/modelDefinition/types/methodSemantics'
import { getSdMethodNameForMethodName, ShaderMethods } from './shaderMethods'

const getStringRepresentationOfValue = (value: number): string => value.toFixed(3)

/**
 * Method that constructs the content of the distance method
 * @param data - `Version0Type[AttributeNames.MainMethods]['v']`
 */
export const getShaderDistanceMethod = (data: Version0Type[AttributeNames.MainMethods]['v']): string =>
  data.length === 1
    ? `${getSdMethodNameForMethodName(MainMethods[data[0].MainMethodEnum.value])}(v, ${getStringRepresentationOfValue(
        data[0].MethodScale.value
      )})`
    : `${getSdMethodNameForMethodName(MainMethods[data[0].MainMethodEnum.value])}(v, ${getStringRepresentationOfValue(
        data[0].MethodScale.value
      )} * ${getShaderDistanceMethod(data.slice(1) as Version0Type[AttributeNames.MainMethods]['v'])})`

/**
 * Method that constructs the fragment shader
 * @param data - `Version0Type[AttributeNames.MainMethods]['v']`
 */
export const getDistanceContentString = (data: Version0Type[AttributeNames.MainMethods]['v']): string =>
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
 * Method that constructs the fragment shader
 * @param data - `Version0Type[AttributeNames.MainMethods]['v']`
 */
export const getFragmentShader = (data: Version0Type): string => `const vec3 color = vec3(${getColorString(
  (data[AttributeNames.Material]['Normal Material'].v as any).color as ColorType
)});
${getDistanceContentString(data[AttributeNames.MainMethods]['v'])}

void main() {
  float d = max(0.0, min(mD,sdMain(p)));
  gl_FragColor = vec4(color * (1.0 - (d * 0.1)), 1.0);
}`

/**
 * Method that constructs the vertex shader
 * @param data - `Version0Type`
 */
export const getVertexShader = (data: Version0Type): string => `attribute float maxDistance;
${getDistanceContentString(data[AttributeNames.MainMethods]['v'])}

void main() { 
  mD = maxDistance;
  vec3 transformed = position + normal * max(0.0, min(mD,sdMain(position) * ${getStringRepresentationOfValue(
    data[AttributeNames.GlobalGeometry].expression.value
  )}));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  p = position;
}`
