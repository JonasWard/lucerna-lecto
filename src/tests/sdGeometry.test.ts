import { expect, test } from 'bun:test'
import { JavascriptMethods } from 'src/webgl/geometry/sdMathematics/javascript/sdMethods'
// trying whether the javascript geometry methods actually return the correct values

test('JavascriptMethods - trying out whether the methods actually return values', () => {
  JavascriptMethods.Gyroid([0, 0, 0], 1)

  expect(JavascriptMethods.Gyroid([0, 0, 0], 1)).toBeCloseTo(0)
  expect(JavascriptMethods.Mandelbrot([0, 0, 0], 1)).toBeCloseTo(0)
  expect(JavascriptMethods.Perlin([0, 0, 0], 1)).toBeCloseTo(1)
  expect(JavascriptMethods.Sine([0, 0, 0], 1)).toBeCloseTo(0)
  expect(JavascriptMethods.Neovius([0, 0, 0], 1)).toBeCloseTo(1)
  expect(JavascriptMethods.SchwarzD([0, 0, 0], 1)).toBeCloseTo(0)
  expect(JavascriptMethods.SchwarzP([0, 0, 0], 1)).toBeCloseTo(1)
})
