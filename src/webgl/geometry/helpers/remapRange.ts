import { AttributeNames } from 'src/modelDefinition/enums/attributeNames'
import { Version0Type } from 'src/modelDefinition/types/version0.generatedType'
export const getMaxExpression = (data: Version0Type) =>
  data[AttributeNames.GlobalGeometry]['max-distance']?.v?.['max-distance overwrite']?.value
    ? data[AttributeNames.GlobalGeometry]['max-distance']?.v?.['max-distance overwrite']?.value
    : data[AttributeNames.GlobalGeometry].expression.value
