import cx from 'classnames'

export function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="2"
      viewBox="0 0 10 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M9.80469 0.158203V1.64258H0.0195312V0.158203H9.80469Z" />
    </svg>
  )
}

export function SolidMinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cx('fill-yellow-100', props.className)}
    >
      <path d="M14.5455 0H1.45455C0.650909 0 0 0.650909 0 1.45455V14.5455C0 15.3491 0.650909 16 1.45455 16H14.5455C15.3491 16 16 15.3491 16 14.5455V1.45455C16 0.650909 15.3491 0 14.5455 0ZM12.3636 8.72727H8.72727C8.72727 8.72727 8.40145 8.72727 8 8.72727C7.59855 8.72727 7.27273 8.72727 7.27273 8.72727H3.63636C3.23491 8.72727 2.90909 8.40218 2.90909 8C2.90909 7.59782 3.23491 7.27273 3.63636 7.27273H7.27273C7.27273 7.27273 7.59855 7.27273 8 7.27273C8.40145 7.27273 8.72727 7.27273 8.72727 7.27273H12.3636C12.7651 7.27273 13.0909 7.59782 13.0909 8C13.0909 8.40218 12.7651 8.72727 12.3636 8.72727Z" />
    </svg>
  )
}
