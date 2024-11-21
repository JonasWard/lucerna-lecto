import { DataEntryFactory } from 'url-safe-bitpacking';
import { AttributeNames } from '../enums/attributeNames';
import {
  ArrayEntryDataType,
  EnumEntryDataType,
  NonEmptyValidEntryArrayType,
  OptionalEntryDataType,
  SingleLevelContentType,
} from 'url-safe-bitpacking/dist/types';
import { MainMethodLabels } from './methodSemantics';

const mainMethodVersionStack: ArrayEntryDataType = [
  [1, 3],
  [
    DataEntryFactory.createEnum(0, MainMethodLabels.length - 1, `${AttributeNames.MethodEnumMain}`),
    DataEntryFactory.createFloat(1, 0.001, 1000, 3, `${AttributeNames.MethodScale}`),
  ],
];

const viewportParameters: SingleLevelContentType[] = [
  [
    AttributeNames.CameraTarget,
    [
      DataEntryFactory.createFloat(0, -1000, 1000, 1, AttributeNames.X),
      DataEntryFactory.createFloat(0, -1000, 1000, 1, AttributeNames.Y),
      DataEntryFactory.createFloat(0, -1000, 1000, 1, AttributeNames.Z),
    ],
  ],
  [
    AttributeNames.CameraOrigin,
    [
      DataEntryFactory.createFloat(0, -1000, 1000, 1, AttributeNames.X),
      DataEntryFactory.createFloat(0, -1000, 1000, 1, AttributeNames.Y),
      DataEntryFactory.createFloat(0, -1000, 1000, 1, AttributeNames.Z),
    ],
  ],
  DataEntryFactory.createFloat(0, -180, 180, 1, AttributeNames.CameraAngle),
  DataEntryFactory.createFloat(0, -1000, 1000, 1, AttributeNames.Radius),
];

const materialDefinition: SingleLevelContentType[] = [
  DataEntryFactory.createBoolean(false, AttributeNames.Wireframe),
  DataEntryFactory.createInt(0, 0, 6, 'subDivisions'),
  DataEntryFactory.createFloat(0.5, 0, 1, 3, 'smoothing'),
  DataEntryFactory.createFloat(0.1, 0.025, 5, 3, 'expression'),
  [
    'color',
    [
      DataEntryFactory.createInt(255, 0, 255, AttributeNames.R),
      DataEntryFactory.createInt(0, 0, 255, AttributeNames.G),
      DataEntryFactory.createInt(0, 0, 255, AttributeNames.B),
    ],
  ],
  DataEntryFactory.createBoolean(false, AttributeNames.DoubleSided),
];

const withBaseSwitch: OptionalEntryDataType = [false, [], [DataEntryFactory.createInt(15, 5, 50, 'inset'), DataEntryFactory.createInt(10, 5, 50, 'h-base')]];

const cube: NonEmptyValidEntryArrayType = [
  DataEntryFactory.createFloat(50, 40, 240, 1, 'h'),
  [AttributeNames.HasBase, withBaseSwitch],
  DataEntryFactory.createFloat(40, 30, 150, 1, 'w'),
  DataEntryFactory.createFloat(40, 30, 150, 1, 'd'),
  DataEntryFactory.createFloat(0, 0, 1, 2, 'edgeSmoothing'),
];

const cylinder: NonEmptyValidEntryArrayType = [
  DataEntryFactory.createFloat(100, 50, 240, 1, 'h'),
  DataEntryFactory.createInt(1, 1, 10, 'inset'),
  DataEntryFactory.createInt(1, 1, 32, 'h-base'),
  DataEntryFactory.createFloat(40, 30, 150, 1, 'r0'),
  DataEntryFactory.createFloat(40, 30, 150, 1, 'r1'),
];

const floating: NonEmptyValidEntryArrayType = [
  DataEntryFactory.createFloat(1, 0, 1, 2, 'h'),
  DataEntryFactory.createInt(1, 1, 10, 'inset'),
  DataEntryFactory.createInt(1, 1, 32, 'h-base'),
  DataEntryFactory.createFloat(40, 30, 150, 1, 'w'),
  DataEntryFactory.createFloat(40, 30, 150, 1, 'd'),
];

const lampShades: EnumEntryDataType = [0, cube, cylinder, floating];

export const verionArrayDefinition0: SingleLevelContentType[] = [
  [AttributeNames.Viewport, viewportParameters],
  [AttributeNames.LampShades, lampShades],
  [AttributeNames.MainMethods, mainMethodVersionStack],
  [AttributeNames.Material, materialDefinition],
];
