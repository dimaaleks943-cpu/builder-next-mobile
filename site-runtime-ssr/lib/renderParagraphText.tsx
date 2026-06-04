import { Fragment } from "react"

/** Renders craft paragraph `text` where each `\n` becomes a `<br />` (matches builder DOM). */
export const renderParagraphText = (text: string): React.ReactNode => {
  const segments = text.split("\n")
  if (segments.length <= 1) {
    return text
  }
  return segments.map((segment, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {segment}
    </Fragment>
  ))
}
