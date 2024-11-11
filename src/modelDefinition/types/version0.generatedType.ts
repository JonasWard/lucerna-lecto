import { DataType } from 'url-safe-bitpacking';

type ColorType = {
  ['R']: { value: number; name: 'R'; type: DataType.INT; min: 0; max: 255; bits: 8 };
  ['G']: { value: number; name: 'G'; type: DataType.INT; min: 0; max: 255; bits: 8 };
  ['B']: { value: number; name: 'B'; type: DataType.INT; min: 0; max: 255; bits: 8 };
};

export type ExtrusionSquareValue = {
  ['Upper Inset']: { value: number; name: 'Upper Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Bottom Inset']: { value: number; name: 'Bottom Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Side Inset']: { value: number; name: 'Side Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
};

export type ExtrusionArcValue = {
  ['Upper Radius']: { value: number; name: 'Upper Radius'; type: DataType.FLOAT; min: 0.2; max: 1; precision: 2; significand: 7 };
  ['Upper Inset']: { value: number; name: 'Upper Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Bottom Inset']: { value: number; name: 'Bottom Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Side Inset']: { value: number; name: 'Side Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
};

export type ExtrusionEllipseValue = {
  ['Upper Radius']: { value: number; name: 'Upper Radius'; type: DataType.FLOAT; min: 0.2; max: 1; precision: 2; significand: 7 };
  ['Upper Inset']: { value: number; name: 'Upper Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Bottom Inset']: { value: number; name: 'Bottom Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Side Inset']: { value: number; name: 'Side Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
};

export type ExtrusionGothicValue = {
  ['Upper Radius']: { value: number; name: 'Upper Radius'; type: DataType.FLOAT; min: 0.2; max: 1; precision: 2; significand: 7 };
  ['Upper Inset']: { value: number; name: 'Upper Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Bottom Inset']: { value: number; name: 'Bottom Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Side Inset']: { value: number; name: 'Side Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Pointedness']: { value: number; name: 'Pointedness'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
};

export type ExtrusionNestedValue = {
  ['Upper Radius']: { value: number; name: 'Upper Radius'; type: DataType.FLOAT; min: 0.2; max: 1; precision: 2; significand: 7 };
  ['Upper Inset']: { value: number; name: 'Upper Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Bottom Inset']: { value: number; name: 'Bottom Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Side Inset']: { value: number; name: 'Side Inset'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Pointedness']: { value: number; name: 'Pointedness'; type: DataType.FLOAT; min: 0.1; max: 0.5; precision: 2; significand: 6 };
  ['Arch Resolution']: { value: number; name: 'Arch Resolution'; type: DataType.FLOAT; min: 0; max: 1; precision: 2; significand: 7 };
  ['Divisons']: { value: number; name: 'Divisons'; type: DataType.INT; min: 1; max: 10; bits: 4 };
  ['Division Resolution']: { value: number; name: 'Division Resolution'; type: DataType.INT; min: 1; max: 32; bits: 5 };
};

export type FootprintSquare = {
  ['Size']: { value: number; name: 'Size'; type: DataType.FLOAT; min: 40; max: 120; precision: 0; significand: 7 };
};

export type FootprintGridType = {
  ['Size']: { value: number; name: 'Size'; type: DataType.FLOAT; min: 8; max: 120; precision: 0; significand: 7 };
  ['X Count']: { value: number; name: 'X Count'; type: DataType.INT; min: 1; max: 16; bits: 4 };
  ['Y Count']: { value: number; name: 'Y Count'; type: DataType.INT; min: 1; max: 16; bits: 4 };
  ['Shell Thickness']: { value: number; name: 'Shell Thickness'; type: DataType.ENUM; max: 3; bits: 2 };
  ['Inner Buffer']: { value: number; name: 'Inner Buffer'; type: DataType.FLOAT; min: 0; max: 10; precision: 1; significand: 7 };
  ['Outer Buffer']: { value: number; name: 'Outer Buffer'; type: DataType.FLOAT; min: 0; max: 10; precision: 1; significand: 7 };
};

export type FootprintCylinderType = {
  ['Inner Buffer']: { value: number; name: 'Inner Buffer'; type: DataType.FLOAT; min: 0; max: 10; precision: 1; significand: 7 };
  ['Outer Buffer']: { value: number; name: 'Outer Buffer'; type: DataType.FLOAT; min: 0; max: 10; precision: 1; significand: 7 };
  ['Segments']: { value: number; name: 'Segments'; type: DataType.INT; min: 3; max: 20; bits: 5 };
  ['Radii']:
    | {
        s: { value: 1; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      }
    | {
        s: { value: 2; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      }
    | {
        s: { value: 3; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      }
    | {
        s: { value: 4; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      }
    | {
        s: { value: 5; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      }
    | {
        s: { value: 6; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      }
    | {
        s: { value: 7; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      }
    | {
        s: { value: 8; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      }
    | {
        s: { value: 9; name: 'Radii'; type: DataType.INT; min: 1; max: 10; bits: 4 };
        v: [
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          },
          {
            ['Radii']: { value: number; name: 'Radii'; type: DataType.FLOAT; min: 1; max: 20; precision: 1; significand: 8 };
          }
        ];
      };
};

export type FootprintMalculmiusOne = {
  ['Circle Radius']: { value: number; name: 'Circle Radius'; type: DataType.FLOAT; min: 10; max: 55; precision: 1; significand: 9 };
  ['Circle Divisions']: { value: number; name: 'Circle Divisions'; type: DataType.INT; min: 3; max: 20; bits: 5 };
  ['Split Angle']: { value: number; name: 'Split Angle'; type: DataType.FLOAT; min: 0.1; max: 0.9; precision: 2; significand: 7 };
  ['Offset A']: { value: number; name: 'Offset A'; type: DataType.FLOAT; min: -20; max: 20; precision: 1; significand: 9 };
  ['Offset B']: { value: number; name: 'Offset B'; type: DataType.FLOAT; min: -20; max: 20; precision: 1; significand: 9 };
  ['Inner Radius']: { value: number; name: 'Inner Radius'; type: DataType.FLOAT; min: 4; max: 40; precision: 1; significand: 9 };
};

export type HeightsSineType = {
  ['Maximum Amplitude']: { value: number; name: 'Maximum Amplitude'; type: DataType.FLOAT; min: 0; max: 15; precision: 1; significand: 8 };
  ['Minimum Amplitude']: { value: number; name: 'Minimum Amplitude'; type: DataType.FLOAT; min: 0; max: 5; precision: 2; significand: 9 };
  ['Period']: { value: number; name: 'Period'; type: DataType.FLOAT; min: 0.2; max: 200; precision: 1; significand: 11 };
  ['Phase Shift']: { value: number; name: 'Phase Shift'; type: DataType.FLOAT; min: 0; max: 90; precision: 1; significand: 10 };
};

export type HeightsIncrementalType = {
  ['Total']: { value: number; name: 'Total'; type: DataType.FLOAT; min: 10; max: 200; precision: -1; significand: 5 };
  ['Linear Twist']: { value: number; name: 'Linear Twist'; type: DataType.FLOAT; min: 0; max: 15; precision: 2; significand: 11 };
};

export type Version0Type = {
  ['Viewport']: {
    ['Camera Target']: {
      ['X']: { value: number; name: 'X'; type: DataType.FLOAT; min: -1000; max: 1000; precision: 1; significand: 15 };
      ['Y']: { value: number; name: 'Y'; type: DataType.FLOAT; min: -1000; max: 1000; precision: 1; significand: 15 };
      ['Z']: { value: number; name: 'Z'; type: DataType.FLOAT; min: -1000; max: 1000; precision: 1; significand: 15 };
    };
    ['Camera Origin']: {
      ['X']: { value: number; name: 'X'; type: DataType.FLOAT; min: -1000; max: 1000; precision: 1; significand: 15 };
      ['Y']: { value: number; name: 'Y'; type: DataType.FLOAT; min: -1000; max: 1000; precision: 1; significand: 15 };
      ['Z']: { value: number; name: 'Z'; type: DataType.FLOAT; min: -1000; max: 1000; precision: 1; significand: 15 };
    };
    ['Camera Angle']: { value: number; name: 'Camera Angle'; type: DataType.FLOAT; min: -180; max: 180; precision: 1; significand: 12 };
    ['Radius']: { value: number; name: 'Radius'; type: DataType.FLOAT; min: -1000; max: 1000; precision: 1; significand: 15 };
  };
  ['Extrusion']:
    | {
        s: { value: 0; name: 'Extrusion'; type: DataType.ENUM; max: 4; bits: 3 };
        v: ExtrusionSquareValue;
      }
    | {
        s: { value: 1; name: 'Extrusion'; type: DataType.ENUM; max: 4; bits: 3 };
        v: ExtrusionArcValue;
      }
    | {
        s: { value: 2; name: 'Extrusion'; type: DataType.ENUM; max: 4; bits: 3 };
        v: ExtrusionEllipseValue;
      }
    | {
        s: { value: 3; name: 'Extrusion'; type: DataType.ENUM; max: 4; bits: 3 };
        v: ExtrusionGothicValue;
      }
    | {
        s: { value: 4; name: 'Extrusion'; type: DataType.ENUM; max: 4; bits: 3 };
        v: ExtrusionNestedValue;
      };
  ['Footprint']:
    | {
        s: { value: 0; name: 'Footprint'; type: DataType.ENUM; max: 5; bits: 3 };
        v: FootprintSquare;
      }
    | {
        s: { value: 1; name: 'Footprint'; type: DataType.ENUM; max: 5; bits: 3 };
        v: FootprintGridType;
      }
    | {
        s: { value: 2; name: 'Footprint'; type: DataType.ENUM; max: 5; bits: 3 };
        v: FootprintGridType;
      }
    | {
        s: { value: 3; name: 'Footprint'; type: DataType.ENUM; max: 5; bits: 3 };
        v: FootprintGridType;
      }
    | {
        s: { value: 4; name: 'Footprint'; type: DataType.ENUM; max: 5; bits: 3 };
        v: FootprintCylinderType;
      }
    | {
        s: { value: 5; name: 'Footprint'; type: DataType.ENUM; max: 5; bits: 3 };
        v: FootprintMalculmiusOne;
      };
  ['Heights']: {
    ['Total Height']: { value: number; name: 'Total Height'; type: DataType.FLOAT; min: 50; max: 300; precision: 0; significand: 8 };
    ['Story Count']: { value: number; name: 'Story Count'; type: DataType.INT; min: 1; max: 20; bits: 5 };
    ['Height Processing Method']:
      | {
          s: { value: 0; name: 'Height Processing Method'; type: DataType.ENUM; max: 1; bits: 1 };
          v: HeightsIncrementalType;
        }
      | {
          s: { value: 1; name: 'Height Processing Method'; type: DataType.ENUM; max: 1; bits: 1 };
          v: HeightsSineType;
        }
      | {
          s: { value: 2; name: 'Height Processing Method'; type: DataType.ENUM; max: 1; bits: 1 };
          v: {};
        };
  };
  ['Base']: {
    ['Base Height']: { value: number; name: 'Base Height'; type: DataType.FLOAT; min: 50; max: 250; precision: 1; significand: 11 };
  };
  ['Material']: { color: ColorType };
};
