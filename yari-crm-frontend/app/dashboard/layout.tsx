import "./globals.css";

export const metadata = {
  title: "Yari Taft CRM",
  description: "Sistema de Gestión Académica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}