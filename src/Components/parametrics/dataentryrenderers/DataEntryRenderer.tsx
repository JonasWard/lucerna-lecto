import React from 'react';
import { FloatDataEntryRenderer } from './FloatDataEntryRenderer';
import { IntDataEntryRenderer } from './IntDataEntryRenderer';
import { VersionDataEntryRenderer } from './VersionDataEntryRenderer';
import { BooleanDataEntryRenderer } from './BooleanDataEntryRenderer';
import { EnumDataEntryRenderer } from './EnumDataEntryRenderer';
import { DataEntry, DataType, EnumSemantics } from 'url-safe-bitpacking';
import { useData } from 'src/state/state'

export type IDatyEntryRendererProps = {
  dataEntry: DataEntry
  versionEnumSemantics?: EnumSemantics
  asSlider?: boolean
  hidden?: boolean
}

export const DataEntryRenderer: React.FC<IDatyEntryRendererProps> = ({
  asSlider,
  dataEntry,
  versionEnumSemantics,
  hidden,
}) => {
  const updateEntry = useData((s) => s.updateDataEntry)

  if (hidden) return null

  switch (dataEntry.type) {
    case DataType.INT:
      return (
        <IntDataEntryRenderer displayStyle={asSlider ? 'slider' : 'input'} int={dataEntry} onChange={updateEntry} />
      )
    case DataType.FLOAT:
      return <FloatDataEntryRenderer asSlider={asSlider} float={dataEntry} onChange={updateEntry} />
    case DataType.VERSION:
      return (
        <VersionDataEntryRenderer
          version={dataEntry}
          onChange={updateEntry}
          versionEnumSemantics={versionEnumSemantics}
        />
      )
    case DataType.BOOLEAN:
      return <BooleanDataEntryRenderer bool={dataEntry} onChange={updateEntry} />
    case DataType.ENUM:
      return (
        <EnumDataEntryRenderer
          enumValue={dataEntry}
          onChange={updateEntry}
          versionEnumSemantics={versionEnumSemantics}
        />
      )
    default:
      return null
  }
}
