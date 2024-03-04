import { EthereumAddress, stringAs } from '@lz/libs'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { z } from 'zod'

export { FileOAppListProvider, HttpOAppListProvider, OAppDto, OAppListDto }
export type { OAppListProvider }

const OAppDto = z.object({
  name: z.string(),
  address: stringAs(EthereumAddress),
})

type OAppDto = z.infer<typeof OAppDto>

const OAppListDto = z.array(OAppDto)
type OAppListDto = z.infer<typeof OAppListDto>

interface OAppListProvider {
  getOApps(): Promise<OAppDto[]>
}

// FIXME: Integrate
class HttpOAppListProvider implements OAppListProvider {
  getOApps(): Promise<OAppListDto> {
    return Promise.resolve([])
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
