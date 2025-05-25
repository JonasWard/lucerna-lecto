import { MainMethodType, MethodNames } from 'src/modelDefinition/types/methodSemantics'

export const getSdMethodNameForMethodName = (name: MainMethodType): string => `sd${name}`
const getMethodWrapper = (name: MainMethodType, content: string): string => `float ${getSdMethodNameForMethodName(
  name
)}(vec3 v, float s) {
  ${content}
  return d;
}`

export const ShaderMethods: Record<MainMethodType, string> = {
  [MethodNames.Gyroid]: getMethodWrapper(MethodNames.Gyroid, 'float d = dot(sin(v * s), cos(v.yzx * s)) * .3333;'),
  [MethodNames.SchwarzD]: getMethodWrapper(
    MethodNames.SchwarzD,
    `vec3 sV = sin(v * s);
vec3 cV = cos(v * s);
float d = sV.x * sV.y * sV.z + sV.x * cV.y * cV.z + cV.x * sV.y * cV.z + cV.x * cV.y * sV.z;
d *= .3333;`
  ),
  [MethodNames.SchwarzP]: getMethodWrapper(
    MethodNames.SchwarzP,
    `vec3 cV = cos(v * s);
float d = (cV.x + cV.y + cV.z) * .3333;`
  ),
  [MethodNames.Perlin]: getMethodWrapper(MethodNames.Perlin, 'float d = s;'),
  [MethodNames.Neovius]: getMethodWrapper(
    MethodNames.Neovius,
    `vec3 cV = cos(v * s);
float d = (3.*(cV.x+cV.y+cV.z)+4.*cV.x*cV.y*cV.z) * 0.0769;`
  ),
  [MethodNames.Mandelbrot]: `vec2 complexMult(vec2 a, vec2 b) {
	return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}
  
${getMethodWrapper(
  MethodNames.Mandelbrot,
  `vec2 coord = vec2(v.x, v.y) * s;
float d = 0.0;
// turn this up to 5000 or so if you have a good gpu
// for better details but less vibrant color in extreme zoom
const int iterations = 50;
vec2 testPoint = vec2(0,0);
for (int i = 0; i < iterations; i++){
  testPoint = complexMult(testPoint,testPoint) + coord;
  float ndot = dot(testPoint,testPoint);
  if (ndot > 45678.0) {
    float sl = float(i) - log2(log2(ndot))+4.0;
    d = 1.0;
    break;
  }
}`
)}`,
  [MethodNames.Sin]: getMethodWrapper(MethodNames.Sin, 'float d = length(sin(v * s)) * 0.5777;'),
}
