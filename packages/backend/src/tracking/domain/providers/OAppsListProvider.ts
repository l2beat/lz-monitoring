import { assert, Logger } from '@l2beat/backend-tools'
import { HttpClient } from '@l2beat/discovery'
import { EthereumAddress, stringAs } from '@lz/libs'
import { z } from 'zod'

export { HttpOAppListProvider, OAppDto, OAppListDto }
export type { OAppListProvider }

const OAppDto = z.object({
  name: z.string(),
  symbol: z.string(),
  address: stringAs(EthereumAddress),
  iconUrl: z.string().nullable(),
})

type OAppDto = z.infer<typeof OAppDto>

const OAppListDto = z.array(OAppDto)
type OAppListDto = z.infer<typeof OAppListDto>

interface OAppListProvider {
  getOApps(): Promise<OAppDto[]>
}

class HttpOAppListProvider implements OAppListProvider {
  constructor(
    private readonly logger: Logger,
    private readonly client: HttpClient,
    private readonly url: string,
  ) {}
  async getOApps(): Promise<OAppListDto> {
    try {
      const result = await this.client.fetch(this.url)

      assert(result.ok, 'Failed to fetch OApps from given url')

      return OAppListDto.parse(await result.json())
    } catch (e) {
      this.logger.error('Failed to fetch and parse OApps', e)
      throw e
    }
  }
}
