import { DataEntryFactory } from 'url-safe-bitpacking';
import { AttributeNames } from '../enums/attributeNames';
import { ArrayEntryDataType, EnumEntryDataType, NonEmptyValidEntryArrayType, SingleLevelContentType } from 'url-safe-bitpacking/dist/types';

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

const baseExtrusionDefinition: NonEmptyValidEntryArrayType = [
  DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, AttributeNames.InsetTop),
  DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, AttributeNames.InsetBottom),
  DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, AttributeNames.InsetSides),
];

const arcDefintion: NonEmptyValidEntryArrayType = [DataEntryFactory.createFloat(0.35, 0.2, 1.0, 2, AttributeNames.RadiusTop), ...baseExtrusionDefinition];
const gothicDefinition: NonEmptyValidEntryArrayType = [...arcDefintion, DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, AttributeNames.Pointedness)];
const nestedDefinition: NonEmptyValidEntryArrayType = [
  ...gothicDefinition,
  DataEntryFactory.createFloat(1, 0, 1, 2, AttributeNames.DivisionPointedness),
  DataEntryFactory.createInt(1, 1, 10, AttributeNames.DivisionCount),
  DataEntryFactory.createInt(1, 1, 32, AttributeNames.DivisionResolution),
];

const extrusionDefinition: EnumEntryDataType = [
  1,
  // Square
  baseExtrusionDefinition,
  // Arc
  arcDefintion,
  // Ellipse
  arcDefintion,
  // Gothic
  gothicDefinition,
  // Nested
  nestedDefinition,
];

const squareDefinition: NonEmptyValidEntryArrayType = [DataEntryFactory.createFloat(50, 40, 120, 0, AttributeNames.Size)];
const gridDefinitions: NonEmptyValidEntryArrayType = [
  DataEntryFactory.createFloat(20, 8, 120, 0, AttributeNames.Size),
  DataEntryFactory.createInt(3, 1, 16, AttributeNames.XCount),
  DataEntryFactory.createInt(0, 0, 8, AttributeNames.YCount),
  DataEntryFactory.createEnum(0, 3, AttributeNames.ShellThickness),
  DataEntryFactory.createFloat(2, 0, 10, 1, AttributeNames.BufferInside),
  DataEntryFactory.createFloat(2, 0, 10, 1, AttributeNames.BufferOutside),
];

const cylinderDefinition: NonEmptyValidEntryArrayType = [
  DataEntryFactory.createFloat(2, 0, 10, 1, AttributeNames.BufferInside),
  DataEntryFactory.createFloat(2, 0, 10, 1, AttributeNames.BufferOutside),
  DataEntryFactory.createInt(5, 3, 20, AttributeNames.Segments),
  [AttributeNames.Radiusses, [[1, 10], [DataEntryFactory.createFloat(2.5, 1, 20.0, 1, AttributeNames.Radiusses)]]],
];

const malculmiusDefinition: NonEmptyValidEntryArrayType = [
  DataEntryFactory.createFloat(35, 10, 55, 1, AttributeNames.CircleRadius),
  DataEntryFactory.createInt(5, 3, 20, AttributeNames.CircleDivisions),
  DataEntryFactory.createFloat(0.5, 0.1, 0.9, 2, AttributeNames.AngleSplit),
  DataEntryFactory.createFloat(0, -20, 20, 1, AttributeNames.OffsetA),
  DataEntryFactory.createFloat(0, -20, 20, 1, AttributeNames.OffsetB),
  DataEntryFactory.createFloat(5, 4, 40, 1, AttributeNames.InnerRadius),
];

const footprintDefinition: EnumEntryDataType = [
  1,
  // Square
  squareDefinition,
  // SquareGrid
  gridDefinitions,
  // TriangleGrid
  gridDefinitions,
  // HexGrid
  gridDefinitions,
  // Cylinder
  cylinderDefinition,
  // MalculmiusOne
  malculmiusDefinition,
];

const heightDefinition: SingleLevelContentType[] = [
  DataEntryFactory.createFloat(150, 50, 300, 0, AttributeNames.TotalHeight),
  DataEntryFactory.createInt(7, 1, 20, AttributeNames.StoryCount),
  [
    AttributeNames.HeightsProcessingMethod,
    [
      0,
      [DataEntryFactory.createFloat(20, 10, 200, -1, AttributeNames.Total), DataEntryFactory.createFloat(5, 0, 15, 2, AttributeNames.LinearTwist)],
      [
        DataEntryFactory.createFloat(4, 0, 15, 1, AttributeNames.MaxAmplitude),
        DataEntryFactory.createFloat(1, 0, 5, 2, AttributeNames.MinAmplitude),
        DataEntryFactory.createFloat(1, 0.2, 200, 1, AttributeNames.Period),
        DataEntryFactory.createFloat(4, 0, 90, 1, AttributeNames.PhaseShift),
      ],
      [],
    ] as EnumEntryDataType,
  ],
];

const baseDefintion: SingleLevelContentType[] = [DataEntryFactory.createFloat(100, 50, 250, 1, AttributeNames.BaseHeight)];

const materialDefinition: SingleLevelContentType[] = [
  [
    'color',
    [
      DataEntryFactory.createInt(255, 0, 255, AttributeNames.R),
      DataEntryFactory.createInt(0, 0, 255, AttributeNames.G),
      DataEntryFactory.createInt(0, 0, 255, AttributeNames.B),
    ],
  ],
];
export const verionArrayDefinition0: SingleLevelContentType[] = [
  [AttributeNames.Viewport, viewportParameters],
  [AttributeNames.Extrusion, extrusionDefinition],
  [AttributeNames.Footprint, footprintDefinition],
  [AttributeNames.Heights, heightDefinition],
  [AttributeNames.Base, baseDefintion],
  [AttributeNames.Material, materialDefinition],
];
