'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function ReturnsPage() {
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
    const [rejectInput, setRejectInput] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
    const [approveInput, setApproveInput] = useState('');
    const [isApproving, setIsApproving] = useState(false);

    const [receiveModalOpen, setReceiveModalOpen] = useState(false);
    const [receiveTargetId, setReceiveTargetId] = useState<string | null>(null);
    const [isReceiving, setIsReceiving] = useState(false);

    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchReturns = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
            const res = await axios.get(`${API_URL}/returns`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReturns(res.data);
        } catch (error) {
            console.error('Failed to fetch returns', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const handleApproveClick = (id: string) => {
        setApproveTargetId(id);
        setApproveInput('');
        setApproveModalOpen(true);
    };

    const confirmApprove = async () => {
        if (approveInput !== 'APPROVE') return;
        if (!approveTargetId) return;

        setIsApproving(true);
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
            await axios.patch(`${API_URL}/returns/${approveTargetId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReturns(); // Refresh the list
            setApproveModalOpen(false);
        } catch (error) {
            console.error('Failed to approve return', error);
            alert('Error approving return');
        } finally {
            setIsApproving(false);
        }
    };

    const handleRejectClick = (id: string) => {
        setRejectTargetId(id);
        setRejectInput('');
        setRejectModalOpen(true);
    };

    const confirmReject = async () => {
        if (rejectInput !== 'REJECT') return;
        if (!rejectTargetId) return;
        
        setIsRejecting(true);
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
            await axios.patch(`${API_URL}/returns/${rejectTargetId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReturns(); // Refresh the list
            setRejectModalOpen(false);
        } catch (error) {
            console.error('Failed to reject return', error);
            alert('Error rejecting return');
        } finally {
            setIsRejecting(false);
        }
    };

    const handleReceiveClick = (id: string) => {
        setReceiveTargetId(id);
        setReceiveModalOpen(true);
    };

    const confirmReceive = async () => {
        if (!receiveTargetId) return;

        setIsReceiving(true);
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
            await axios.patch(`${API_URL}/returns/${receiveTargetId}/receive`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReturns(); // Refresh the list
            setReceiveModalOpen(false);
        } catch (error) {
            console.error('Failed to mark return as received', error);
            alert('Error marking return as received');
        } finally {
            setIsReceiving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading returns...</div>;
    }

    const filteredReturns = returns.filter((ret) => {
        if (statusFilter === 'ALL') return true;
        return ret.status === statusFilter;
    });

    return (
        <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Return Requests</h1>
                
                {/* Filters */}
                <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow p-1 border border-gray-200 dark:border-gray-700">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'RECEIVED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                statusFilter === status
                                    ? 'bg-primary text-white shadow'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-transparent dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredReturns.map((ret) => (
                            <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/dashboard/orders/${ret.order?.id}?from=returns`} className="font-bold text-primary dark:text-primary-400 hover:underline">
                                        #{ret.order?.orderNumber}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{ret.order?.address?.fullName || ret.user?.firstName || 'N/A'}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{ret.phoneNumber}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="max-w-xs truncate" title={ret.reason}>{ret.reason}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(ret.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        ret.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        ret.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                        ret.status === 'RECEIVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                        {ret.status === 'RECEIVED' ? 'RECEIVED & RESTOCKED' : ret.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                                    <Link 
                                        href={`/dashboard/orders/${ret.order?.id}?from=returns`}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md font-bold transition-colors"
                                    >
                                        View Order
                                    </Link>
                                    {ret.status === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={() => handleApproveClick(ret.id)}
                                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md font-bold transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleRejectClick(ret.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-md font-bold transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {ret.status === 'APPROVED' && (
                                        <button 
                                            onClick={() => handleReceiveClick(ret.id)}
                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-md font-bold transition-colors"
                                        >
                                            Mark as Received
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredReturns.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No return requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Approve Confirmation Modal */}
            {approveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Approve Return Request?</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            This will approve the return and mark the order as Refunded. An email will be sent to the customer. To confirm, type <span className="font-bold text-green-600 dark:text-green-400 select-all">APPROVE</span> below.
                        </p>
                        <input
                            type="text"
                            value={approveInput}
                            onChange={(e) => setApproveInput(e.target.value.toUpperCase())}
                            placeholder="Type APPROVE to confirm"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:green-red-500 focus:border-green-500 text-center font-bold tracking-widest uppercase mb-6 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setApproveModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition"
                                disabled={isApproving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApprove}
                                disabled={approveInput !== 'APPROVE' || isApproving}
                                className={`flex-1 px-4 py-3 font-bold rounded-xl transition ${
                                    approveInput === 'APPROVE' && !isApproving
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30'
                                        : 'bg-green-300 text-white cursor-not-allowed'
                                }`}
                            >
                                {isApproving ? 'Approving...' : 'Approve Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Reject Return Request?</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            This action cannot be undone. To confirm, please type <span className="font-bold text-red-600 dark:text-red-400 select-all">REJECT</span> below.
                        </p>
                        <input
                            type="text"
                            value={rejectInput}
                            onChange={(e) => setRejectInput(e.target.value.toUpperCase())}
                            placeholder="Type REJECT to confirm"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-bold tracking-widest uppercase mb-6 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition"
                                disabled={isRejecting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={rejectInput !== 'REJECT' || isRejecting}
                                className={`flex-1 px-4 py-3 font-bold rounded-xl transition ${
                                    rejectInput === 'REJECT' && !isRejecting
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                                        : 'bg-red-300 text-white cursor-not-allowed'
                                }`}
                            >
                                {isRejecting ? 'Rejecting...' : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receive Confirmation Modal */}
            {receiveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Confirm Receipt & Restock</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            This will mark the return as <strong className="text-blue-600 dark:text-blue-400">RECEIVED</strong> and automatically add the returned products back into your inventory. Are you sure you want to proceed?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setReceiveModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition"
                                disabled={isReceiving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReceive}
                                disabled={isReceiving}
                                className="flex-1 px-4 py-3 font-bold rounded-xl transition bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                            >
                                {isReceiving ? 'Processing...' : 'Confirm Receipt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
