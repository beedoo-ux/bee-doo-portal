export const metadata = { title: 'bee-doo Kundenportal', description: 'Ihr persönlicher Bereich bei bee-doo' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="https://bee-doo-tools.vercel.app/favicon.ico" sizes="32x32" />
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/beedoo-ux/bee-doo-tools@main/assets/fonts/dm-sans-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/beedoo-ux/bee-doo-tools@main/assets/fonts/dm-sans-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face{font-family:'DM Sans';font-style:normal;font-weight:400;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/beedoo-ux/bee-doo-tools@main/assets/fonts/dm-sans-400.woff2') format('woff2')}
          @font-face{font-family:'DM Sans';font-style:normal;font-weight:500;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/beedoo-ux/bee-doo-tools@main/assets/fonts/dm-sans-500.woff2') format('woff2')}
          @font-face{font-family:'DM Sans';font-style:normal;font-weight:600;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/beedoo-ux/bee-doo-tools@main/assets/fonts/dm-sans-600.woff2') format('woff2')}
          @font-face{font-family:'DM Sans';font-style:normal;font-weight:700;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/beedoo-ux/bee-doo-tools@main/assets/fonts/dm-sans-700.woff2') format('woff2')}
          @font-face{font-family:'Space Grotesk';font-style:normal;font-weight:700;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/beedoo-ux/bee-doo-tools@main/assets/fonts/space-grotesk-700.woff2') format('woff2')}
          * { box-sizing: border-box; }
          body { margin: 0; background: #0a0a0a; font-family: 'DM Sans', system-ui, sans-serif; }
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
