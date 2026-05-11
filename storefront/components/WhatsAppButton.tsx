'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
    const phoneNumber = '919526091000'; // Added 91 prefix for India
    const message = 'Hi Leewaa, I am interested in your water purifiers.';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-12 right-6 z-[9999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group flex items-center gap-2"
            aria-label="Chat on WhatsApp"
        >
            {/* <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-bold">
                Chat with us
            </span> */}
            <FaWhatsapp size={28} />

            {/* Pulsing effect */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 -z-10"></span>
        </a>
    );
};

export default WhatsAppButton;
