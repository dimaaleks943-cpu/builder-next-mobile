import type { AppProps } from "next/app"
import { useNavbarAnchorScroll } from "@/hooks/useNavbarAnchorScroll"
import "../styles/globals.css"

const AppShell = ({ Component, pageProps }: AppProps) => {
  useNavbarAnchorScroll()
  return <Component {...pageProps} />
}

export default function App(props: AppProps) {
  return <AppShell {...props} />
}
