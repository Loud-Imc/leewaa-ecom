import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import Script from "next/script";
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
            <head>
                <Script
                    id="meta-pixel"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1067271849616022');
fbq('track', 'PageView');
                        `,
                    }}
                />
                <noscript>
                    <img
                        height="1"
                        width="1"
                        style={{ display: "none" }}
                        src="https://www.facebook.com/tr?id=1067271849616022&ev=PageView&noscript=1"
                        alt=""
                    />
                </noscript>
            </head>
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
