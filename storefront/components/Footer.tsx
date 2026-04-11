import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    FaFacebookF,
    FaInstagram,
    FaYoutube,
    FaWhatsapp,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope
} from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-primary text-white pt-16 pb-8 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Logo & Description */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/images/Leewa_logo_web.png"
                                alt="Leewaa Logo"
                                width={160}
                                height={45}
                                className="brightness-0 invert"
                            />
                        </Link>
                        <p className="text-white text-sm leading-relaxed max-w-xs">
                            Leewaa water purifiers are based on RO technology, which combines
                            Reverse Osmosis (RO) with Ultraviolet (UV) or Ultrafiltration (UF)
                            in a multistage filtration process.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors text-white border border-white/20">
                                <FaFacebookF size={14} />
                            </a>
                            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors text-white border border-white/20">
                                <FaInstagram size={14} />
                            </a>
                            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors text-white border border-white/20">
                                <FaYoutube size={14} />
                            </a>
                            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors text-white border border-white/20">
                                <FaWhatsapp size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Our Products */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 relative inline-block">
                            Our Products
                            <span className="absolute -bottom-1 left-0 w-8 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-white/90">
                            {[
                                'Planet', 'Planet Plus', 'Planet Gold', 'Alpha',
                                'Alpha Gold', 'Alpha Plus', 'Beta Xtreme', 'Zeta',
                                'Zeta Gold', 'Zeta Plus', 'Copper RO Plus'
                            ].map((item) => (
                                <li key={item}>
                                    <Link href={`/products?search=${item}`} className="hover:underline transition-colors text-white">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 relative inline-block">
                            Company
                            <span className="absolute -bottom-1 left-0 w-8 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <ul className="space-y-4 text-sm text-white/90">
                            <li><Link href="/" className="hover:underline transition-colors">Home</Link></li>
                            <li><Link href="/about" className="hover:underline transition-colors">About</Link></li>
                            <li><Link href="/products" className="hover:underline transition-colors">Products</Link></li>
                            <li><Link href="/track-order" className="hover:underline transition-colors font-bold text-white">Track Order</Link></li>
                            <li><Link href="/faq" className="hover:underline transition-colors">Faq</Link></li>
                            <li><Link href="/contact" className="hover:underline transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 relative inline-block">
                            Contact Us
                            <span className="absolute -bottom-1 left-0 w-8 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <ul className="space-y-6 text-sm">
                            <li className="flex gap-4">
                                <div className="mt-1 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/10 text-white">
                                    <FaMapMarkerAlt size={16} />
                                </div>
                                <div className="text-white/90">
                                    <p className="font-bold text-white mb-1 uppercase text-xs tracking-wider">Head Office</p>
                                    <p className="leading-relaxed text-white">
                                        Leewaa Ventures LLP, Cherukunnu,<br />
                                        Othukkungal, Malappuram, 676 528
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/10 text-white">
                                    <FaPhoneAlt size={16} />
                                </div>
                                <div className="text-white/90">
                                    <p className="font-bold text-white mb-1 uppercase text-xs tracking-wider">Call Us</p>
                                    <p className="text-white">
                                        9526091000, 8943471000
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/10 text-white">
                                    <FaEnvelope size={16} />
                                </div>
                                <div className="text-white/90">
                                    <p className="font-bold text-white mb-1 uppercase text-xs tracking-wider">Email Us</p>
                                    <p className="text-white">
                                        hello@leewaa.in
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/70 font-medium">
                    <p>© 2026 - Leewaa Ventures LLP | All Rights Reserved</p>
                    <p>Designed & Developed by <a href="https://loudimc.com" target="_blank" className="text-white hover:underline transition-colors">Loudimc.com</a></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
