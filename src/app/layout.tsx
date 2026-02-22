export const metadata = { title: 'bee-doo Kundenportal', description: 'Ihr persönlicher Bereich bei bee-doo' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
