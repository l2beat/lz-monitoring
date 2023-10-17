export function WarningIcon(props: { stroke?: string }) {
  const stroke = props.stroke ?? 'white'
  return (
    <svg viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_1222_43721)">
        <path
          d="M9.79289 13.2071C9.60536 13.3946 9.351 13.5 9.08579 13.5H4.91421C4.649 13.5 4.39464 13.3946 4.20711 13.2071L0.792893 9.79289C0.605357 9.60536 0.5 9.351 0.5 9.08579V4.91421C0.5 4.649 0.605357 4.39464 0.792893 4.20711L4.20711 0.792893C4.39464 0.605357 4.649 0.5 4.91421 0.5H9.08579C9.351 0.5 9.60536 0.605357 9.79289 0.792893L13.2071 4.20711C13.3946 4.39464 13.5 4.649 13.5 4.91421V9.08579C13.5 9.351 13.3946 9.60536 13.2071 9.79289L9.79289 13.2071Z"
          stroke={stroke}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7 4V7.25"
          stroke={stroke}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7 10C6.86193 10 6.75 9.88807 6.75 9.75C6.75 9.61193 6.86193 9.5 7 9.5"
          stroke={stroke}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7 10C7.13807 10 7.25 9.88807 7.25 9.75C7.25 9.61193 7.13807 9.5 7 9.5"
          stroke={stroke}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1222_43721">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
