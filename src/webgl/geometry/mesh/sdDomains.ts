import { V3 } from '../helpers/v3'
import { sdGyroid, sdSchwarzP, sdSchwarzD, sdNeovius } from './sdMethods'

export const getDomains = () => {
  const v3s: V3[] = []

  const cnt = 200
  const delta = Math.PI / cnt

  const xs = []

  for (let i = 0; i < cnt; i++) xs.push(i * delta)

  let max_gyroids = 0
  let max_schwarzPs = 0
  let max_schwarzDs = 0
  let max_neovius = 0

  const vs: V3[] = []
  for (let i = 0; i < cnt; i++) {
    for (let j = 0; j < cnt; j++) {
      for (let k = 0; k < cnt; k++) {
        const v = { x: xs[i], y: xs[j], z: xs[k] }

        const gyroids = sdGyroid(v)
        if (gyroids > max_gyroids) max_gyroids = gyroids
        const schwarzPs = sdSchwarzP(v)
        if (schwarzPs > max_schwarzPs) max_schwarzPs = schwarzPs
        const schwarzDs = sdSchwarzD(v)
        if (schwarzDs > max_schwarzDs) max_schwarzDs = schwarzDs
        const neovius = sdNeovius(v)
        if (neovius > max_neovius) max_neovius = neovius
      }
    }
  }
  console.log(max_gyroids, max_schwarzPs, max_schwarzDs, max_neovius)
}
