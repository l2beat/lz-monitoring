import cx from 'classnames'

export function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="11"
      viewBox="0 0 10 11"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M9.83398 4.37305V6.07227H0.0878906V4.37305H9.83398ZM5.86914 0.222656V10.5742H4.0625V0.222656H5.86914Z" />
    </svg>
  )
}

export function SolidPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cx('fill-yellow-100', props.className)}
    >
      <g clipPath="url(#clip0_1022_5)">
        <path d="M14.5455 0H1.45455C0.650909 0 0 0.650909 0 1.45455V14.5455C0 15.3491 0.650909 16 1.45455 16H14.5455C15.3491 16 16 15.3491 16 14.5455V1.45455C16 0.650909 15.3491 0 14.5455 0ZM12.3636 8.72727H8.72727V12.3636C8.72727 12.7658 8.40145 13.0909 8 13.0909C7.59855 13.0909 7.27273 12.7658 7.27273 12.3636V8.72727H3.63636C3.23491 8.72727 2.90909 8.40218 2.90909 8C2.90909 7.59782 3.23491 7.27273 3.63636 7.27273H7.27273V3.63636C7.27273 3.23418 7.59855 2.90909 8 2.90909C8.40145 2.90909 8.72727 3.23418 8.72727 3.63636V7.27273H12.3636C12.7651 7.27273 13.0909 7.59782 13.0909 8C13.0909 8.40218 12.7651 8.72727 12.3636 8.72727Z" />
      </g>
      <defs>
        <clipPath id="clip0_1022_5">
          <rect width="16" height="16" rx="2" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
