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
import { useEditor } from "@craftjs/core"
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
import { COLORS } from "../../../../theme/colors.ts"
import { AddIcon } from "../../../../icons/AddIcon.tsx"
import { CraftSettingsColorField } from "../../components/craftSettingsControls/CraftSettingsColorField/CraftSettingsColorField.tsx"
import {
  isStyleVariableRef,
  type StyleVariableRef,
} from "../../variables/types.ts"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import { useStyleEditing } from "../../hooks/useStyleEditing.ts"
import {
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
  applyUrlFillLayerSlots,
  bootstrapBackgroundLayersFromPaintedCss,
  clearBackgroundLayerNodeMetadata,
  DEFAULT_PLACEHOLDER_BACKGROUND_IMAGE_URL,
  ensureCanonicalSlots,
  getBackgroundLayerSlots,
  getBackgroundLayersModel,
  getCommaPropParts,
  inferBackgroundFillKind,
  newBackgroundLayerId,
  parseCssUrl,
  prependSlotsForNewLayer,
  removeSlotsAtLayer,
  reorderSlotsAllLayers,
  replaceSlotInLayer,
  syncPaintedBackgroundStack,
  toCssBackgroundUrlValue,
  writeBackgroundLayerNodeMetadata,
  type BackgroundLayerSlots,
  type BackgroundLayersModel,
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

const cloneBackgroundLayerState = (
  model: BackgroundLayersModel,
  slots: BackgroundLayerSlots,
): { model: BackgroundLayersModel; slots: BackgroundLayerSlots } => ({
  model: {
    layers: [...model.layers],
    visible: [...model.visible],
    layerIds: [...model.layerIds],
  },
  slots: {
    sizes: [...slots.sizes],
    positions: [...slots.positions],
    repeats: [...slots.repeats],
    attachments: [...slots.attachments],
  },
})

const emptyBackgroundLayerState = (): {
  model: BackgroundLayersModel
  slots: BackgroundLayerSlots
} => ({
  model: { layers: [], visible: [], layerIds: [] },
  slots: { sizes: [], positions: [], repeats: [], attachments: [] },
})

export const BackgroundAccordion = () => {
  const viewport = usePreviewViewport()
  const { actions } = useEditor()
  const {
    selectedId,
    selectedProps,
    getStyleProp,
    setStyleProp,
    mutateClassStyle,
    nodeStyleForRead,
  } = useStyleEditing()
  const stylePropsForRead = useMemo(
    () => ({ style: nodeStyleForRead }) as Record<string, unknown>,
    [nodeStyleForRead],
  )
  const [colorDraft, setColorDraft] =
    useState<string | StyleVariableRef>(DEFAULT_BG_DISPLAY)
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

  const applyBackgroundLayerMutation = useCallback(
    (
      mutator: (ctx: {
        model: BackgroundLayersModel
        slots: BackgroundLayerSlots
      }) => { model: BackgroundLayersModel; slots: BackgroundLayerSlots } | null,
    ) => {
      if (!selectedId) return
      const currentModel = getBackgroundLayersModel(selectedProps, viewport)
      const currentSlots = getBackgroundLayerSlots(
        selectedProps,
        stylePropsForRead,
        viewport,
        currentModel.layers.length,
      )
      const result = mutator(cloneBackgroundLayerState(currentModel, currentSlots))
      if (!result) return

      actions.setProp(selectedId, (nodeProps: Record<string, unknown>) => {
        if (result.model.layers.length === 0) {
          clearBackgroundLayerNodeMetadata(nodeProps)
        } else {
          writeBackgroundLayerNodeMetadata(nodeProps, result.model, result.slots)
        }
      })

      mutateClassStyle((draft) => {
        syncPaintedBackgroundStack(draft, viewport, result.model, result.slots)
      })
    },
    [
      actions,
      mutateClassStyle,
      selectedId,
      selectedProps,
      stylePropsForRead,
      viewport,
    ],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 2 },
    }),
    useSensor(KeyboardSensor),
  )

  useEffect(() => {
    const backgroundColorProp = getStyleProp("backgroundColor")
    setColorDraft(
      isStyleVariableRef(backgroundColorProp)
        ? backgroundColorProp
        : ((backgroundColorProp as string | undefined) ?? DEFAULT_BG_DISPLAY),
    )
  }, [selectedProps, selectedId, viewport, getStyleProp])

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

    const bootstrapped = bootstrapBackgroundLayersFromPaintedCss(
      selectedProps,
      stylePropsForRead,
      viewport,
    )
    if (bootstrapped) {
      actions.setProp(selectedId, (nodeProps: Record<string, unknown>) => {
        writeBackgroundLayerNodeMetadata(nodeProps, bootstrapped.model, bootstrapped.slots)
      })
      mutateClassStyle((draft) => {
        syncPaintedBackgroundStack(draft, viewport, bootstrapped.model, bootstrapped.slots)
      })
      return
    }

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

    const repairedModel: BackgroundLayersModel = {
      layers,
      visible: visOk ? visRaw.map(Boolean) : layers.map(() => true),
      layerIds: idsOk ? idsRaw.map(String) : layers.map(() => newBackgroundLayerId()),
    }
    const repairedSlots = ensureCanonicalSlots(
      getBackgroundLayerSlots(selectedProps, stylePropsForRead, viewport, layers.length),
      stylePropsForRead,
      viewport,
      layers.length,
    )

    actions.setProp(selectedId, (nodeProps: Record<string, unknown>) => {
      writeBackgroundLayerNodeMetadata(nodeProps, repairedModel, repairedSlots)
    })
    mutateClassStyle((draft) => {
      syncPaintedBackgroundStack(draft, viewport, repairedModel, repairedSlots)
    })
  }, [actions, mutateClassStyle, selectedId, selectedProps, stylePropsForRead, viewport])

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
      setStyleProp("backgroundColor", value)
    }, 200)
  }

  const handleColorChange = (value: string | StyleVariableRef) => {
    setColorDraft(value)
    if (isStyleVariableRef(value)) {
      setStyleProp("backgroundColor", value)
      return
    }
    scheduleBackgroundColorUpdate(value)
  }

  const backgroundClipRaw = getStyleProp("backgroundClip") as string | undefined
  const webkitTextFillColorRaw = getStyleProp("WebkitTextFillColor") as string | undefined
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
    mutateClassStyle((draft) => {
      setResponsiveStyleProp(draft, "backgroundClip", preset.backgroundClip, viewport)
      setResponsiveStyleProp(draft, "WebkitTextFillColor", preset.WebkitTextFillColor, viewport)
    })
  }

  const handleClipReset = () => {
    mutateClassStyle((draft) => {
      setResponsiveStyleProp(draft, "backgroundClip", undefined, viewport)
      setResponsiveStyleProp(draft, "WebkitTextFillColor", undefined, viewport)
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
          stylePropsForRead,
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
          stylePropsForRead,
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
          stylePropsForRead,
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
          stylePropsForRead,
          viewport,
          "backgroundAttachment",
          layerCount,
          "scroll",
        )[editLayerIndex]

  const commitBackgroundImage = (
    next: string | undefined,
    options?: BackgroundImageCommitOptions,
  ) => {
    const menuSnap = imageGradientMenuRef.current
    if (next === undefined || String(next).trim() === "") {
      if (menuSnap?.target?.kind === "add") return
      applyBackgroundLayerMutation(() => {
        queueMicrotask(() => {
          menuAnchorElementRef.current = null
          setImageGradientMenu(null)
        })
        return emptyBackgroundLayerState()
      })
      return
    }

    const trimmed = String(next).trim()
    const target = menuSnap?.target
    if (!target) return

    applyBackgroundLayerMutation(({ model, slots }) => {
      if (target.kind === "add") {
        const nextSlots = prependSlotsForNewLayer(slots)
        const newLayers = [trimmed, ...model.layers]
        applyUrlFillLayerSlots(nextSlots, 0, newLayers.length, options?.urlFillDefaults)
        queueMicrotask(() => {
          setImageGradientMenu((prev) =>
            prev?.target.kind === "add"
              ? { target: { kind: "layer", index: 0 } }
              : prev,
          )
        })
        return {
          model: {
            layers: newLayers,
            visible: [true, ...model.visible],
            layerIds: [newBackgroundLayerId(), ...model.layerIds],
          },
          slots: nextSlots,
        }
      }

      if (target.kind === "layer") {
        const idx = target.index
        if (idx < 0 || idx >= model.layers.length) return null
        const nextLayers = model.layers.slice()
        nextLayers[idx] = trimmed
        applyUrlFillLayerSlots(slots, idx, model.layers.length, options?.urlFillDefaults)
        return {
          model: {
            layers: nextLayers,
            visible: model.visible,
            layerIds: model.layerIds,
          },
          slots,
        }
      }

      return null
    })
  }

  commitBackgroundImageRef.current = commitBackgroundImage

  const clearLayer = (layerIndex: number) => {
    applyBackgroundLayerMutation(({ model, slots }) => {
      if (layerIndex < 0 || layerIndex >= model.layers.length) return null
      const newLayers = model.layers.filter((_, j) => j !== layerIndex)
      const newVisible = model.visible.filter((_, j) => j !== layerIndex)
      const newIds = model.layerIds.filter((_, j) => j !== layerIndex)
      if (newLayers.length === 0) return emptyBackgroundLayerState()
      return {
        model: {
          layers: newLayers,
          visible: newVisible,
          layerIds: newIds,
        },
        slots: removeSlotsAtLayer(slots, layerIndex),
      }
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
    applyBackgroundLayerMutation(({ model, slots }) => {
      if (layerIndex < 0 || layerIndex >= model.visible.length) return null
      const nextVisible = model.visible.slice()
      nextVisible[layerIndex] = !nextVisible[layerIndex]
      return {
        model: {
          ...model,
          visible: nextVisible,
        },
        slots,
      }
    })
  }

  const onLayersDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    applyBackgroundLayerMutation(({ model, slots }) => {
      const oldIndex = model.layerIds.indexOf(String(active.id))
      const newIndex = model.layerIds.indexOf(String(over.id))
      if (oldIndex < 0 || newIndex < 0) return null
      return {
        model: {
          layers: arrayMove(model.layers, oldIndex, newIndex),
          visible: arrayMove(model.visible, oldIndex, newIndex),
          layerIds: arrayMove(model.layerIds, oldIndex, newIndex),
        },
        slots: reorderSlotsAllLayers(slots, oldIndex, newIndex),
      }
    })
    closeImageGradientMenu()
  }

  const commitCommaLayer = (
    key: "backgroundSize" | "backgroundPosition" | "backgroundRepeat" | "backgroundAttachment",
    next: string | undefined,
    filler: string,
  ) => {
    const target = imageGradientMenuRef.current?.target
    if (target?.kind === "add") return
    if (target?.kind !== "layer") return
    const idx = target.index
    applyBackgroundLayerMutation(({ model, slots }) => {
      if (idx < 0 || idx >= model.layers.length) return null
      replaceSlotInLayer(slots, key, model.layers.length, idx, next, filler)
      return { model, slots }
    })
  }

  const commitBackgroundSize = (next: string | undefined) =>
    commitCommaLayer("backgroundSize", next, "auto")

  const commitBackgroundPosition = (next: string | undefined) =>
    commitCommaLayer("backgroundPosition", next, "0px 0px")

  const commitBackgroundRepeat = (next: string | undefined) =>
    commitCommaLayer("backgroundRepeat", next, "repeat")

  const commitBackgroundAttachment = (next: string | undefined) =>
    commitCommaLayer("backgroundAttachment", next, "scroll")

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
            withVariables
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
