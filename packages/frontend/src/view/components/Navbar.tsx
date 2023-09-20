import { CollabLogo } from '../icons/CollabIcon'
import { L2BeatLogo } from '../icons/L2BeatLogo'
import { LayerZeroLogo } from '../icons/LayerZeroLogo'

export function Navbar(): JSX.Element {
  return (
    <nav className="bg-black px-8 py-4">
      <a href="/">
        <h1 className="flex items-center  gap-5">
          <LayerZeroLogo className="h-7" />
          <CollabLogo className="h-2.5" />
          <L2BeatLogo className="h-7" />
        </h1>
      </a>
    </nav>
  )
}
