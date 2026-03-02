import { Box, IconButton } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { AddIcon } from "../../../../icons/AddIcon.tsx"
import { NavigationIcon } from "../../../../icons/NavigationIcon.tsx"
import { AddMenu } from "./components/AddMenu"
import { NavigationMenu } from "./components/NavigationMenu"

type ActiveMenu = "add" | "navigation" | null

export const BuilderLeftPanel = () => {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!activeMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (barRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setActiveMenu(null)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeMenu])

  const toggleMenu = (menu: ActiveMenu) => {
    setActiveMenu((current) => (current === menu ? null : menu))
  }

  const handleCloseMenu = () => {
    setActiveMenu(null)
  }

  const isAddActive = activeMenu === "add"
  const isNavigationActive = activeMenu === "navigation"

  return (
    <Box
      ref={barRef}
      sx={{
        width: 37,
        borderRight: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "8px",
        gap: "8px",
        position: "relative",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <IconButton
        size="small"
        onClick={() => toggleMenu("add")}
        sx={{
          width: 28,
          height: 28,
          borderRadius: "6px",
          padding: 0,
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        <AddIcon
          height={18}
          width={18}
          fill={isAddActive ? COLORS.purple400 : COLORS.gray500}
        />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => toggleMenu("navigation")}
        sx={{
          width: 28,
          height: 28,
          borderRadius: "6px",
          padding: 0,
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        <NavigationIcon
          size={18}
          fill={isNavigationActive ? COLORS.purple400 : COLORS.gray500}
        />
      </IconButton>

      {activeMenu && (
        <Box
          ref={menuRef}
          sx={{
            position: "absolute",
            left: 37,
            top: 0,
            bottom: 0,
            display: "flex",
            zIndex: (theme) => theme.zIndex.drawer + 2,
            pointerEvents: "auto",
          }}
        >
          {activeMenu === "add" ? (
            <AddMenu onClose={handleCloseMenu} />
          ) : (
            <NavigationMenu />
          )}
        </Box>
      )}
    </Box>
  )
}
