import { DataDecoded, ParamDecoded } from '@lz/libs'

export { decodeToTCall, decodeToTParam, paramToSummary, toUTC }
export type { TCall, TParam }

type ExtendCommonParam<T> = {
  name: string
  value: string | string[]
  valueType: string
} & T

type TParam =
  | ExtendCommonParam<{ type: 'primitive' }>
  | ExtendCommonParam<{ type: 'nested'; calls: TCall[] }>

interface TCall {
  method: string
  params: TParam[]
  signature: string
  functionCall: string
}

function decodeToTCall(call: NonNullable<DataDecoded>): TCall {
  const method = call.method
  const params = call.parameters

  const signature = toSignature(method, params)
  const functionCall = toFunctionCall(method, params)

  const normalizedParams = call.parameters.map(decodeToTParam)

  return {
    method,
    params: normalizedParams,
    signature,
    functionCall,
  }
}

function decodeToTParam(param: ParamDecoded): TParam {
  if (param.valueDecoded) {
    return {
      type: 'nested',
      name: param.name,
      value: param.value,
      valueType: param.type,
      calls: param.valueDecoded.flatMap((value) =>
        value.dataDecoded ? decodeToTCall(value.dataDecoded) : [],
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

function toSignature(method: string, params: ParamDecoded[]) {
  return `function ${method}(${params
    .map((param) => {
      return `${param.type} ${param.name}`
    })
    .join(', ')})`
}

function toFunctionCall(method: string, params: ParamDecoded[]) {
  return `function ${method}(${params
    .map((param) => {
      return param.value
    })
    .join(', ')})`
}

function paramToSummary(param: TParam): string {
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

function toUTC(dateString: string): string {
  const date = new Date(dateString)
  return date.toUTCString()
}
