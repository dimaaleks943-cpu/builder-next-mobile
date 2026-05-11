import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Typography,
  type PopperProps,
} from "@mui/material"
import {
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../../theme/colors.ts"
import { AddIcon } from "../../../../icons/AddIcon.tsx"
import { CraftSettingsColorField } from "../../components/craftSettingsControls/CraftSettingsColorField.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../responsiveStyle.ts"
import {
  BACKGROUND_IMAGE_LAYER_ATTACHMENTS_KEY,
  BACKGROUND_IMAGE_LAYER_IDS_KEY,
  BACKGROUND_IMAGE_LAYER_POSITIONS_KEY,
  BACKGROUND_IMAGE_LAYER_REPEATS_KEY,
  BACKGROUND_IMAGE_LAYER_SIZES_KEY,
  BACKGROUND_IMAGE_LAYER_VISIBLE_KEY,
  BACKGROUND_IMAGE_LAYERS_KEY,
  clearAllBackgroundLayers,
  DEFAULT_PLACEHOLDER_BACKGROUND_IMAGE_URL,
  ensureCanonicalStyleSlots,
  getBackgroundLayersModel,
  getCommaPropParts, inferBackgroundFillKind,
  newBackgroundLayerId, parseCssUrl,
  persistBackgroundLayersModel,
  prependSlotToCommaProp,
  toCssBackgroundUrlValue,
  removeCommaPropLayerAt,
  reorderCommaPropLayers,
  replaceCommaPropLayer,
  syncPaintedBackgroundStack,
} from "./utils/backgroundImageLayersUtils.ts"
import { SortableBackgroundLayerRow } from "./components/SortableBackgroundLayerRow.tsx"
import type { BackgroundImageCommitOptions } from "./components/ImageGradientMenuPopper.tsx";
import { ImageGradientMenuPopper } from "./components/ImageGradientMenuPopper.tsx";

const DEFAULT_BG_DISPLAY = COLORS.white

const CLIPPING_SELECT_OPTIONS = [
  { id: "none", value: "None" },
  { id: "padding-box", value: "Clip background to padding" },
  { id: "content-box", value: "Clip background to content" },
  { id: "text", value: "Clip background to text" },
] as const

const CLIPPING_PRESETS: Record<
  (typeof CLIPPING_SELECT_OPTIONS)[number]["id"],
  { backgroundClip: string; WebkitTextFillColor: string }
> = {
  none: { backgroundClip: "border-box", WebkitTextFillColor: "inherit" },
  "padding-box": { backgroundClip: "padding-box", WebkitTextFillColor: "inherit" },
  "content-box": { backgroundClip: "content-box", WebkitTextFillColor: "inherit" },
  text: { backgroundClip: "text", WebkitTextFillColor: "transparent" },
}

const getBackgroundClippingSelectId = (
  backgroundClip: string | undefined,
  webkitTextFillColor: string | undefined,
): (typeof CLIPPING_SELECT_OPTIONS)[number]["id"] => {
  if (backgroundClip === "text" || webkitTextFillColor === "transparent") {
    return "text"
  }
  if (backgroundClip === "padding-box") return "padding-box"
  if (backgroundClip === "content-box") return "content-box"
  if (backgroundClip === "border-box" || backgroundClip === "none") return "none"
  return "none"
}

type ImageGradientMenuTarget =
  | { kind: "add" }
  | { kind: "layer"; index: number }

type ImageGradientMenuState = {
  target: ImageGradientMenuTarget
}

export const BackgroundAccordion = () => {
  const { actions } = useEditor()
  const viewport = usePreviewViewport()
  const { selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as any

  const [colorDraft, setColorDraft] = useState<string>(DEFAULT_BG_DISPLAY)
  const colorTimeoutRef = useRef<number | undefined>(undefined)
  const [imageGradientMenu, setImageGradientMenu] =
    useState<ImageGradientMenuState | null>(null)
  const menuAnchorElementRef = useRef<HTMLElement | null>(null)
  const imageGradientMenuPopperRef = useRef<HTMLDivElement | null>(null)
  const imageGradientRowRef = useRef<HTMLDivElement | null>(null)
  const imageGradientMenuRef = useRef<ImageGradientMenuState | null>(null)
  imageGradientMenuRef.current = imageGradientMenu
  const pendingEmptyBackgroundSeedRef = useRef(false)

  const closeImageGradientMenu = useCallback(() => {
    menuAnchorElementRef.current = null
    setImageGradientMenu(null)
  }, [])

  const imageGradientMenuAnchorEl = useMemo((): PopperProps["anchorEl"] => {
    if (!imageGradientMenu) return null
    return () => menuAnchorElementRef.current as HTMLElement
  }, [imageGradientMenu])
  const commitBackgroundImageRef = useRef<
    (next: string | undefined, options?: BackgroundImageCommitOptions) => void
  >(() => {})

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 2 },
    }),
    useSensor(KeyboardSensor),
  )

  useEffect(() => {
    setColorDraft(
      (getResponsiveStyleProp(selectedProps, "backgroundColor", viewport) as string | undefined) ??
        DEFAULT_BG_DISPLAY,
    )
  }, [selectedProps, selectedId, viewport])

  useEffect(() => {
    if (!imageGradientMenu) return
    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (imageGradientRowRef.current?.contains(target)) return
      if (imageGradientMenuPopperRef.current?.contains(target)) return
      if (target instanceof Element && target.closest("[data-bg-gradient-popper]")) {
        return
      }
      closeImageGradientMenu()
    }
    document.addEventListener("mousedown", onDocMouseDown, true)

    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [closeImageGradientMenu, imageGradientMenu])

  useLayoutEffect(() => {
    if (!selectedId || !selectedProps) return
    const layersRaw = selectedProps[BACKGROUND_IMAGE_LAYERS_KEY]
    const idsRaw = selectedProps[BACKGROUND_IMAGE_LAYER_IDS_KEY]
    const visRaw = selectedProps[BACKGROUND_IMAGE_LAYER_VISIBLE_KEY]
    if (!Array.isArray(layersRaw) || layersRaw.length === 0) return

    const layers = layersRaw.map((x) => String(x).trim()).filter(Boolean)
    if (layers.length === 0) return

    const idsOk = Array.isArray(idsRaw) && idsRaw.length === layers.length
    const visOk = Array.isArray(visRaw) && visRaw.length === layers.length
    const slotLenMatches = (key: string) =>
      Array.isArray(selectedProps[key]) &&
      (selectedProps[key] as unknown[]).length === layers.length
    const slotsOk =
      slotLenMatches(BACKGROUND_IMAGE_LAYER_SIZES_KEY) &&
      slotLenMatches(BACKGROUND_IMAGE_LAYER_POSITIONS_KEY) &&
      slotLenMatches(BACKGROUND_IMAGE_LAYER_REPEATS_KEY) &&
      slotLenMatches(BACKGROUND_IMAGE_LAYER_ATTACHMENTS_KEY)

    if (idsOk && visOk && slotsOk) return

    actions.setProp(selectedId, (props: any) => {
      if (!idsOk || !visOk) {
        persistBackgroundLayersModel(props, viewport, {
          layers,
          visible: visOk ? visRaw.map(Boolean) : layers.map(() => true),
          layerIds: idsOk ? idsRaw.map(String) : layers.map(() => newBackgroundLayerId()),
        })
        return
      }
      const model = getBackgroundLayersModel(props, viewport)
      ensureCanonicalStyleSlots(props, viewport, model.layers.length)
      syncPaintedBackgroundStack(props, viewport, model)
    })
  }, [actions, selectedId, selectedProps, viewport])

  useEffect(() => {
    if (!selectedId || !selectedProps) return
    if (!pendingEmptyBackgroundSeedRef.current) return
    if (!imageGradientMenu || imageGradientMenu.target.kind !== "add") return
    if (getBackgroundLayersModel(selectedProps, viewport).layers.length > 0) return
    pendingEmptyBackgroundSeedRef.current = false
    commitBackgroundImageRef.current(
      toCssBackgroundUrlValue(DEFAULT_PLACEHOLDER_BACKGROUND_IMAGE_URL),
      { urlFillDefaults: "apply" },
    )
  }, [imageGradientMenu, selectedId, selectedProps, viewport])

  if (!selectedId || !selectedProps) {
    return null
  }

  const layersModel = getBackgroundLayersModel(selectedProps, viewport)
  const hasBackgroundLayers = layersModel.layers.length > 0

  const scheduleBackgroundColorUpdate = (value: string) => {
    if (!selectedId) return
    if (colorTimeoutRef.current !== undefined) {
      window.clearTimeout(colorTimeoutRef.current)
    }
    colorTimeoutRef.current = window.setTimeout(() => {
      actions.setProp(selectedId, (props: any) => {
        setResponsiveStyleProp(props, "backgroundColor", value, viewport)
      })
    }, 200)
  }

  const handleColorChange = (value: string) => {
    setColorDraft(value)
    scheduleBackgroundColorUpdate(value)
  }

  const backgroundClipRaw = getResponsiveStyleProp(
    selectedProps,
    "backgroundClip",
    viewport,
  ) as string | undefined
  const webkitTextFillColorRaw = getResponsiveStyleProp(
    selectedProps,
    "WebkitTextFillColor",
    viewport,
  ) as string | undefined
  const clippingSelectId = getBackgroundClippingSelectId(
    backgroundClipRaw,
    webkitTextFillColorRaw,
  )
  const hasClippingOverrides =
    backgroundClipRaw !== undefined || webkitTextFillColorRaw !== undefined

  const handleClipChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectId = event.target.value as keyof typeof CLIPPING_PRESETS
    const preset = CLIPPING_PRESETS[selectId]
    if (!preset) return
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "backgroundClip", preset.backgroundClip, viewport)
      setResponsiveStyleProp(props, "WebkitTextFillColor", preset.WebkitTextFillColor, viewport)
    })
  }

  const handleClipReset = () => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "backgroundClip", undefined, viewport)
      setResponsiveStyleProp(props, "WebkitTextFillColor", undefined, viewport)
    })
  }

  const toggleAddImageGradientMenu = (event: ReactMouseEvent<HTMLElement>) => {
    const el = event.currentTarget
    menuAnchorElementRef.current = el
    setImageGradientMenu((prev) => {
      if (prev?.target.kind === "add") {
        pendingEmptyBackgroundSeedRef.current = false
        menuAnchorElementRef.current = null
        return null
      }
      pendingEmptyBackgroundSeedRef.current = layersModel.layers.length === 0
      return { target: { kind: "add" } }
    })
  }

  const menuTarget = imageGradientMenu?.target

  const layerCount = layersModel.layers.length
  const editLayerIndex =
    menuTarget?.kind === "layer" ? menuTarget.index : null

  const popperBackgroundImage =
    menuTarget?.kind === "layer" && editLayerIndex !== null
      ? layersModel.layers[editLayerIndex]
      : undefined

  const popperBackgroundSize =
    menuTarget?.kind === "add"
      ? "auto"
      : layerCount === 0 || editLayerIndex === null
        ? undefined
        : getCommaPropParts(
          selectedProps,
          viewport,
          "backgroundSize",
          layerCount,
          "auto",
        )[editLayerIndex]

  const popperBackgroundPosition =
    menuTarget?.kind === "add"
      ? "0px 0px"
      : layerCount === 0 || editLayerIndex === null
        ? undefined
        : getCommaPropParts(
          selectedProps,
          viewport,
          "backgroundPosition",
          layerCount,
          "0px 0px",
        )[editLayerIndex]

  const popperBackgroundRepeat =
    menuTarget?.kind === "add"
      ? undefined
      : layerCount === 0 || editLayerIndex === null
        ? undefined
        : getCommaPropParts(
          selectedProps,
          viewport,
          "backgroundRepeat",
          layerCount,
          "repeat",
        )[editLayerIndex]

  const popperBackgroundAttachment =
    menuTarget?.kind === "add"
      ? undefined
      : layerCount === 0 || editLayerIndex === null
        ? undefined
        : getCommaPropParts(
          selectedProps,
          viewport,
          "backgroundAttachment",
          layerCount,
          "scroll",
        )[editLayerIndex]

  const applyUrlDefaultsForLayer = (
    props: Record<string, unknown>,
    layerIndex: number,
    layerCountForProp: number,
    mode: "apply" | "clear" | undefined,
  ) => {
    if (mode === "apply" || mode === "clear") {
      replaceCommaPropLayer(
        props,
        viewport,
        "backgroundSize",
        layerCountForProp,
        layerIndex,
        "auto",
        "auto",
      )
      replaceCommaPropLayer(
        props,
        viewport,
        "backgroundPosition",
        layerCountForProp,
        layerIndex,
        "0px 0px",
        "0px 0px",
      )
    }
  }

  const commitBackgroundImage = (
    next: string | undefined,
    options?: BackgroundImageCommitOptions,
  ) => {
    const menuSnap = imageGradientMenuRef.current
    actions.setProp(selectedId, (props: any) => {
      if (next === undefined || String(next).trim() === "") {
        if (menuSnap?.target?.kind === "add") {
          return
        }
        clearAllBackgroundLayers(props, viewport)
        queueMicrotask(() => {
          menuAnchorElementRef.current = null
          setImageGradientMenu(null)
        })
        return
      }

      const trimmed = String(next).trim()
      const model = getBackgroundLayersModel(props, viewport)
      const target = menuSnap?.target

      if (!target) {
        return
      }

      if (target.kind === "add") {
        const newLayers = [trimmed, ...model.layers]
        const newVisible = [true, ...model.visible]
        const newIds = [newBackgroundLayerId(), ...model.layerIds]
        const nextModel = { layers: newLayers, visible: newVisible, layerIds: newIds }
        const prevLen = model.layers.length
        prependSlotToCommaProp(props, viewport, "backgroundSize", prevLen, "auto")
        prependSlotToCommaProp(props, viewport, "backgroundPosition", prevLen, "0px 0px")
        prependSlotToCommaProp(props, viewport, "backgroundRepeat", prevLen, "repeat")
        prependSlotToCommaProp(props, viewport, "backgroundAttachment", prevLen, "scroll")
        persistBackgroundLayersModel(props, viewport, nextModel)
        applyUrlDefaultsForLayer(props, 0, newLayers.length, options?.urlFillDefaults)
        queueMicrotask(() => {
          setImageGradientMenu((prev) =>
            prev?.target.kind === "add"
              ? { target: { kind: "layer", index: 0 } }
              : prev,
          )
        })
        return
      }

      if (target.kind === "layer") {
        const idx = target.index
        if (idx < 0 || idx >= model.layers.length) return
        const nextLayers = model.layers.slice()
        nextLayers[idx] = trimmed
        persistBackgroundLayersModel(props, viewport, {
          layers: nextLayers,
          visible: model.visible,
          layerIds: model.layerIds,
        })
        applyUrlDefaultsForLayer(props, idx, model.layers.length, options?.urlFillDefaults)
      }
    })
  }

  commitBackgroundImageRef.current = commitBackgroundImage

  const clearLayer = (layerIndex: number) => {
    actions.setProp(selectedId, (props: any) => {
      const model = getBackgroundLayersModel(props, viewport)
      if (layerIndex < 0 || layerIndex >= model.layers.length) return
      const oldLen = model.layers.length
      removeCommaPropLayerAt(props, viewport, "backgroundSize", oldLen, layerIndex)
      removeCommaPropLayerAt(props, viewport, "backgroundPosition", oldLen, layerIndex)
      removeCommaPropLayerAt(props, viewport, "backgroundRepeat", oldLen, layerIndex)
      removeCommaPropLayerAt(props, viewport, "backgroundAttachment", oldLen, layerIndex)
      const newLayers = model.layers.filter((_, j) => j !== layerIndex)
      const newVisible = model.visible.filter((_, j) => j !== layerIndex)
      const newIds = model.layerIds.filter((_, j) => j !== layerIndex)
      if (newLayers.length === 0) {
        clearAllBackgroundLayers(props, viewport)
        return
      }
      persistBackgroundLayersModel(props, viewport, {
        layers: newLayers,
        visible: newVisible,
        layerIds: newIds,
      })
    })
    setImageGradientMenu((prev) => {
      if (!prev || prev.target.kind !== "layer") return prev
      if (prev.target.index === layerIndex) {
        menuAnchorElementRef.current = null
        return null
      }
      if (prev.target.index > layerIndex) {
        return {
          target: { kind: "layer", index: prev.target.index - 1 },
        }
      }
      return prev
    })
  }

  const toggleLayerVisible = (layerIndex: number) => {
    actions.setProp(selectedId, (props: any) => {
      const model = getBackgroundLayersModel(props, viewport)
      if (layerIndex < 0 || layerIndex >= model.visible.length) return
      const nextVisible = model.visible.slice()
      nextVisible[layerIndex] = !nextVisible[layerIndex]
      persistBackgroundLayersModel(props, viewport, {
        ...model,
        visible: nextVisible,
      })
    })
  }

  const onLayersDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    actions.setProp(selectedId, (props: any) => {
      const model = getBackgroundLayersModel(props, viewport)
      const oldIndex = model.layerIds.indexOf(String(active.id))
      const newIndex = model.layerIds.indexOf(String(over.id))
      if (oldIndex < 0 || newIndex < 0) return
      const len = model.layers.length
      reorderCommaPropLayers(props, viewport, "backgroundSize", len, oldIndex, newIndex)
      reorderCommaPropLayers(props, viewport, "backgroundPosition", len, oldIndex, newIndex)
      reorderCommaPropLayers(props, viewport, "backgroundRepeat", len, oldIndex, newIndex)
      reorderCommaPropLayers(props, viewport, "backgroundAttachment", len, oldIndex, newIndex)
      const layers = arrayMove(model.layers, oldIndex, newIndex)
      const visible = arrayMove(model.visible, oldIndex, newIndex)
      const layerIds = arrayMove(model.layerIds, oldIndex, newIndex)
      persistBackgroundLayersModel(props, viewport, { layers, visible, layerIds })
    })
    closeImageGradientMenu()
  }

  const commitCommaLayer = (
    key: "backgroundSize" | "backgroundPosition" | "backgroundRepeat" | "backgroundAttachment",
    next: string | undefined,
    filler: string,
  ) => {
    actions.setProp(selectedId, (props: any) => {
      const model = getBackgroundLayersModel(props, viewport)
      const target = imageGradientMenuRef.current?.target
      if (target?.kind === "add") return
      if (target?.kind !== "layer") return
      const idx = target.index
      if (idx < 0 || idx >= model.layers.length) return
      replaceCommaPropLayer(props, viewport, key, model.layers.length, idx, next, filler)
    })
  }

  const commitBackgroundSize = (next: string | undefined) => {
    commitCommaLayer("backgroundSize", next, "auto")
  }

  const commitBackgroundPosition = (next: string | undefined) => {
    commitCommaLayer("backgroundPosition", next, "0px 0px")
  }

  const commitBackgroundRepeat = (next: string | undefined) => {
    commitCommaLayer("backgroundRepeat", next, "repeat")
  }

  const commitBackgroundAttachment = (next: string | undefined) => {
    commitCommaLayer("backgroundAttachment", next, "scroll")
  }

  const addMenuHighlight = imageGradientMenu?.target.kind === "add"

  return (
    <Accordion disableGutters>
      <AccordionSummary
        sx={{
          minHeight: 40,
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography sx={{ color: COLORS.gray700, fontSize: "12px" }}>
          Фон
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          <Box
            ref={imageGradientRowRef}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography
                sx={{
                  fontSize: "10px",
                  lineHeight: "14px",
                  color: COLORS.gray700,
                }}
              >
                Image & Gradient
              </Typography>
              <IconButton
                size="small"
                onClick={toggleAddImageGradientMenu}
                sx={{
                  color: COLORS.purple400,
                  padding: "4px",
                  ...(addMenuHighlight
                    ? {
                      boxShadow: `0 0 0 1px ${COLORS.purple400}`,
                      backgroundColor: COLORS.purple100,
                      borderRadius: "6px",
                    }
                    : {}),
                }}
                aria-label="Add image or gradient"
                aria-expanded={Boolean(imageGradientMenu)}
              >
                <AddIcon width={20} height={20} fill={COLORS.purple400} />
              </IconButton>
            </Box>
            {hasBackgroundLayers ? (
              <Box
                sx={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px",
                  borderRadius: "6px",
                  border: `1px dashed ${COLORS.gray300}`,
                  backgroundColor: COLORS.gray100,
                }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={onLayersDragEnd}
                >
                  <SortableContext
                    items={layersModel.layerIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        width: "100%",
                      }}
                    >
                      {layersModel.layers.map((layer, i) => {
                        const fillKind = inferBackgroundFillKind(layer)
                        const previewHref = fillKind === "url" ? parseCssUrl(layer) : null
                        const summaryLabel =
                          fillKind === "url" ? (previewHref ?? layer) : layer
                        const layerId = layersModel.layerIds[i]
                        if (!layerId) return null
                        return (
                          <SortableBackgroundLayerRow
                            key={layerId}
                            id={layerId}
                            previewUrl={previewHref}
                            gradientFillCss={previewHref ? null : layer}
                            summaryLabel={summaryLabel}
                            layerVisibleOnCanvas={layersModel.visible[i] ?? true}
                            popperOpen={
                              Boolean(
                                imageGradientMenu &&
                                imageGradientMenu.target.kind === "layer" &&
                                imageGradientMenu.target.index === i,
                              )
                            }
                            onOpenMenu={(e) => {
                              const el = e.currentTarget
                              menuAnchorElementRef.current = el
                              setImageGradientMenu((prev) => {
                                if (
                                  prev?.target.kind === "layer" &&
                                  prev.target.index === i
                                ) {
                                  menuAnchorElementRef.current = null
                                  return null
                                }
                                return { target: { kind: "layer", index: i } }
                              })
                            }}
                            onToggleCanvasVisibility={() => toggleLayerVisible(i)}
                            onClear={() => clearLayer(i)}
                          />
                        )
                      })}
                    </Box>
                  </SortableContext>
                </DndContext>
              </Box>
            ) : null}
          </Box>

          <ImageGradientMenuPopper
            open={Boolean(imageGradientMenu)}
            anchorEl={imageGradientMenuAnchorEl}
            popperRef={imageGradientMenuPopperRef}
            backgroundImage={popperBackgroundImage}
            backgroundSize={popperBackgroundSize}
            backgroundPosition={popperBackgroundPosition}
            backgroundRepeat={popperBackgroundRepeat}
            backgroundAttachment={popperBackgroundAttachment}
            onCommitBackgroundImage={commitBackgroundImage}
            onCommitBackgroundSize={commitBackgroundSize}
            onCommitBackgroundPosition={commitBackgroundPosition}
            onCommitBackgroundRepeat={commitBackgroundRepeat}
            onCommitBackgroundAttachment={commitBackgroundAttachment}
          />

          <CraftSettingsColorField
            label="Color"
            value={colorDraft}
            onChange={handleColorChange}
          />

          <CraftSettingsSelect
            label="Clipping"
            value={clippingSelectId}
            onChange={handleClipChange}
            options={[...CLIPPING_SELECT_OPTIONS]}
            labelReset={{
              hasValue: hasClippingOverrides,
              onReset: handleClipReset,
            }}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
