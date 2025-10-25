import './globals.css'

export const metadata = {
  title: 'AI Image Upscaler',
  description: 'Enhance images with AI-powered upscaling',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
