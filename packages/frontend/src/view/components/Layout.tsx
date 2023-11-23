interface Props {
  children: React.ReactNode
}

export function Layout(props: Props): JSX.Element {
  return <main className="mx-auto max-w-[1040px] pb-36">{props.children}</main>
}

export function MaxWidthLayout(props: Props): JSX.Element {
  return <div className="mx-auto max-w-[1040px]">{props.children}</div>
}
