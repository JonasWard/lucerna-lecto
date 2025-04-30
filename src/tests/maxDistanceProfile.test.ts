import { expect, test } from 'bun:test'
import { getArcData } from '../webgl'

const symbols = 22
const positions = [...Array(30)].map((_, i) => i / ((symbols - 1) * 0.5))
const testsToTry: [number, number][] = [
  [1, 0],
  [1, 90],
  [1, 85],
  [1, 80],
  [1, 70],
  [1, 60],
  [1, 45],
  [1, 40],
  [1, 30],
  [1, 20],
  [1, 10],
]

test('trying getArcData method', () => {
  testsToTry.forEach(([maxExpression, maxAngle]) => {
    const { dYMin, getDMax } = getArcData(maxExpression, maxAngle)
    const maxDs = positions.map((p) => (p < dYMin ? getDMax(p) : maxExpression))
    console.log(
      maxDs
        .map((d) =>
          [...Array(symbols)]
            .map((_, i) => (i === Math.round((d / maxExpression) * (symbols - 1)) ? '*' : ' '))
            .join('')
        )
        .join('\n')
    )
  })
  expect(true).toBeTruthy()
})
