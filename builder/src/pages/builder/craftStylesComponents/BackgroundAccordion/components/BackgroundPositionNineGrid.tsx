import { COLORS } from "../../../../../theme/colors.ts"
import {
  PositionGridFrame,
  PositionNineGridCell,
  PositionNineGridDiamondWrap,
  PositionNineGridDot,
  PositionNineGridDotShell,
  PositionNineGridLayout,
} from "./ImageGradientMenuPopper.styles.ts"

const BG_POSITION_PRESETS = [
  "0% 0%",
  "50% 0%",
  "100% 0%",
  "0% 50%",
  "50% 50%",
  "100% 50%",
  "0% 100%",
  "50% 100%",
  "100% 100%",
] as const

const PRESET_ARIA: readonly string[] = [
  "Background position top left",
  "Background position top center",
  "Background position top right",
  "Background position center left",
  "Background position center",
  "Background position center right",
  "Background position bottom left",
  "Background position bottom center",
  "Background position bottom right",
]

const normalizePercentAxis = (token: string): string | null => {
  const compact = token.trim().toLowerCase().replace(/\s/g, "")
  const m = compact.match(/^(\d+(?:\.\d+)?)%$/)
  if (!m) return null
  const n = Number(m[1])
  if (!Number.isFinite(n)) return null
  if (n === 0) return "0%"
  if (n === 50) return "50%"
  if (n === 100) return "100%"
  return `${n}%`
}

/** Returns canonical `x% y%` only when both axes are plain percentages; otherwise null (no preset match). */
const normalizeBgPositionPair = (raw: string | undefined): string | null => {
  if (!raw?.trim()) return null
  const tokens = raw.trim().replace(/\s+/g, " ").split(" ")
  if (tokens.length !== 2) return null
  const x = normalizePercentAxis(tokens[0] ?? "")
  const y = normalizePercentAxis(tokens[1] ?? "")
  if (x === null || y === null) return null
  return `${x} ${y}`
}

const PositionDiamondFrame = () => (
  <svg
    width={22}
    height={22}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <g
      stroke={COLORS.purple400}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 12 3 L 9 7 M 12 3 L 15 7" />
      <path d="M 21 12 L 17 9 M 21 12 L 17 15" />
      <path d="M 12 21 L 9 17 M 12 21 L 15 17" />
      <path d="M 3 12 L 7 9 M 3 12 L 7 15" />
    </g>
  </svg>
)

interface Props {
  backgroundPosition: string | undefined
  onCommit: (next: string) => void
}

export const BackgroundPositionNineGrid = ({
  backgroundPosition,
  onCommit,
}: Props) => {
  const normalized = normalizeBgPositionPair(backgroundPosition)
  const selectedIndex =
    normalized !== null
      ? (BG_POSITION_PRESETS as readonly string[]).indexOf(normalized)
      : -1

  return (
    <PositionGridFrame>
      <PositionNineGridLayout>
        {BG_POSITION_PRESETS.map((preset, index) => {
          const selected = selectedIndex === index
          return (
            <PositionNineGridCell
              key={preset}
              type="button"
              aria-label={PRESET_ARIA[index]}
              aria-pressed={selected}
              onClick={() => {
                onCommit(preset)
              }}
            >
              <PositionNineGridDotShell>
                {selected ? (
                  <PositionNineGridDiamondWrap>
                    <PositionDiamondFrame />
                  </PositionNineGridDiamondWrap>
                ) : null}
                <PositionNineGridDot $selected={selected} />
              </PositionNineGridDotShell>
            </PositionNineGridCell>
          )
        })}
      </PositionNineGridLayout>
    </PositionGridFrame>
  )
}
