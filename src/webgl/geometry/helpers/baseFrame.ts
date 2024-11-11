import { WorldXY } from './transformation';
import { V3 } from './v3';

export interface BaseFrame {
  o: V3;
  x: V3;
  y: V3;
  z: V3;
}

export class BaseFrameFactory {
  public static getBaseFramArrayAlongDirection = (d: V3, count = 3, spacing = 0.1, o = WorldXY.o, x = WorldXY.x, y = WorldXY.y, z = WorldXY.z): BaseFrame[] => {
    const frames: BaseFrame[] = [];
    for (let i = 0; i < count; i++) {
      frames.push({
        o: V3.add(o, V3.mul(d, i * spacing)),
        x,
        y,
        z,
      });
    }
    return frames;
  };

  public static getBaseFramArrayAlongDirectionForSpacings = (
    d: V3,
    spacings: number[] = [0, 0.1],
    o = WorldXY.o,
    x = WorldXY.x,
    y = WorldXY.y,
    z = WorldXY.z
  ): BaseFrame[] =>
    spacings.map((spacing) => ({
      o: V3.add(o, V3.mul(d, spacing)),
      x,
      y,
      z,
    }));
}
