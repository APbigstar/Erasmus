import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Reblium",
  description: "Reblium Avatar Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="main-content">{children}</div>
      </body>
    </html>
  );
}
