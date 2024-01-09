import {
  SafeMultisigTransaction,
  SafeTransactionDecodedData,
  SafeTransactionDecodedParam,
} from '@lz/libs'

type ExtendCommonParam<T> = {
  name: string
  value: string | string[]
  valueType: string
} & T

export type Param =
  | ExtendCommonParam<{ type: 'primitive' }>
  | ExtendCommonParam<{ type: 'nested'; calls: Call[] }>

export interface Call {
  to?: string
  method: string
  params: Param[]
  signature: string
  functionCall: string
}

export function decodeCall(
  call: NonNullable<SafeTransactionDecodedData>,
): Call {
  const method = call.method
  const params = call.parameters

  const signature = toSignature(method, params)
  const functionCall = toFunctionCall(method, params)

  const normalizedParams = call.parameters.map(decodeParam)

  return {
    method,
    params: normalizedParams,
    signature,
    functionCall,
    to: call.to,
  }
}

export function decodeParam(param: SafeTransactionDecodedParam): Param {
  if (param.valueDecoded) {
    return {
      type: 'nested',
      name: param.name,
      value: param.value,
      valueType: param.type,
      calls: param.valueDecoded.flatMap((value) =>
        value.dataDecoded
          ? decodeCall({ ...value.dataDecoded, to: value.to })
          : [],
      ),
    }
  }

  return {
    type: 'primitive',
    name: param.name,
    value: param.value,
    valueType: param.type,
  }
}

export function toSignature(
  method: string,
  params: SafeTransactionDecodedParam[],
) {
  return `function ${method}(${params
    .map((param) => {
      return `${param.type} ${param.name}`
    })
    .join(', ')})`
}

export function toFunctionCall(
  method: string,
  params: SafeTransactionDecodedParam[],
) {
  return `function ${method}(${params
    .map((param) => {
      return param.value
    })
    .join(', ')})`
}

export function paramToSummary(param: Param): string {
  if (param.type === 'primitive') {
    const prettyValue = Array.isArray(param.value)
      ? `[${param.value.join(', ')}]`
      : param.value

    return `${param.valueType} ${param.name} = ${prettyValue}`
  }

  // Assumption is that nested calls params are primitives
  const nestedCallsSummary = param.calls
    .map((call) => {
      const to = call.to ? `on ${call.to}` : ''

      return `call ${call.method}(${call.params
        .map(paramToSummary)
        .join(', ')}) ${to}`
    })
    .join('\n')

  return nestedCallsSummary
}

export function toUTC(dateString: string): string {
  const date = new Date(dateString)
  return date.toUTCString()
}

export function getDecodedProperties(tx: SafeMultisigTransaction) {
  const parsingResult = SafeTransactionDecodedData.safeParse(tx.dataDecoded)

  if (parsingResult.success && tx.dataDecoded) {
    // SafeApi kit typings are wrong, string type applies only for transport layer
    // string is later parsed into json object
    const decodedCall = decodeCall(
      tx.dataDecoded as unknown as NonNullable<SafeTransactionDecodedData>,
    )

    return {
      method: decodedCall.method,
      signature: decodedCall.signature,
      callWithParams: decodedCall.functionCall,
      params: decodedCall.params,
    }
  }

  return null
}

export type MultisigOwnershipHistory = ReturnType<
  typeof deriveMultisigOwnership
>

export function deriveMultisigOwnership(
  allTransactions: SafeMultisigTransaction[],
  latestOwners: number,
) {
  const ownerChangingTransactions = allTransactions
    .map((tx) => ({ raw: tx, decoded: getDecodedProperties(tx) }))
    .filter(
      (ownerModification) =>
        (ownerModification.decoded?.method === 'addOwnerWithThreshold' ||
          ownerModification.decoded?.method === 'removeOwner') &&
        ownerModification.raw.isExecuted,
    )

  // We start with the latest data so we yet don't know
  // how long it will be applicable for
  const ownerUpdates = [
    {
      toBlock: Infinity,
      toTimestamp: Infinity,
      owners: latestOwners,
    },
  ]

  let lastAmountOfOwners = latestOwners

  for (const ownerModification of ownerChangingTransactions) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const toBlock = ownerModification.raw.blockNumber!
    const toTimestamp = new Date(ownerModification.raw.submissionDate).valueOf()

    // Inc/Dev reversed since we are descending down the line
    if (ownerModification.decoded?.method === 'addOwnerWithThreshold') {
      ownerUpdates.push({
        toTimestamp,
        toBlock,
        owners: --lastAmountOfOwners,
      })
    }

    if (ownerModification.decoded?.method === 'removeOwner') {
      ownerUpdates.push({
        toTimestamp,
        toBlock,
        owners: ++lastAmountOfOwners,
      })
    }
  }

  // Invert and reassign toBlock and toTimestamp
  // to achieve ascending order thus easier usage
  const reversed = [...ownerUpdates].reverse()

  const updateHistory = [
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { fromBlock: 0, fromTimestamp: 0, owners: reversed.at(0)!.owners },
  ]

  for (let i = 1; i < reversed.length; i++) {
    const tx = reversed[i]
    updateHistory.push({
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      fromTimestamp: reversed[i - 1]!.toTimestamp,
      fromBlock: reversed[i - 1]!.toBlock,
      owners: tx!.owners,
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    })
  }

  return updateHistory
}

export function getOwnershipForTransaction(
  history: MultisigOwnershipHistory,
  submissionDate: string,
) {
  const ownershipForTime = history
    .sort((a, b) => b.fromTimestamp - a.fromTimestamp)
    .find((update) => update.fromTimestamp < new Date(submissionDate).valueOf())

  if (!ownershipForTime) {
    throw new Error('Ownership for given time range not found')
  }

  return ownershipForTime.owners
}
