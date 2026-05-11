import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import StoreInitializer from "@/components/StoreInitializer";
import ProgressBar from "@/components/ProgressBar";
import WhatsAppButton from "@/components/WhatsAppButton";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Leewaa - Water Filter E-commerce",
    description: "Your trusted water filter store",
};

// Force dynamic rendering for all pages to avoid static generation Suspense issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={rubik.className}>
                <Providers>
                    <ProgressBar />
                    <StoreInitializer />
                    <Header />
                    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        {children}
                    </main>
                    <WhatsAppButton />
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
