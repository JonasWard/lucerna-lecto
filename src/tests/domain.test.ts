import { expect, test } from 'bun:test'
import { Mesh } from '../webgl/geometry/mesh/type'
import { catmullClark } from '../webgl/geometry/mesh/modifier'
import { getDomains } from '../webgl/geometry/mesh/sdDomains'

const n = { x: 0, y: 0, z: 1 }

test('tyring domains', () => {
  getDomains()
  expect(true).toBeTruthy()
})
