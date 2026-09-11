import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PhoneStage } from "@/components/chrome/phone";
import { AppErrorBoundary } from "@/components/chrome/notice";
import appCss from "../styles.css?url";

import { APP_BLURB, APP_NAME } from "@/lib/brand";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0A0A0A" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      {
        name: "description",
        content: `${APP_NAME} — ${APP_BLURB}`,
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html: `@font-face{font-family:"Inter";font-style:normal;font-display:swap;font-weight:100 900;src:url("https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-wght-normal.woff2") format("woff2-variations");}@font-face{font-family:"Fraunces";font-style:normal;font-display:swap;font-weight:100 900;src:url("https://cdn.jsdelivr.net/fontsource/fonts/fraunces:vf@latest/latin-wght-normal.woff2") format("woff2-variations");}@font-face{font-family:"Geist Mono";font-style:normal;font-display:swap;font-weight:100 900;src:url("https://cdn.jsdelivr.net/fontsource/fonts/geist-mono:vf@latest/latin-wght-normal.woff2") format("woff2-variations");}`,
          }}
        />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <AppErrorBoundary>
            <PhoneStage>
              <Outlet />
            </PhoneStage>
          </AppErrorBoundary>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
