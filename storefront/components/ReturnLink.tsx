'use client';

import React, { useState } from 'react';
import ReturnModal from './ReturnModal';

export const ReturnLink = () => {
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    return (
        <>
            <button 
                onClick={(e) => { e.preventDefault(); setIsReturnModalOpen(true); }}
                className="hover:underline transition-colors text-left"
            >
                Return Order
            </button>
            <ReturnModal 
                isOpen={isReturnModalOpen} 
                onClose={() => setIsReturnModalOpen(false)} 
            />
        </>
    );
};
