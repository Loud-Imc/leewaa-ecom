import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Leewaa Admin Panel",
    description: "Admin management panel for Leewaa E-commerce",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
