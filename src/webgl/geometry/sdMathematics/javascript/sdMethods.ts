import { MainMethodType, MethodNames } from 'src/modelDefinition/types/methodSemantics'

const eM = {
  sin: (content: string) => `${content}.map(Math.sin)`,
  cos: (content: string) => `${content}.map(Math.cos)`,
  dot: (a: string, b: string) => `${a}.map((v, i) => v * ${b}[i]).reduce((a, b) => a + b, 0.0)`,
  mul: (a: string, b: string) => `${a}.map((v, i) => v * ${b})`,
  add: (a: string, b: string) => `${a}.map((v, i) => v + ${b}[i])`,
  x: (content: string) => `${content}[0]`,
  y: (content: string) => `${content}[1]`,
  z: (content: string) => `${content}[2]`,
  xy: (content: string) => `[${content}[0], ${content}[1]]`,
  yzx: (content: string) => `[${content}[1], ${content}[2], ${content}[0]]`,
}

const getMethodWrapper = (content: string): ((v: [number, number, number], s: number) => number) =>
  eval(`(v, s) => {
  ${content}
  return d;
}`)

export const JavascriptMethods: Record<MainMethodType, (v: [number, number, number], s: number) => number> = {
  [MethodNames.Gyroid]: getMethodWrapper(
    `const sV = ${eM.sin(eM.mul('v', 's'))};
const cV = ${eM.cos(eM.mul(eM.yzx('v'), 's'))};
const d = ${eM.dot('sV', 'cV')} * 0.33333;`
  ),
  [MethodNames.SchwarzD]: getMethodWrapper(
    `const sV = ${eM.sin(eM.mul('v', 's'))};
const cV = ${eM.cos(eM.mul('v', 's'))};
const d = (sV[0] * sV[1] * sV[2] + sV[0] * cV[1] * cV[2] + cV[0] * sV[1] * cV[2] + cV[0] * cV[1] * sV[2]) * .33333;`
  ),
  [MethodNames.SchwarzP]: getMethodWrapper(
    `const cV = ${eM.cos(eM.mul('v', 's'))};
const d = (cV[0] + cV[1] + cV[2]) * .3333;`
  ),
  [MethodNames.Perlin]: getMethodWrapper('const d = s;'),
  [MethodNames.Neovius]: getMethodWrapper(
    `const cV = ${eM.cos(eM.mul('v', 's'))};
const d = (3.*(cV[0] + cV[1] + cV[2]) + 4 * cV[0] * cV[1] * cV[2]) * 0.0769;`
  ),
  [MethodNames.Mandelbrot]: getMethodWrapper(
    `const complexMult = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const coord = ${eM.mul(eM.xy('v'), 's')};
let d = 0.0;
// turn this up to 5000 or so if you have a good gpu
// for better details but less vibrant color in extreme zoom
const iterations = 50;
let testPoint = [0,0];
for (let i = 0; i < iterations; i++){
  testPoint = ${eM.add('complexMult(testPoint,testPoint)', 'coord')};
  const ndot = ${eM.dot('testPoint', 'testPoint')};
  if (ndot > 45678.0) {
    const sl = i - Math.log2(Math.log2(ndot))+4.0;
    d = 1.0;
    break;
  }
}`
  ),
  [MethodNames.Sin]: getMethodWrapper(
    `const sV = ${eM.sin(eM.mul('v', 's'))};
const d = ${eM.dot('sV', 'sV')} ** .5 * 0.5777;`
  ),
}
