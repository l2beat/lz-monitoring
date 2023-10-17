import Skeleton from 'react-loading-skeleton'

import { Code } from './Code'

export function InlineSkeleton() {
  return <Skeleton width="350px" />
}

export function MultilineSkeleton() {
  return <Skeleton count={5} className="my-1" />
}

export function InlineCodeSkeleton() {
  return (
    <Code>
      <Skeleton />
    </Code>
  )
}

export function MultilineCodeSkeleton() {
  return (
    <Code>
      <MultilineCodeSkeleton />
    </Code>
  )
}
