import React from 'react';

export default function ReturnPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                    <h1 className="text-4xl font-black text-gray-900 mb-8">Return Policy</h1>
                    
                    <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
                        <p>
                            At Leewaa, we strive to ensure that our customers are completely satisfied with their purchases. If you are not entirely happy with your product, we are here to help.
                        </p>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Returns</h2>
                        <p>
                            You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.
                        </p>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Refunds</h2>
                        <p>
                            Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
                        </p>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Shipping</h2>
                        <p>
                            You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
                        </p>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Contact Us</h2>
                        <p>
                            If you have any questions on how to return your item to us, please contact us at hello@leewaa.in.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
