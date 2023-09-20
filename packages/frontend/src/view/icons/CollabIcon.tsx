import React from 'react'

export function CollabLogo(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_20_325)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.24264 1.4644C9.4379 1.26913 9.4379 0.952551 9.24264 0.757289C9.04738 0.562027 8.7308 0.562027 8.53553 0.757289L5.35355 3.93927C5.15829 4.13453 4.84171 4.13453 4.64645 3.93927L1.46447 0.757289C1.2692 0.562027 0.952622 0.562027 0.757359 0.757289C0.562097 0.952551 0.562097 1.26913 0.757359 1.4644L3.93934 4.64638C4.1346 4.84164 4.1346 5.15822 3.93934 5.35348L0.757359 8.53546C0.562097 8.73073 0.562097 9.04731 0.757359 9.24257C0.952621 9.43783 1.2692 9.43783 1.46447 9.24257L4.64645 6.06059C4.84171 5.86533 5.15829 5.86533 5.35355 6.06059L8.53553 9.24257C8.7308 9.43783 9.04738 9.43783 9.24264 9.24257C9.4379 9.04731 9.4379 8.73073 9.24264 8.53546L6.06066 5.35348C5.8654 5.15822 5.8654 4.84164 6.06066 4.64638L9.24264 1.4644Z"
          fill="#FAFAFA"
        />
      </g>
      <defs>
        <clipPath id="clip0_20_325">
          <rect width="10" height="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
