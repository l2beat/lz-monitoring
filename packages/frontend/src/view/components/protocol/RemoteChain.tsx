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
    <div className="rounded-lg bg-zinc-300">
      <Row
        className="px-6"
        label={
          <InfoTooltip text="List of destination chains decoding is supported for by this site.">
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
              <InfoTooltip text="The  default config parameters. The owner of UltraLightNodeV2 can set a new default application configuration. Default parameters are used if the User Application did not set its own configuration for a specific chain pathway.">
                Default app config
              </InfoTooltip>
            }
          >
            <Row
              hideBorder
              dense
              className="md:pl-7"
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
              className="md:pl-7"
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
              className="md:pl-7"
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
              className="md:pl-7"
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
              className="md:pl-7"
              label={
                <InfoTooltip text="A contract address that can be notified to move a block header. It writes a commitment for the messages on the destination chain.">
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
              className="md:pl-7"
              label={
                <InfoTooltip text="Works with tandem with an Oracle to transmit messages between chains. By default, User Applications will use LayerZero Relayer which can be changed within the User Application's configuration.">
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
              <InfoTooltip text="Adapter Parameters are a bytes-array used for specifying the amount of gas on the destination chain to send for an application to use. If this parameter is left blank or passed as 0x0, then defaults are inherited and used. The owner of UltraLightNodeV2 can set new default parameters.">
                Default adapter params
              </InfoTooltip>
            }
          >
            <div className="grid grid-cols-adapter-params overflow-x-auto">
              <div className="col-span-4 grid min-w-[800px] grid-cols-adapter-params rounded bg-gray-600 py-3 text-center text-[13px] font-semibold text-gray-50">
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
                  <div className="col-span-4 my-2 grid grid-cols-adapter-params items-center justify-center border-b border-gray-500 text-center text-xs last:border-none">
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
              className="md:pl-7"
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
    <div className="flex flex-col border-t border-zinc-400 px-6 py-3">
      <span className="pb-3 text-sm font-medium text-gray-100">{title}</span>
      <div className="flex flex-col md:gap-2">{children}</div>
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className=" border-t border-zinc-400">{children}</div>
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
