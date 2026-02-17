import type { GetServerSidePropsContext } from "next"

export interface SiteConfig {
  pages: Record<string, PageConfig>
  metadata?: {
    title?: string
    description?: string
  }
}

export interface PageConfig {
  path: string
  components: ComponentNode[]
}

export interface ComponentNode {
  type: string
  props: Record<string, any>
  children?: ComponentNode[]
}

// Mock data for local testing
const MOCK_SITES: Record<string, SiteConfig> = {
  "localhost:3000": {
    pages: {
      index: {
        path: "/",
        components: [
          {
            type: "Block",
            props: {
              layout: "flex",
              flexDirection: "column",
              paddingTop: 40,
              paddingBottom: 40,
              backgroundColor: "#F5F5F5",
            },
            children: [
              {
                type: "Text",
                props: {
                  text: "Local test - localhost:3000",
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#2D2D2F",
                },
              },
            ],
          },
        ],
      },
    },
    metadata: {
      title: "Localhost Test Site",
      description: "Test site for localhost",
    },
  },
  "example.local:3000": {
    pages: {
      index: {
        path: "/",
        components: [
          {
            type: "Block",
            props: {
              layout: "flex",
              flexDirection: "column",
              paddingTop: 50,
              backgroundColor: "#E3F2FD",
            },
            children: [
              {
                type: "Text",
                props: {
                  text: "Example Site",
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#1976D2",
                },
              },
              {
                type: "LinkText",
                props: {
                  text: "Go to Google",
                  href: "https://google.com",
                  openInNewTab: true,
                },
              },
            ],
          },
        ],
      },
    },
    metadata: {
      title: "Example Site",
      description: "Example site",
    },
  },
}

function resolveMockConfig(domain: string): SiteConfig | null {
  return (
    MOCK_SITES[domain] ??
    MOCK_SITES[`${domain}:3000`] ??
    (domain.includes(":") ? MOCK_SITES[domain.split(":")[0]] ?? null : null)
  )
}

export async function getSiteConfig(
  domain: string,
): Promise<SiteConfig | null> {
  // For local testing use mocks
  if (process.env.NODE_ENV === "development" || !process.env.API_URL) {
    console.log(`[DEV] Using mock data for domain: ${domain}`)
    return resolveMockConfig(domain)
  }

  // In production request from Backend API
  try {
    const apiUrl = process.env.API_URL || "https://your-api.com"
    const response = await fetch(`${apiUrl}/v3/sites/${domain}/compiled-data`)

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching config for ${domain}:`, error)
    return null
  }
}
