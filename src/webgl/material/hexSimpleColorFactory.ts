import { SimpleColor } from '../geometry/helpers/simpleColor';
import { VoxelState } from '../geometry/voxelComplex/types/voxelState';
import { maxStateSize } from '../geometry/voxelComplex/voxelComplex.states';
import { PLASMA } from './colors/plasma';
import { TWILIGHT } from './colors/twilight';
import { VIRIDIS } from './colors/viridis';
import { MaterialOptions } from './material';

export enum MaterialUUIDColorStates {
  RED = 'Red',
  GREEN = 'Green',
  BLUE = 'Blue',
  RGB = 'RGB',
  BLACK_AND_WHITE = 'Black and White',
  VIRIDIS = 'Viridis',
  TWILIGHT = 'Twilight',
  PLASMA = 'Plasma',
}

export class HexSimpleColorFactory {
  public static UUIDColorOptions: MaterialUUIDColorStates = MaterialUUIDColorStates.TWILIGHT;

  static colorFromNumbers = (R: number, G: number, B: number): SimpleColor => ({ R, G, B });
  static colorFromHexString = (s: string): SimpleColor =>
    HexSimpleColorFactory.colorFromNumbers(Number.parseInt(s.slice(1, 3), 16), Number.parseInt(s.slice(3, 5), 16), Number.parseInt(s.slice(5, 7), 16));

  // red hui
  private static getColorFromUUIDRed = (s: string) => HexSimpleColorFactory.colorFromHexString(`#ff${s.slice(0, 2)}${s.slice(0, 2)}`);
  // green hui
  private static getColorFromUUIDGreen = (s: string) => HexSimpleColorFactory.colorFromHexString(`#${s.slice(0, 2)}ff${s.slice(0, 2)}`);
  // blue hui
  private static getColorFromUUIDBlue = (s: string) => HexSimpleColorFactory.colorFromHexString(`#${s.slice(0, 2)}${s.slice(0, 2)}ff`);
  // normal colors
  private static getColorFromUUIDRGB = (s: string) => HexSimpleColorFactory.colorFromHexString(`#${s.slice(0, 6)}`);
  // black and white
  private static getColorFromUUIDBlackAndWhite = (s: string) => HexSimpleColorFactory.colorFromHexString(`#${s.slice(0, 2)}${s.slice(0, 2)}${s.slice(0, 2)}`);

  private static maxValue = 2 ** 24 - 1;
  private static inverseMaxValue = 1 / HexSimpleColorFactory.maxValue;

  //
  private static getColorInArray = (s: string, a: [number, number, number][]): SimpleColor => {
    const v = parseInt(s, 16) * HexSimpleColorFactory.inverseMaxValue;
    const index = v * (a.length - 1);
    const i0 = Math.floor(index);
    const i1 = Math.ceil(index);

    if (i0 === i1) return HexSimpleColorFactory.colorFromNumbers(...a[i0]);
    const f = index - i0;
    return HexSimpleColorFactory.colorFromNumbers(a[i0][0] * (1 - f) + a[i1][0] * f, a[i0][1] * (1 - f) + a[i1][1] * f, a[i0][2] * (1 - f) + a[i1][2] * f);
  };

  private static getColorFromUUIDViridis = (s: string) => HexSimpleColorFactory.getColorInArray(s, VIRIDIS);
  private static getColorFromUUIDTwilight = (s: string) => HexSimpleColorFactory.getColorInArray(s, TWILIGHT);
  private static getColorFromUUIDPlasma = (s: string) => HexSimpleColorFactory.getColorInArray(s, PLASMA);

  private static getColorFromUnitValue = (v: number, a: [number, number, number][]) => {
    const localV = Math.min(Math.max(v, 0), 1);
    const index = localV * (a.length - 1);
    const i0 = Math.floor(index);
    const i1 = Math.ceil(index);

    if (i0 === i1) return HexSimpleColorFactory.colorFromNumbers(...a[i0]);
    const f = index - i0;
    return HexSimpleColorFactory.colorFromNumbers(a[i0][0] * (1 - f) + a[i1][0] * f, a[i0][1] * (1 - f) + a[i1][1] * f, a[i0][2] * (1 - f) + a[i1][2] * f);
  };

  public static getViridisColorFromUnitValue = (v: number) => HexSimpleColorFactory.getColorFromUnitValue(v, VIRIDIS);
  public static getTwilightColorFromUnitValue = (v: number) => HexSimpleColorFactory.getColorFromUnitValue(v, TWILIGHT);
  public static getPlasmaColorFromUnitValue = (v: number) => HexSimpleColorFactory.getColorFromUnitValue(v, PLASMA);

  // get color from uuid based on HexColorFactory.uuidcoloroptions
  public static getColorFromUUID = (s: string) => {
    switch (HexSimpleColorFactory.UUIDColorOptions) {
      case MaterialUUIDColorStates.RGB:
        return HexSimpleColorFactory.getColorFromUUIDRGB(s);
      case MaterialUUIDColorStates.RED:
        return HexSimpleColorFactory.getColorFromUUIDRed(s);
      case MaterialUUIDColorStates.GREEN:
        return HexSimpleColorFactory.getColorFromUUIDGreen(s);
      case MaterialUUIDColorStates.BLUE:
        return HexSimpleColorFactory.getColorFromUUIDBlue(s);
      case MaterialUUIDColorStates.BLACK_AND_WHITE:
        return HexSimpleColorFactory.getColorFromUUIDBlackAndWhite(s);
      case MaterialUUIDColorStates.VIRIDIS:
        return HexSimpleColorFactory.getColorFromUUIDViridis(s);
      case MaterialUUIDColorStates.TWILIGHT:
        return HexSimpleColorFactory.getColorFromUUIDTwilight(s);
      case MaterialUUIDColorStates.PLASMA:
        return HexSimpleColorFactory.getColorFromUUIDPlasma(s);
    }
  };

  public static getHexStringForNumber = (n: number, max?: number): string => {
    const localValue = Math.min(Math.max(max ? n / max : n, 0), 1);
    return Math.floor(HexSimpleColorFactory.maxValue * localValue).toString(16);
  };

  public static getHexStringForSimpleColor = (c: SimpleColor) =>
    `#${Math.round(c.R).toString(16)}${Math.round(c.G).toString(16)}${Math.round(c.B).toString(16)}`;

  public static getSimpleColorForUuid = (uuid: string): SimpleColor => HexSimpleColorFactory.colorFromHexString(uuid.slice(0, 6));
}
