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
            reportHeader.style.display = 'flex';
        }

        const opt = {
            margin: 10,
            filename: `Finance-Report-${period}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        // Dynamically import html2pdf only in the browser
        const html2pdf = (await import('html2pdf.js')).default;

        try {
            await html2pdf().set(opt).from(element).save();
        } finally {
            // Hide the report header again after PDF is generated
            if (reportHeader) {
                reportHeader.style.display = 'none';
            }
        }
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
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Finance & Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400">Analyze sales performance and customer trends</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
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
                        margin: 10mm;
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
                        padding: 0 !important;
                    }

                    .report-content {
                        padding: 0 !important;
                    }
                    
                    /* Professional report header */
                    .report-header {
                        display: flex !important;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #1a1a1a;
                    }
                    
                    /* Remove shadows and adjust cards */
                    .shadow-md,
                    .shadow-lg,
                    .shadow-xl {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    
                    .bg-white { 
                        background: white !important; 
                    }

                    .grid {
                        display: grid !important;
                        gap: 1rem !important;
                    }

                    .rounded-xl, .rounded-2xl {
                        border-radius: 8px !important;
                    }

                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }

                    th {
                        background-color: #f8fafc !important;
                        color: #1a202c !important;
                    }
                }
                
                .report-header { 
                    display: none; 
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 1.5rem;
                    margin-bottom: 2rem;
                }
            `}</style>

            <div className="report-content p-4 bg-white dark:bg-gray-900 rounded-xl">
                {/* PDF/PRINT HEADER */}
                <div className="report-header">
                    <div className="flex items-center gap-4">
                        <img src="/images/Leewa_logo_web.png" alt="Leewaa Logo" className="h-16 object-contain" />
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">FINANCIAL REPORT</h1>
                            <p className="text-sm text-gray-500 font-medium">LEEWAA E-COMMERCE PRIVATE LIMITED</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Report Period</p>
                        <p className="text-lg font-bold text-primary capitalize">{period.toLowerCase()}</p>
                        <p className="text-xs text-gray-500 font-medium">{formatDate(salesData.startDate)} - {formatDate(salesData.endDate)}</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{formatPrice(salesData.totalSales)}</h2>
                        <div className="mt-2 text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full inline-block uppercase">
                            Incl. GST
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">GST Collected</p>
                        <h2 className="text-3xl font-black text-primary">{formatPrice(salesData.totalTax)}</h2>
                        <div className="mt-2 text-[10px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full inline-block uppercase">
                            18% Rate
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Taxable Revenue</p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{formatPrice(salesData.totalTaxable)}</h2>
                        <div className="mt-2 text-[10px] text-purple-600 font-bold bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full inline-block uppercase">
                            Net Sales
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Order Volume</p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{salesData.orderCount}</h2>
                        <div className="mt-2 text-[10px] text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full inline-block uppercase">
                            Transactions
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Payment Method Table */}
                    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Payment Method Analysis</h3>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Method Name</th>
                                    <th className="px-6 py-4">Total Amount</th>
                                    <th className="px-6 py-4">Market Share (%)</th>
                                    <th className="px-6 py-4 text-right">Visual Scale</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {Object.entries(salesData.paymentStats).map(([method, amount]: [any, any]) => (
                                    <tr key={method} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{method}</td>
                                        <td className="px-6 py-4 font-black text-primary">{formatPrice(amount)}</td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{((amount / salesData.totalSales) * 100).toFixed(1)}%</td>
                                        <td className="px-6 py-4 w-48">
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${Math.min(100, (amount / salesData.totalSales) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {Object.keys(salesData.paymentStats).length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No transactional data available for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Top Customers Table */}
                    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Top Performing Customers</h3>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Customer Info</th>
                                    <th className="px-6 py-4 text-center">Orders</th>
                                    <th className="px-6 py-4 text-right">Lifetime Value (LTV)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {customerData.topCustomers.map((customer: any) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-black text-gray-500 uppercase border border-gray-200 dark:border-gray-600">
                                                    {customer.name.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-gray-400">{customer.orderCount}</td>
                                        <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">{formatPrice(customer.totalSpent)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Customer Base Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-primary p-8 rounded-xl text-white shadow-lg relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-primary-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-opacity-80">Market Analytics</p>
                                <h4 className="text-lg font-bold">Total Customer Base</h4>
                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-5xl font-black">{customerData.totalCustomers}</span>
                                    <span className="text-sm font-medium text-primary-100">Registered Users</span>
                                </div>
                            </div>
                            <div className="absolute right-[-10%] bottom-[-20%] text-9xl font-black text-white opacity-5 select-none pointer-events-none group-hover:rotate-6 transition-transform">USER</div>
                        </div>

                        <div className="bg-gray-900 dark:bg-black p-8 rounded-xl text-white shadow-lg border border-gray-800 flex flex-col justify-between">
                            <div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Efficiency Ratio</p>
                                <h4 className="text-lg font-bold">Active Conversion</h4>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">
                                    {((customerData.activeCustomers / customerData.totalCustomers) * 100).toFixed(1)}%
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white">{customerData.activeCustomers}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Buyers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER FOR PRINT */}
                <div className="mt-12 pt-8 border-t border-gray-100 text-center hidden print:block">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Confidential Financial Document • Leewaa E-Commerce Pvt Ltd</p>
                    <p className="text-[8px] text-gray-300 mt-2 italic">Generated on {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
