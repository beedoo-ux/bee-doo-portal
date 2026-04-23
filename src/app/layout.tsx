export const metadata = { title: 'bee-doo Kundenportal', description: 'Ihr persönlicher Bereich bei bee-doo' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="https://bee-doo-tools.vercel.app/favicon.ico" sizes="32x32" />
        <link rel="preconnect" href="https://rsms.me" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; }
          :root { font-feature-settings: 'cv02','cv03','cv04','cv11','ss01','ss03'; }
          body { margin: 0; background: #F7F8FB; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0F172A; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
