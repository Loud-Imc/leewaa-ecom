'use client';

import React, { useState, useEffect } from 'react';
import {
    FaInfoCircle,
    FaTruck,
    FaTimesCircle,
    FaExclamationTriangle,
    FaUndo,
    FaPhoneAlt,
    FaEnvelope,
    FaShippingFast,
    FaMoneyBillWave,
    FaWhatsapp,
    FaChevronRight,
    FaCheckCircle,
    FaTimes
} from 'react-icons/fa';

export default function ReturnPolicyPage() {
    const [activeSection, setActiveSection] = useState('summary');

    const sections = [
        { id: 'summary', title: 'Quick Summary', icon: FaInfoCircle },
        { id: 'delivery', title: 'Order & Delivery', icon: FaTruck },
        { id: 'cancellation', title: 'Cancellation Policy', icon: FaTimesCircle },
        { id: 'transit-damage', title: 'Transit Damage / Defect', icon: FaExclamationTriangle },
        { id: 'return-policy', title: 'Return / Refund Policy', icon: FaUndo },
        { id: 'contact', title: 'Contact Support', icon: FaPhoneAlt },
        { id: 'logistics', title: 'Reverse Logistics', icon: FaShippingFast },
        { id: 'refund', title: 'Refund Timeline', icon: FaMoneyBillWave },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (const section of sections) {
                const el = document.getElementById(section.id);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white py-16 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(21,127,184,0.15),transparent_50%)]"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <span className="bg-primary-500/20 text-primary-200 border border-primary-500/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                        Company Policy
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black mt-4 tracking-tight">
                        Cancellation, Return & Refund Policy
                    </h1>
                    <p className="text-primary-200 mt-2 font-medium">
                        Leewaa Ventures LLP
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Nav */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 space-y-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase px-3 mb-2 tracking-wider">Table of Contents</p>
                            {sections.map((sec) => {
                                const Icon = sec.icon;
                                const isActive = activeSection === sec.id;
                                return (
                                    <button
                                        key={sec.id}
                                        onClick={() => scrollToSection(sec.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-left ${
                                            isActive
                                                ? 'bg-primary-50 text-primary-600 shadow-sm'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                                        <span>{sec.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="col-span-1 lg:col-span-3 space-y-8">
                        {/* Section A: Quick Summary */}
                        <div id="summary" className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                                    <FaInfoCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Section A</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Quick Summary (Simple)</h2>
                                </div>
                            </div>
                            <div className="bg-primary-50/50 border border-primary-100/50 rounded-2xl p-5 md:p-6 space-y-4 text-gray-700">
                                <p className="font-medium text-primary-950">
                                    We want to make our policy simple and transparent. Here is a quick overview:
                                </p>
                                <ul className="space-y-3.5">
                                    <li className="flex items-start gap-3">
                                        <FaCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span><strong>Order Confirmation:</strong> After full payment, your order is confirmed and will be delivered.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <FaCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span><strong>Cancellation:</strong> Allowed only if delivery is not completed within 15 days from your payment date.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <FaCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span><strong>Conditional Return:</strong> Once delivered, products are covered under a 7-day conditional return policy (outlined in Section E).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <FaCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span><strong>Damaged/Defective Goods:</strong> If your product arrives damaged or defective, contact Leewaa Customer Care immediately. Our service team will inspect and decide on repair or replacement.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <FaCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span><strong>No General Refunds:</strong> Refunds are not offered except where legally applicable.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Section B: Order Confirmation & Delivery */}
                        <div id="delivery" className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                                    <FaTruck className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Section B</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Order Confirmation & Delivery</h2>
                                </div>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Your order becomes final and confirmed once full payment is received by the company.
                                </p>
                                <p>
                                    Leewaa Ventures LLP will process and deliver the product to the address shared by you at checkout.
                                </p>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                                    <FaInfoCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-600">
                                        Delivery is normally completed within <strong>15 (fifteen) days</strong> from the date of full payment. Delivery time may vary due to location, logistics, and product availability, but we will make reasonable efforts to deliver within this timeline.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section C: Cancellation Policy */}
                        <div id="cancellation" className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                                    <FaTimesCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Section C</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Cancellation Policy</h2>
                                </div>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Cancellation is not allowed after payment as a standard rule (please refer to Clause E).
                                </p>
                                
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                                    <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-1">
                                        <FaInfoCircle /> Only Exception
                                    </h4>
                                    <p className="text-sm text-amber-800">
                                        You may cancel only if the product is <strong>NOT</strong> delivered within 15 days from the payment date (subject to force majeure events like natural disasters, strikes, or regional lockdowns etc.).
                                    </p>
                                </div>

                                <p className="font-semibold text-gray-800 mt-4">
                                    To request cancellation under this exception, you must contact Customer Care or email us with:
                                </p>
                                <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                                    <li>Order ID</li>
                                    <li>Transaction / payment reference</li>
                                    <li>Registered phone number</li>
                                </ul>
                                <p className="text-sm text-red-600 font-medium mt-2">
                                    No cancellation will be accepted for any other reason.
                                </p>
                            </div>
                        </div>

                        {/* Section D: Transit Damage / Defect Policy */}
                        <div id="transit-damage" className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                                    <FaExclamationTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Section D</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Transit Damage / Defect Policy (After Delivery)</h2>
                                </div>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <div className="border border-red-100 bg-red-50/30 p-5 rounded-2xl space-y-3">
                                    <h4 className="font-bold text-red-900 flex items-center gap-2">
                                        <FaExclamationTriangle className="text-red-500" /> Immediate Actions Required:
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-red-800">
                                        <li>Please check the outer box/packaging at the time of delivery. If the package appears torn, crushed, wet, or tampered with, inform delivery personnel and contact Leewaa Customer Care within <strong>24 hours</strong> of delivery.</li>
                                        <li>Customers must provide a <strong>continuous unboxing video</strong> and clear high-resolution photos within <strong>24 hours</strong> of delivery or Leewaa’s technician visit for installation to claim transit damage.</li>
                                    </ul>
                                </div>

                                <p>
                                    If the product is received damaged, non-functional, or defective, you must contact Leewaa Customer Care immediately upon delivery.
                                </p>

                                <p>
                                    Leewaa’s authorized service centre will inspect the product and decide whether the issue will be resolved through:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center font-semibold text-gray-800">
                                        Repair
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center font-semibold text-gray-800">
                                        Replacement
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 italic">
                                    Resolution will be based on warranty terms and technical evaluation. Leewaa’s decision on repair vs. replacement will be final.
                                </p>
                            </div>
                        </div>

                        {/* Section E: Return / Refund Policy */}
                        <div id="return-policy" className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                                    <FaUndo className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Section E</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Return / Refund Policy</h2>
                                </div>
                            </div>
                            <div className="space-y-6 text-gray-600 leading-relaxed">
                                <div className="bg-primary-50/40 p-4 rounded-xl border border-primary-100 text-gray-800">
                                    Returns are acceptable with prior approval within <strong>7 days</strong> from the date of delivery or installation (where installation is done by a Leewaa Technician).
                                </div>

                                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                                    <FaWhatsapp className="w-6 h-6 text-green-500 flex-shrink-0" />
                                    <p className="text-sm text-green-800 font-medium">
                                        <strong>For Return:</strong> Call the company and obtain confirmation through WhatsApp before returning the product.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Returns are acceptable ONLY in cases of:
                                    </h4>
                                    <ul className="space-y-2 pl-4">
                                        <li className="flex items-start gap-2.5 text-sm">
                                            <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Failure to operate as per written product specifications in the company brochure and/or marketing campaigns/materials.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5 text-sm">
                                            <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Verified manufacturing defects.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5 text-sm">
                                            <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Confirmed transit damage that has been evaluated and verified by Leewaa’s Technical team.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        Returns/refunds are NOT allowed for any other reason, including but not limited to:
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-500">
                                        <div className="flex items-start gap-2">
                                            <FaTimes className="w-3.5 h-3.5 text-red-500 mt-1 flex-shrink-0" />
                                            <span>Products installed by non-authorized technicians or damaged due to improper handling by the customer.</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FaTimes className="w-3.5 h-3.5 text-red-500 mt-1 flex-shrink-0" />
                                            <span>Change of mind</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FaTimes className="w-3.5 h-3.5 text-red-500 mt-1 flex-shrink-0" />
                                            <span>Product not required anymore</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FaTimes className="w-3.5 h-3.5 text-red-500 mt-1 flex-shrink-0" />
                                            <span>Wrong order placed by customer</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FaTimes className="w-3.5 h-3.5 text-red-500 mt-1 flex-shrink-0" />
                                            <span>Performance/feature subjective personal dissatisfaction</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FaTimes className="w-3.5 h-3.5 text-red-500 mt-1 flex-shrink-0" />
                                            <span>Compatibility issues with local water/electricity</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FaTimes className="w-3.5 h-3.5 text-red-500 mt-1 flex-shrink-0" />
                                            <span>Cosmetic expectations</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FaTimes className="w-3.5 h-3.5 text-red-500 mt-1 flex-shrink-0" />
                                            <span>Any issue that is repairable under warranty</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section F: Contact for Cancellation / Damage / Defect / Return */}
                        <div id="contact" className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                                    <FaPhoneAlt className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Section F</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Contact Support</h2>
                                </div>
                            </div>
                            <div className="space-y-6 text-gray-600">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a href="tel:+918943371000" className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/20 transition-all group">
                                        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                            <FaPhoneAlt className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">Customer Care</p>
                                            <p className="text-sm font-bold text-gray-800">+91 8943 371000</p>
                                        </div>
                                    </a>

                                    <a href="mailto:service@Leewaa.in" className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/20 transition-all group">
                                        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                            <FaEnvelope className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">Email Address</p>
                                            <p className="text-sm font-bold text-gray-800">service@Leewaa.in</p>
                                        </div>
                                    </a>
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                                    <p className="text-sm font-bold text-gray-800 mb-2">When reaching out, please share:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <FaChevronRight className="text-primary-500 w-3 h-3 flex-shrink-0" />
                                            <span>Ordered Platform</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaChevronRight className="text-primary-500 w-3 h-3 flex-shrink-0" />
                                            <span>Order ID</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaChevronRight className="text-primary-500 w-3 h-3 flex-shrink-0" />
                                            <span>Transaction Reference</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaChevronRight className="text-primary-500 w-3 h-3 flex-shrink-0" />
                                            <span>Phone Number</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaChevronRight className="text-primary-500 w-3 h-3 flex-shrink-0" />
                                            <span>Delivery Address</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaChevronRight className="text-primary-500 w-3 h-3 flex-shrink-0" />
                                            <span>Issue Details</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section G: Reverse Logistics & Shipping Costs */}
                        <div id="logistics" className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                                    <FaShippingFast className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Section G</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Reverse Logistics & Shipping Costs</h2>
                                </div>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                                    <strong>Important Packaging Requirement:</strong> When returning, the original packaging, boxes, manuals, accessories, freebies, and invoices must be completely intact.
                                </div>
                                <p>
                                    Leewaa’s logistics partner will contact the customer to arrange a pickup, or we may request that you dispatch the product back to us.
                                </p>
                                <p>
                                    If you are asked to dispatch the product, the carrier charges (as per the carrier bill) will be refunded to you by Leewaa.
                                </p>
                            </div>
                        </div>

                        {/* Section H: Refund Process */}
                        <div id="refund" className="scroll-mt-24 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                                    <FaMoneyBillWave className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Section H</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Refund Timeline & Process</h2>
                                </div>
                            </div>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Once a refund is approved (only under Policy C or E), the full order value will be refunded.
                                </p>
                                <p className="font-semibold text-gray-800">
                                    Refund Methods & Conditions:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Refunds are made only to the original payment method used at checkout.</li>
                                    <li>No cash or cheque refunds are possible under any circumstances.</li>
                                    <li>Payment gateway charges, if any, shall be deducted from the refund amount.</li>
                                </ul>
                                <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl mt-4">
                                    <p className="text-sm text-primary-900 font-medium">
                                        <strong>Refund Timeline:</strong> Refunds will be initiated within <strong>5–7 business days</strong> after receipt of the product and completion of the inspection and approval of the returned item.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
