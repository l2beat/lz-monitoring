import { ChainId, RemoteChain } from '@lz/libs'
import { ethers } from 'ethers'

import { ChainInfoContext } from '../../../hooks/chainIdContext'
import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { BlockchainAddress } from '../BlockchainAddress'
import { Code } from '../Code'
import { Dropdown, DropdownOption } from '../Dropdown'
import { InfoTooltip } from '../InfoTooltip'
import { Row } from '../Row'
import { toDropdownOption } from './utils'

interface Props {
  remoteChains: RemoteChain[]
}

export function RemoteChainComponent(props: Props): JSX.Element | null {
  const [selectedRemoteChain, setSelectedRemoteChain] = useChainQueryParam({
    paramName: 'remote-chain',
  })

  function onDropdownSelect(option: DropdownOption): void {
    const chain = props.remoteChains.find(
      (chain) => chain.name === option.value,
    )

    setSelectedRemoteChain(chain ? ChainId.fromName(chain.name) : null)
  }

  const dropdownOptions = props.remoteChains.map(toDropdownOption)

  const remoteChain = selectedRemoteChain
    ? props.remoteChains.find(
        (chain) => chain.name === ChainId.getName(selectedRemoteChain),
      )
    : null

  const hasAnyRemoteConfigurations = props.remoteChains.length > 0

  const nullableDefault =
    selectedRemoteChain && hasAnyRemoteConfigurations
      ? { defaultValue: toDropdownOption(selectedRemoteChain) }
      : {}

  return (
    <div className="mx-2 rounded-lg bg-zinc-300">
      <Row
        className="!px-3 md:!px-6"
        label={
          <InfoTooltip text="List of destination chains supported by this site.">
            Remote Chain
          </InfoTooltip>
        }
        value={
          hasAnyRemoteConfigurations ? (
            <Dropdown
              options={dropdownOptions}
              onChange={onDropdownSelect}
              {...nullableDefault}
            />
          ) : (
            <div className="text-right text-gray-100">
              There are no remote configurations for this chain
            </div>
          )
        }
      />

      {remoteChain && selectedRemoteChain && (
        <>
          <Block
            title={
              <InfoTooltip text="The default config parameters. Default parameters are used if the User Application did not set its configuration for a specific chain pathway. This value can be changed by the owner of ULNv2.">
                Default app config
              </InfoTooltip>
            }
          >
            <Row
              hideBorder
              dense
              className="!p-0 md:!pl-7 md:!pr-4"
              label={
                <InfoTooltip text="The proof library used to decode and verify the received proofs.">
                  Inbound proof library
                </InfoTooltip>
              }
              value={
                <span>
                  {remoteChain.defaultAppConfig.inboundProofLib.version}{' '}
                  <BlockchainAddress
                    className="text-gray-100"
                    address={
                      remoteChain.defaultAppConfig.inboundProofLib.address
                    }
                  />
                </span>
              }
            />
            <Row
              hideBorder
              dense
              className="!p-0 md:!pl-7 md:!pr-4"
              label={
                <InfoTooltip text="The number of block confirmations on the source chain for inbound messages. Serves the purpose of a reorg protection.">
                  Inbound proof confirmations
                </InfoTooltip>
              }
              value={remoteChain.defaultAppConfig.inboundProofConfirm}
            />
            <Row
              hideBorder
              dense
              className="!p-0 md:!pl-7 md:!pr-4"
              label={
                <InfoTooltip text="The number of block confirmations for outbound messages. Serves the purpose of a reorg protection.">
                  Outbound block confirmations
                </InfoTooltip>
              }
              value={remoteChain.defaultAppConfig.outboundBlockConfirm}
            />
            <Row
              hideBorder
              dense
              className="!p-0 md:!pl-7 md:!pr-4"
              label={
                <InfoTooltip text="The proof library used to encode outbound messages and create proofs.">
                  Outbound proof type
                </InfoTooltip>
              }
              value={remoteChain.defaultAppConfig.outboundProofType}
            />
            <Row
              hideBorder
              dense
              className="!p-0 md:!pl-7 md:!pr-4"
              label={
                <InfoTooltip text="An address allowed to advance a block header. The oracle moves a requested block header from a source chain to a destination chain. It writes a commitment for the messages on the destination chain.">
                  Oracle
                </InfoTooltip>
              }
              value={
                <BlockchainAddress
                  address={remoteChain.defaultAppConfig.oracle}
                />
              }
            />
            <Row
              hideBorder
              dense
              className="!p-0 md:!pl-7 md:!pr-4"
              label={
                <InfoTooltip text="Works in tandem with an Oracle to transmit messages between chains. Relayer proves the message inclusion in the source chain to the destination chain.">
                  Relayer
                </InfoTooltip>
              }
              value={
                <BlockchainAddress
                  address={remoteChain.defaultAppConfig.relayer}
                />
              }
            />
          </Block>

          <Block
            title={
              <InfoTooltip text="Adapter Parameters are a bytes-array used for specifying the amount of gas on the destination chain to send for an application to use.">
                Default adapter params
              </InfoTooltip>
            }
          >
            <div className="mt-2 grid w-full grid-cols-adapter-params-small overflow-x-auto rounded border border-zinc-650 md:grid-cols-adapter-params">
              <div className="col-span-full grid grid-cols-adapter-params-small bg-zinc-650 py-3 text-center text-3xs font-semibold text-zinc-200 md:min-w-[800px] md:grid-cols-adapter-params md:text-2xs">
                <span className="md:px-6">Proof Type</span>
                <span>Version</span>
                <span>Value (Gas)</span>
                <span className="hidden md:inline">Raw</span>
              </div>
              {remoteChain.defaultAdapterParams.map((adapterParams) => {
                const unpacked = unpackAdapterParams(
                  adapterParams.adapterParams,
                )

                return (
                  <div className="col-span-full grid grid-cols-adapter-params-small items-center justify-center border-b border-zinc-650 py-2 text-center text-xs last:border-none md:grid-cols-adapter-params">
                    <span>{adapterParams.proofType}</span>
                    <span>{unpacked[0]}</span>
                    <span>{unpacked[1]}</span>
                    <Code className="hidden md:block">
                      {adapterParams.adapterParams}
                    </Code>
                  </div>
                )
              })}
            </div>
          </Block>
          <Section>
            <Row
              dense
              hideBorder
              className="!px-3 !py-4 md:!pl-7 md:!pr-4"
              label={
                <InfoTooltip text="The proof library for outbound messages. It is used to encode the Packets (messages sent between the chains). The owner of UltraLightNodeV2 can enable an already added proof type for a specific chain pathway.">
                  Supported outbound proof
                </InfoTooltip>
              }
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
              className="!px-3 !py-4 md:!pl-7 md:!pr-4"
              label={
                <InfoTooltip text="Address of the UltraLightNode on the remote chain. Used during the proof validation - it handles message handling post authentication, and how to proceed with the transaction once the Oracles/Relayer delivers the packet. The owner of UltraLightNodeV2 can set a destination UltraLightNode library to use for a specific chain pathway.">
                  Ultra Light Node
                </InfoTooltip>
              }
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
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col border-t border-zinc-400 px-3 py-4 md:px-6 md:py-3">
      <span className="mb-1 text-sm font-medium md:mb-3">{title}</span>
      <div className="flex flex-col md:gap-2">{children}</div>
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-zinc-400">{children}</div>
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
