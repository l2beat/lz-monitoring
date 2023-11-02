import { ChainId, EthereumAddress } from '@lz/libs'

export type { ChangelogEntry, FieldDifference, SmartContractOperation }

type FieldDifference =
  | ObjectPropertyAdded
  | ObjectPropertyDeleted
  | ObjectPropertyEdited
  | ArrayElementAdded
  | ArrayElementDeleted
  | ArrayElementEdited

type ModificationType =
  | PrefixLiteral<'OBJECT', ObjectModification>
  | PrefixLiteral<'ARRAY', ArrayModification>

type PrefixLiteral<
  Prefix extends string,
  Literal extends string,
> = `${Prefix}_${Literal}`

type ObjectModification =
  | 'NEW_PROPERTY'
  | 'DELETED_PROPERTY'
  | 'EDITED_PROPERTY'

type ArrayModification = 'NEW_ELEMENT' | 'DELETED_ELEMENT' | 'EDITED_ELEMENT'

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

type SmartContractOperation =
  | 'ADD_CONTRACT'
  | 'REMOVE_CONTRACT'
  | 'MODIFY_CONTRACT'

interface ChangelogEntry {
  targetName: string
  targetAddress: EthereumAddress
  chainId: ChainId
  blockNumber: number
  operation: SmartContractOperation
  type: ModificationType
  parameterName: string
  parameterPath: string[]
  previousValue: string | null
  currentValue: string | null
}
