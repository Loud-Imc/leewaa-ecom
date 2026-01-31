import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Header from "@/components/Header";
import { Providers } from "@/components/Providers";
import StoreInitializer from "@/components/StoreInitializer";
import ProgressBar from "@/components/ProgressBar";

const inter = Inter({ subsets: ["latin"] });

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
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <ProgressBar />
                    <StoreInitializer />
                    <Header />
                    <main className="min-h-screen bg-gray-50">
                        {children}
                    </main>
                    <footer className="bg-primary text-white py-12 mt-12 border-t border-white/10">
                        <div className="container mx-auto px-4 text-center">
                            <div className="mb-6 flex justify-center">
                                <Image
                                    src="/images/Leewa_logo_web.png"
                                    alt="Leewaa Logo"
                                    width={180}
                                    height={50}
                                    className="brightness-0 invert opacity-80"
                                />
                            </div>
                            <p className="text-gray-400 text-sm">&copy; 2026 Leewaa. All rights reserved.</p>
                        </div>
                    </footer>
                </Providers>
            </body>
        </html>
    );
}
