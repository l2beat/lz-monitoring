import { assert, Logger } from '@l2beat/backend-tools'
import { EthereumAddress, stringAs } from '@lz/libs'
import { readFile } from 'fs/promises'
import fetch from 'node-fetch'
import { resolve } from 'path'
import { z } from 'zod'

export { FileOAppListProvider, HttpOAppListProvider, OAppDto, OAppListDto }
export type { OAppListProvider }

const OAppDto = z.object({
  name: z.string(),
  symbol: z.string(),
  address: stringAs(EthereumAddress),
  iconUrl: z.string(),
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
    private readonly url: string,
  ) {}
  async getOApps(): Promise<OAppListDto> {
    try {
      const result = await fetch(this.url)

      assert(result.ok, 'Failed to fetch OApps from given url')

      return OAppListDto.parse(await result.json())
    } catch (e) {
      this.logger.error('Failed to fetch OApps', e)
      throw e
    }
  }
}

class FileOAppListProvider implements OAppListProvider {
  constructor(private readonly path: string) {}

  async getOApps(): Promise<OAppListDto> {
    const uri = resolve(__dirname, this.path)
    const contents = await readFile(uri, 'utf-8')

    return OAppListDto.parse(JSON.parse(contents))
  }
}
