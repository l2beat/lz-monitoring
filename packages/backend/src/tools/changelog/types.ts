import { ContractParameters } from '@l2beat/discovery-types'
import { ChainId, EthereumAddress, ModificationType } from '@lz/libs'

export type {
  ChangelogEntry,
  ContractPair,
  FieldDifference,
  MilestoneEntry,
  SmartContractOperation,
}

type ContractPair = [ContractParameters, ContractParameters]

type FieldDifference =
  | ObjectPropertyAdded
  | ObjectPropertyDeleted
  | ObjectPropertyEdited
  | ArrayElementAdded
  | ArrayElementDeleted
  | ArrayElementEdited

interface TemplateModification<
  Type extends ModificationType,
  Previous,
  Current,
> {
  key: string[]
  modificationType: Type
  previous: Previous
  current: Current
}

type ObjectPropertyAdded = TemplateModification<
  'OBJECT_NEW_PROPERTY',
  null,
  string
>

type ObjectPropertyDeleted = TemplateModification<
  'OBJECT_DELETED_PROPERTY',
  string,
  null
>

type ObjectPropertyEdited = TemplateModification<
  'OBJECT_EDITED_PROPERTY',
  string,
  string
>

type ArrayElementAdded = TemplateModification<'ARRAY_NEW_ELEMENT', null, string>

type ArrayElementDeleted = TemplateModification<
  'ARRAY_DELETED_ELEMENT',
  string,
  null
>

type ArrayElementEdited = TemplateModification<
  'ARRAY_EDITED_ELEMENT',
  string,
  string
>

type SmartContractOperation = 'CONTRACT_ADDED' | 'CONTRACT_REMOVED'

interface CommonEntry {
  targetName: string
  targetAddress: EthereumAddress
  chainId: ChainId
  blockNumber: number
}
interface ChangelogEntry extends CommonEntry {
  modificationType: ModificationType
  parameterName: string
  parameterPath: string[]
  previousValue: string | null
  currentValue: string | null
}

interface MilestoneEntry extends CommonEntry {
  operation: SmartContractOperation
}
