import { AttributeNames } from '../../../modelDefinition/enums/attributeNames';
import { ProcessingMethodCategory } from '../../../modelDefinition/types/heights';
import { HeightsIncrementalType, HeightsSineType, Version0Type } from '../../../modelDefinition/types/version0.generatedType';

const getSineMethod =
  (sineSettings: HeightsSineType) =>
  (angle: number): number => {
    return (
      sineSettings[AttributeNames.MinAmplitude].value +
      (sineSettings[AttributeNames.MaxAmplitude].value - sineSettings[AttributeNames.MinAmplitude].value) *
        (Math.sin(sineSettings[AttributeNames.Period].value * angle + (sineSettings[AttributeNames.PhaseShift].value * Math.PI) / 180) * 0.5 + 0.5)
    );
  };

const getIncrementalMethod =
  (incrementalSettings: HeightsIncrementalType) =>
  (angle: number): number =>
    1 + angle * incrementalSettings[AttributeNames.LinearTwist].value;

export const getHeights = (heightGenerator: Version0Type[AttributeNames.Heights]): number[] => {
  const heights: number[] = [];

  const baseHeight = heightGenerator[AttributeNames.TotalHeight].value;
  const storyCount = heightGenerator[AttributeNames.StoryCount].value;

  switch (heightGenerator[AttributeNames.HeightsProcessingMethod].s.value) {
    case ProcessingMethodCategory.None:
      heights.push(...Array.from({ length: storyCount }, () => baseHeight));
      break;
    case ProcessingMethodCategory.IncrementalMethod:
      const incrementalMethod = getIncrementalMethod(heightGenerator[AttributeNames.HeightsProcessingMethod].v as HeightsIncrementalType);
      heights.push(...Array.from({ length: storyCount }, (_, i) => incrementalMethod(i) + baseHeight));
      break;
    case ProcessingMethodCategory.Sin:
      const sineMethod = getSineMethod(heightGenerator[AttributeNames.HeightsProcessingMethod].v as HeightsSineType);
      heights.push(...Array.from({ length: storyCount }, (_, i) => sineMethod(i) * baseHeight));
      break;
  }

  let height = 0;
  const incrementalHeights = [0];

  heights.forEach((h) => {
    height += h;
    incrementalHeights.push(height);
  });

  const scaleValue = baseHeight / incrementalHeights[incrementalHeights.length - 1];
  return incrementalHeights.map((h) => h * scaleValue);
};
