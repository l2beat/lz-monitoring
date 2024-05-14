import cx from 'classnames'
import { useNavigate } from 'react-router-dom'

import { CollabLogo } from '../icons/CollabIcon'
import { L2BeatLogo } from '../icons/L2BeatLogo'
import { LayerZeroLogo } from '../icons/LayerZeroLogo'

export function Navbar(): JSX.Element {
  const navigate = useNavigate()
  const path = location.pathname

  return (
    <nav className="flex items-center justify-between bg-black px-8 py-4">
      <a onClick={() => navigate('/')} className="cursor-pointer">
        <h1 className="inline-flex items-center gap-5">
          <LayerZeroLogo className="h-7" />
          <CollabLogo className="h-2.5" />
          <L2BeatLogo className="h-7" />
        </h1>
      </a>
      <div>
        <NavItem
          active={path === '/'}
          onClick={() => navigate('/')}
          label="Defaults"
        />
        <NavItem
          active={path === '/applications'}
          onClick={() => navigate('/applications')}
          label="Applications"
        />
      </div>
    </nav>
  )
}

interface NavItemProps {
  active: boolean
  onClick: () => void
  label: string
}

function NavItem(props: NavItemProps) {
  const highlight = props.active
    ? 'text-yellow-100'
    : 'text-white hover:text-yellow-200'
  return (
    <button
      onClick={props.onClick}
      className={cx(
        'bg-transparent px-2 py-1 text-xs uppercase duration-300',
        highlight,
      )}
    >
      {props.label}
    </button>
  )
}
