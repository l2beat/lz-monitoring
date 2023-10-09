import { ChainId, DataDecoded, EthereumAddress, ParamDecoded } from '@lz/libs'
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/api-kit'

import { useSafeApi } from '../../../hooks/useSafeApi'
import { SubsectionHeader } from '../status/SubsectionHeader'

export { QueuedTransactions }

interface Props {
  multisigAddress: EthereumAddress
  chainId: ChainId
}

function QueuedTransactions(props: Props) {
  const [transactions] = useSafeApi(props)

  if (!transactions) {
    return (
      <section className="mx-6 mb-12 border-t border-blue bg-gray-900 px-3">
        <div className="flex items-center justify-between p-8">
          <h2 className="text-2xl text-lg font-medium text-blue">
            Safe Multisig Transactions
          </h2>
          <span className="font-mono text-gray-600">
            No transactions present within multisig queue
          </span>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-6 mb-12 border-t border-blue bg-gray-900">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-blue">
          Safe Multisig Transactions
        </h2>
      </div>
      {transactions.map((tx, i) => {
        if (tx.txType === 'MULTISIG_TRANSACTION') {
          return <SafeMultisigTransaction tx={tx} key={i} />
        }
      })}
    </section>
  )
}

export function Row<T extends number | string>({
  label,
  value,
}: {
  label: string
  value: T
}) {
  return (
    <div className={`flex border-y border-black bg-gray-800 py-3`} key={label}>
      <span className="w-[20%] px-5 font-medium text-gray-500">{label}</span>
      <span className="w-[80%] overflow-hidden font-mono">
        {value.toString()}
      </span>
    </div>
  )
}

function SafeMultisigTransaction({
  tx,
}: {
  tx: SafeMultisigTransactionWithTransfersResponse
}) {
  const decodedData = DataDecoded.parse(tx.dataDecoded)

  return (
    <>
      <SubsectionHeader
        title="Multisig transaction"
        subtitle={tx.blockNumber ?? 'No block'}
      />
      <Row label="Transaction type" value={tx.txType ?? 'No type'} />
      <Row label="Required confirmations" value={tx.confirmationsRequired} />
      <Row label="Executed" value={tx.isExecuted ? 'yes' : 'no'} />
      <Row
        label="Submission date"
        value={new Date(tx.submissionDate).toUTCString()}
      />
      <SubsectionHeader
        title="Decoded call"
        className="border-t border-black bg-gray-800 px-8 py-3"
      />
      <ExpandedComponent data={decodedData} />
    </>
  )
}

// function DecodedDataComponent(props: { data: DataDecoded }) {
//   const isNestedCall = props.data.parameters.some((param) => param.valueDecoded)

//   return (
//     <>
//       <SubsectionHeader
//         title="Decoded call"
//         subtitle={isNestedCall ? 'Multicall' : 'Plain call'}
//       />
//       <Row label="Method" value={props.data.method} />
//       {props.data.parameters.map((param, i) => (
//         <DecodedParamComponent param={param} key={i} />
//       ))}
//     </>
//   )
// }

// function DecodedParamComponent(props: { param: ParamDecoded }) {
//   const { valueDecoded } = props.param

//   if (valueDecoded) {
//     return valueDecoded.map((subparam) => (
//       <SubParamDecodedComponent subparam={subparam} />
//     ))
//   }

//   return (
//     <>
//       <Row label="name" value={props.param.name} />
//       <Row label="value" value={props.param.value} />
//       <Row label="type" value={props.param.type} />
//     </>
//   )
// }

// function SubParamDecodedComponent(props: { subparam: SubParamDecoded }) {
//   const { dataDecoded } = props.subparam

//   if (dataDecoded) {
//     const signature = `function ${dataDecoded.method}(${dataDecoded.parameters
//       .map((param) => {
//         return `${param.type} ${param.name}`
//       })
//       .join(', ')})`

//     const calledSignature = `function ${
//       dataDecoded.method
//     }(${dataDecoded.parameters
//       .map((param) => {
//         return param.value
//       })
//       .join(', ')})`

//     return (
//       <>
//         <Row label="Method" value={dataDecoded.method} depth={2} />
//         <Row label="Signature" value={signature} depth={2} />
//         <Row label="Called" value={calledSignature} depth={2} />
//       </>
//     )
//   }
// }

function ExpandedComponent(props: { data: DataDecoded }) {
  const { data } = props

  const expanded = expandCall({ call: data })

  if (expanded.type === 'call') {
    return (
      <>
        <Row label="Method" value={expanded.method} />
        <Row label="Signature" value={expanded.signature} />
        <Params params={expanded.params} />
      </>
    )
  }

  return (
    <>
      <Row label="Method" value={expanded.method} />
      <Row label="Signature" value={expanded.signature} />
      <div className="mt-5 px-5">
        <h3>Params</h3>
        {expanded.nestedCalls.map((nestedCall) => {
          return nestedCall.paramType === 'simple' ? (
            <>
              <Row label="name" value={nestedCall.name} />
              <Row label="value" value={nestedCall.value} />
              <Row label="type" value={nestedCall.type} />
            </>
          ) : (
            <>
              <Row label="Param Name" value={nestedCall.name} />
              <CodeRow label="Raw Value">{nestedCall.value}</CodeRow>
              <Row label="Type" value={nestedCall.type} />
              <CodeRow label="Calls">
                {nestedCall.expandedCalls
                  .map((ec) => ec.functionCall)
                  .join('\n')}
              </CodeRow>
            </>
          )
        })}
      </div>
    </>
  )
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

type ParamType =
  | {
      paramType: 'simple'
      type: string
      name: string
      value: string
    }
  | {
      paramType: 'call'
      type: string
      name: string
      value: string
      expandedCalls: CallType[]
    }

function expandParam(props: { param: ParamDecoded }): ParamType {
  const { param } = props

  if (param.valueDecoded) {
    return {
      paramType: 'call',
      type: param.type,
      name: param.name,
      value: param.value,
      expandedCalls: param.valueDecoded.flatMap((value) => {
        const { dataDecoded } = value
        if (dataDecoded) {
          const expandedCall = expandCall({ call: dataDecoded })

          return [expandedCall]
        }
        return []
      }),
    }
  }

  return {
    paramType: 'simple',
    type: param.type,
    name: param.name,
    value: param.value,
  }
}

type CallType =
  | {
      type: 'call'
      method: string
      params: Omit<ParamDecoded, 'valueDecoded'>[]
      signature: string
      functionCall: string
    }
  | {
      type: 'nestedCall'
      method: string
      params: Omit<ParamDecoded, 'valueDecoded'>[]

      signature: string
      functionCall: string
      nestedCalls: ParamType[]
    }

function expandCall(props: { call: DataDecoded }): CallType {
  const { call } = props

  const method = call.method
  const params = call.parameters

  const isNested = params.some((param) => param.valueDecoded)

  if (!isNested) {
    return {
      type: 'call',
      method,
      params: params.map(({ type, value, name }) => ({ type, value, name })),
      signature: toSignature(method, params),
      functionCall: toFunctionCall(method, params),
    } as const
  }

  return {
    type: 'nestedCall',
    method,
    params: params.map(({ type, value, name }) => ({ type, value, name })),
    signature: toSignature(method, params),
    functionCall: toFunctionCall(method, params),
    nestedCalls: params.map((p) => expandParam({ param: p })),
  } as const
}

function CodeRow(props: { label: string; children?: React.ReactNode }) {
  return (
    <div
      className={`flex border-y border-black bg-gray-800  py-3`}
      key={props.label}
    >
      <span className="w-[20%] px-5 font-medium text-gray-500">
        {props.label}
      </span>
      <pre className="w-[80%] grow overflow-auto border border-gray-700 bg-gray-900 p-6 font-mono text-gray-500">
        {props.children}
      </pre>
    </div>
  )
}

function Params({
  params,
}: {
  params: ParamType[] | Omit<ParamDecoded, 'valueDecoded'>[]
}) {
  return (
    <>
      <h3>Params</h3>
      {params.map((param) => {
        return (
          <>
            <Row label="Param Name" value={param.name} />
            <Row label="Type" value={param.type} />
            <CodeRow label="Raw Value">{param.value}</CodeRow>
            {/* {param.paramType === 'call' && (
              <CodeRow label="Calls">
                {param.expandedCalls.map((ec) => ec.functionCall).join('\n')}
              </CodeRow>
            )} */}
          </>
        )
      })}
    </>
  )
}
