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

  const hasAnyRemoteConfigurations = remoteChains.length > 0

  const nullableDefault =
    selectedRemoteChain && hasAnyRemoteConfigurations
      ? { defaultValue: toDropdownOption(selectedRemoteChain) }
      : {}

  return (
    <div className="rounded-lg bg-[#35353A]">
      <Row
        className="px-6"
        label="Remote Chain"
        value={
          hasAnyRemoteConfigurations ? (
            <Dropdown
              options={dropdownOptions}
              onChange={onDropdownSelect}
              {...nullableDefault}
            />
          ) : (
            <div className="text-right text-gray-15">
              There are no remote configurations for this chain
            </div>
          )
        }
      />

      {remoteChain && selectedRemoteChain && (
        <>
          <Block title="Default app config">
            <Row
              hideBorder
              dense
              className="md:pl-7"
              label="Inbound proof library"
              value={remoteChain.defaultAppConfig.inboundProofLib}
            />
            <Row
              hideBorder
              dense
              className="md:pl-7"
              label="Inbound proof confirm"
              value={remoteChain.defaultAppConfig.inboundProofConfirm}
            />
            <Row
              hideBorder
              dense
              className="md:pl-7"
              label="Outbound block confirm"
              value={remoteChain.defaultAppConfig.outboundBlockConfirm}
            />
            <Row
              hideBorder
              dense
              className="md:pl-7"
              label="Outbound proof type"
              value={remoteChain.defaultAppConfig.outboundProofType}
            />
            <Row
              hideBorder
              dense
              className="md:pl-7"
              label="Oracle"
              value={
                <BlockchainAddress
                  address={remoteChain.defaultAppConfig.oracle}
                />
              }
            />
            <Row
              hideBorder
              dense
              className="md:pl-7"
              label="Relayer"
              value={
                <BlockchainAddress
                  address={remoteChain.defaultAppConfig.relayer}
                />
              }
            />
          </Block>

          <Block title="Default adapter params">
            <div className="grid grid-cols-adapter-params overflow-x-auto">
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
          </Block>
          <Section>
            <Row
              dense
              hideBorder
              className="md:pl-7"
              label="Supported outbound proof"
              value={
                <div className="flex flex-col gap-3">
                  {remoteChain.supportedOutboundProof.map((proof) => (
                    <span>{proof}</span>
                  ))}
                </div>
              }
            />
          </Section>

          <Section>
            <Row
              dense
              hideBorder
              className="md:pl-7"
              label="Ultra Light Node"
              value={
                <ChainInfoContext.Provider value={selectedRemoteChain}>
                  <BlockchainAddress address={remoteChain.uln} />
                </ChainInfoContext.Provider>
              }
            />
          </Section>
        </>
      )}
    </div>
  )
}

function Block({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col border-t border-[#4B4E51] px-6 py-3">
      <span className="pb-3 text-sm font-medium text-gray-15">{title}</span>
      <div className="flex flex-col md:gap-2">{children}</div>
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className=" border-t border-[#4B4E51]">{children}</div>
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
