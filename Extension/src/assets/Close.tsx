import { type SVGProps } from "react"

export default function Close(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <title>close</title>
      <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
