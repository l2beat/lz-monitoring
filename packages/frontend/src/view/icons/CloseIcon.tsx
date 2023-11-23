import React from 'react'

export function CloseIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_402_13588)">
        <rect width="24" height="24" rx="4" fill="#EEF36A" />
        <rect x="5" y="5" width="14" height="14" fill="#1B1B1D" />
        <path
          d="M27.4278 10.4571L13.5428 -3.42792C12.6904 -4.28031 11.3096 -4.28031 10.4572 -3.42792L-3.42778 10.4571C-4.28017 11.3095 -4.28017 12.6903 -3.42778 13.5426L10.4572 27.4276C11.3096 28.28 12.6904 28.28 13.5428 27.4276L27.4278 13.5426C28.2802 12.6903 28.2802 11.3095 27.4278 10.4571ZM15.8569 17.3996L12 13.5426L8.14305 17.3996C7.71648 17.8262 7.02608 17.8254 6.60028 17.3996C6.17447 16.9738 6.1737 16.2834 6.60027 15.8568L10.4572 11.9999L6.60027 8.14291C6.17447 7.71711 6.1737 7.02671 6.60028 6.60014C7.02685 6.17356 7.71725 6.17433 8.14305 6.60014L12 10.4571L15.8569 6.60014C16.2835 6.17356 16.9739 6.17433 17.3997 6.60014C17.8255 7.02594 17.8263 7.71634 17.3997 8.14291L13.5428 11.9999L17.3997 15.8568C17.8255 16.2826 17.8263 16.973 17.3997 17.3996C16.9731 17.8262 16.2828 17.8254 15.8569 17.3996Z"
          fill="#EEF36A"
        />
      </g>
      <defs>
        <clipPath id="clip0_402_13588">
          <rect width="24" height="24" rx="4" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}