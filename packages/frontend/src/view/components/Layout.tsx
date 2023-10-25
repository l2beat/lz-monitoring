interface Props {
  children: React.ReactNode
}

export function Layout(props: Props): JSX.Element {
  return <main className="mx-auto max-w-[1008px] pb-36">{props.children}</main>
}
