export function LoadingCover() {
  return (
    <div className="absolute left-0 top-0 z-loading-cover flex min-h-full w-full items-center justify-center rounded-lg bg-gray-900/90">
      <div className="border-r-none h-[40px] w-[40px] animate-spin rounded-[50%] border-[2px] border-t-yellow-100" />
    </div>
  )
}
