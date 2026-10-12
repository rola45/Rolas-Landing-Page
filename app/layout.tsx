import type { Metadata } from "next";
import "./globals.css";
import "./landing-theme.css";

export const metadata: Metadata = {
  title: "RV Solutions | Rolando Victorio",
  description: "Desarrollo y soporte tecnológico.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: 'try{var t=localStorage.getItem("rv-solutions-theme");if(t==="dark")document.documentElement.dataset.theme="dark";var l=localStorage.getItem("rv-solutions-language");if(l==="en")document.documentElement.lang="en"}catch{}' }} /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
