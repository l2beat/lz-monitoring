import {
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
        value.dataDecoded ? decodeCall(value.dataDecoded) : [],
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
      return `call ${call.method}(${call.params
        .map(paramToSummary)
        .join(', ')})`
    })
    .join('\n')

  return nestedCallsSummary
}

export function toUTC(dateString: string): string {
  const date = new Date(dateString)
  return date.toUTCString()
}
