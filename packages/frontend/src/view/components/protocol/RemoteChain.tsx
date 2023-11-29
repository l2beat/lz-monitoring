import { ChainId, RemoteChain } from '@lz/libs'
import { ethers } from 'ethers'

import { ChainInfoContext } from '../../../hooks/chainIdContext'
import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { BlockchainAddress } from '../BlockchainAddress'
import { Code } from '../Code'
import { Dropdown, DropdownOption } from '../Dropdown'
import { Row } from '../Row'
import { toDropdownOption } from './utils'

interface Props {
  remoteChains?: RemoteChain[]
}

export function RemoteChainComponent({
  remoteChains,
}: Props): JSX.Element | null {
  const [selectedRemoteChain, setSelectedRemoteChain] = useChainQueryParam({
    paramName: 'remote-chain',
  })

  if (!remoteChains) {
    return null
  }

  function onDropdownSelect(option: DropdownOption): void {
    const chain = remoteChains?.find((chain) => chain.name === option.value)

    setSelectedRemoteChain(chain ? ChainId.fromName(chain.name) : null)
  }

  const dropdownOptions = remoteChains.map(toDropdownOption)

  const remoteChain = selectedRemoteChain
    ? remoteChains.find(
        (chain) => chain.name === ChainId.getName(selectedRemoteChain),
      )
    : null

  const nullableDefault = selectedRemoteChain
    ? { defaultValue: toDropdownOption(selectedRemoteChain) }
    : {}

  return (
    <div className="rounded-lg bg-[#35353A]">
      <Row
        className="px-6"
        label={'Remote Chain'}
        value={
          <Dropdown
            options={dropdownOptions}
            onChange={onDropdownSelect}
            {...nullableDefault}
          />
        }
      />

      {remoteChain && selectedRemoteChain && (
        <>
          <Subparams title="Default app config">
            <Subparam
              label="Inbound proof library"
              value={remoteChain.defaultAppConfig.inboundProofLib}
            />
            <Subparam
              label="Inbound proof confirm"
              value={remoteChain.defaultAppConfig.inboundProofConfirm}
            />
            <Subparam
              label="Outbound proof confirm"
              value={remoteChain.defaultAppConfig.outboundBlockConfirm}
            />
            <Subparam
              label="Outbound proof confirm"
              value={remoteChain.defaultAppConfig.outboundProofType}
            />
            <Subparam
              label="Oracle"
              value={
                <BlockchainAddress
                  address={remoteChain.defaultAppConfig.oracle}
                />
              }
            />
          </Subparams>

          <Subparams title="Default adapter params">
            <div className="grid grid-cols-adapter-params ">
              <div className="col-span-4 grid min-w-[800px] grid-cols-adapter-params rounded bg-gray-300 py-3 text-center text-[13px] font-semibold text-[#AEAEAE]">
                <span className="px-6">Proof Type</span>
                <span>Version</span>
                <span>Value (Gas)</span>
                <span>Raw</span>
              </div>
              {remoteChain.defaultAdapterParams.map((adapterParams) => {
                const unpacked = unpackAdapterParams(
                  adapterParams.adapterParams,
                )

                return (
                  <div className="col-span-4 my-2 grid grid-cols-adapter-params items-center justify-center border-b border-gray-200 text-center text-xs last:border-none">
                    <span>{adapterParams.proofType}</span>
                    <span>{unpacked[0]}</span>
                    <span>{unpacked[1]}</span>
                    <Code>{adapterParams.adapterParams}</Code>
                  </div>
                )
              })}
            </div>
          </Subparams>

          <InlineSubparam
            label="Supported outbound proof"
            value={remoteChain.supportedOutboundProof.map((proof) => (
              <div>{proof}</div>
            ))}
          />
          <InlineSubparam
            label="Corresponding Ultra Light Node"
            value={
              <ChainInfoContext.Provider value={selectedRemoteChain}>
                <BlockchainAddress address={remoteChain.uln} />
              </ChainInfoContext.Provider>
            }
          />
        </>
      )}
    </div>
  )
}

function Subparams({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col border-t border-[#4B4E51] px-6 py-3">
      <span className="pb-3 text-sm font-medium text-gray-15">{title}</span>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Subparam({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex w-full py-1 pl-9 last:py-0">
      <span className="w-[30%] text-sm font-medium text-gray-15">{label}</span>
      <span className="flex w-[70%] items-center text-xs">{value}</span>
    </div>
  )
}

function InlineSubparam({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex w-full border-t border-[#4B4E51] px-6 py-3">
      <span className="w-[30%] text-sm font-medium text-gray-15">{label}</span>
      <span className="text-x4  flex flex-col items-center gap-2 pl-6">
        {value}
      </span>
    </div>
  )
}

/**
 * @notice Unpacks only V1 adapter params due to the hardcoded padding and felts
 */
function unpackAdapterParams(adapterParams: string) {
  const felts = ['uint16', 'uint256']

  // Packed values are not padded enough to be decoded
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const padded = '0x' + adapterParams.split('0x')[1]!.padStart(128, '0')

  const unpacked = ethers.utils.defaultAbiCoder.decode(felts, padded)

  return unpacked.map(String)
}
