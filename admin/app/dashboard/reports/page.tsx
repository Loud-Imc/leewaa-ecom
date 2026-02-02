'use client';

import { useEffect, useState } from 'react';
import { reportsAPI } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function ReportsPage() {
    const [salesData, setSalesData] = useState<any>(null);
    const [customerData, setCustomerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('MONTHLY');

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [salesResponse, customerResponse] = await Promise.all([
                reportsAPI.getSales(period),
                reportsAPI.getCustomers()
            ]);
            setSalesData(salesResponse.data);
            setCustomerData(customerResponse.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const element = document.querySelector('.report-content') as HTMLElement;
        const reportHeader = document.querySelector('.report-header') as HTMLElement;
        if (!element) return;

        // Temporarily show the report header for PDF generation
        if (reportHeader) {
            reportHeader.style.display = 'block';
        }

        const opt = {
            margin: 10,
            filename: `Finance-Report-${period}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        // Dynamically import html2pdf only in the browser
        const html2pdf = (await import('html2pdf.js')).default;
        html2pdf().set(opt).from(element).save().then(() => {
            // Hide the report header again after PDF is generated
            if (reportHeader) {
                reportHeader.style.display = 'none';
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print-hide">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Finance & Reports</h1>
                    <p className="text-gray-600">Analyze sales performance and customer trends</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                    </select>
                    <button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2 shadow-md"
                    >
                        <span>🖨️</span> Print Report
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 15mm;
                        size: A4;
                    }
                    
                    /* Hide all admin UI */
                    .print-hide,
                    aside,
                    nav,
                    header,
                    select,
                    button,
                    .print\\:hidden,
                    [class*="print:hidden"] {
                        display: none !important;
                    }
                    
                    /* Reset body and main container */
                    body,
                    html {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    
                    .max-w-6xl { 
                        max-width: 100% !important; 
                        padding: 20px !important;
                    }
                    
                    /* Professional report header */
                    .report-header {
                        display: block !important;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #2D3748;
                    }
                    
                    .report-header h1 {
                        font-size: 24pt !important;
                        color: #1A202C !important;
                        font-weight: 800 !important;
                        margin: 0 0 10px 0 !important;
                    }
                    
                    .report-header p {
                        font-size: 11pt !important;
                        color: #4A5568 !important;
                    }
                    
                    /* Grid layouts should become blocks */
                    .grid { 
                        display: block !important; 
                    }
                    
                    .grid > div { 
                        margin-bottom: 20px !important; 
                        width: 100% !important;
                        page-break-inside: avoid;
                    }
                    
                    /* Remove shadows and adjust cards */
                    .shadow-md,
                    .shadow-lg,
                    .shadow-xl {
                        box-shadow: none !important;
                        border: 1px solid #E2E8F0 !important;
                    }
                    
                    .bg-white { 
                        background: white !important; 
                    }
                }
                
                .report-header { 
                    display: none; 
                }
            `}</style>

            <div className="report-content">
                <div className="report-header">
                    <h1 className="text-2xl font-bold">LEEWAA E-COMMERCE - FINANCIAL REPORT</h1>
                    <p className="text-gray-600">Period: {period} ({formatDate(salesData.startDate)} - {formatDate(salesData.endDate)})</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <p className="text-sm font-semibold text-gray-500 uppercase">Total Sales</p>
                        <h2 className="text-2xl font-bold text-gray-800 mt-1">{formatPrice(salesData.totalSales)}</h2>
                        <p className="text-xs text-gray-400 mt-2">Excludes cancelled orders</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-gray-500 uppercase">Order Count</p>
                        <h2 className="text-2xl font-bold text-gray-800 mt-1">{salesData.orderCount}</h2>
                        <p className="text-xs text-gray-400 mt-2">Total orders in this period</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                        <p className="text-sm font-semibold text-gray-500 uppercase">Avg. Order Value</p>
                        <h2 className="text-2xl font-bold text-gray-800 mt-1">{formatPrice(salesData.avgOrderValue)}</h2>
                        <p className="text-xs text-gray-400 mt-2">Revenue per order</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Method Breakdown */}
                    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Payment Method Breakdown</h3>
                        <div className="space-y-6">
                            {Object.entries(salesData.paymentStats).map(([method, amount]: [any, any]) => (
                                <div key={method}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-gray-700">{method}</span>
                                        <span className="font-bold text-gray-900">{formatPrice(amount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className="bg-primary h-3 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (amount / salesData.totalSales) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-right text-xs text-gray-500 mt-1">
                                        {((amount / salesData.totalSales) * 100).toFixed(1)}% of total revenue
                                    </p>
                                </div>
                            ))}
                            {Object.keys(salesData.paymentStats).length === 0 && (
                                <div className="py-12 text-center text-gray-500 italic">No sales recorded for this period.</div>
                            )}
                        </div>
                    </div>

                    {/* Top Customers */}
                    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Top Performing Customers</h3>
                        <div className="space-y-4">
                            {customerData.topCustomers.map((customer: any) => (
                                <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                                            {customer.name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{customer.name}</p>
                                            <p className="text-xs text-gray-500">{customer.orderCount} orders</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary">{formatPrice(customer.totalSpent)}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Lifetime Value</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Customer Overview Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-primary to-primary-700 p-8 rounded-2xl text-white shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-primary-100 text-sm font-semibold uppercase tracking-wider">Total User Base</p>
                                <h2 className="text-4xl font-black mt-2">{customerData.totalCustomers}</h2>
                                <p className="mt-4 text-primary-100 text-xs flex items-center gap-2">
                                    <span className="bg-white/20 p-1 rounded">👥</span> Total registered customers on the platform
                                </p>
                            </div>
                            <div className="hidden md:block text-6xl opacity-20 rotate-12">Users</div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border-2 border-primary/10 shadow-lg flex flex-col justify-center">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Conversion Ratio</p>
                                <h2 className="text-4xl font-black text-gray-800 mt-2">
                                    {((customerData.activeCustomers / customerData.totalCustomers) * 100).toFixed(1)}%
                                </h2>
                                <p className="text-gray-400 text-xs mt-2 italic">Active customers with delivered orders</p>
                            </div>
                            <div className="text-right">
                                <span className="text-primary font-black text-xl">{customerData.activeCustomers}</span>
                                <span className="text-gray-400 text-sm ml-1">Purchased</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
