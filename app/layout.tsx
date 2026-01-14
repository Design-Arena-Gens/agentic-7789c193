import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agente de Voz YouTube',
  description: 'Agente de voz especializado em YouTube',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
