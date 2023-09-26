interface LayoutProps {
  children: React.ReactNode
}

export function Layout(props: LayoutProps): JSX.Element {
  return <main className="mx-auto max-w-[1008px] pb-36">{props.children}</main>
}