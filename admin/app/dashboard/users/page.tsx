'use client';

import { useEffect, useState } from 'react';
import { usersAPI, rolesAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        phone: '',
        role: 'ADMIN',
        roleId: '',
    });

    useEffect(() => {
        loadData();
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            setCurrentUser(JSON.parse(adminUser));
        }
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                usersAPI.getAll(),
                rolesAPI.getAll()
            ]);
            setUsers(usersRes.data.data || []);
            setRoles(rolesRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data: any = { ...formData };
            // If no custom roleId, send null to clear it on backend
            if (!data.roleId) data.roleId = null;

            if (editingUser) {
                if (!data.password) delete data.password;
                console.log('📤 Updating user with data:', data);
                await usersAPI.update(editingUser.id, data);
            } else {
                console.log('📤 Creating user with data:', data);
                await usersAPI.create(data);
            }

            setIsModalOpen(false);
            setEditingUser(null);
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                password: '',
                phone: '',
                role: 'ADMIN',
                roleId: '',
            });
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            password: '',
            phone: user.phone || '',
            role: user.role,
            roleId: user.roleId || '',
        });
        console.log('📝 Editing user. Current Role Data:', { role: user.role, roleId: user.roleId, roleEntity: user.roleEntity });
        setIsModalOpen(true);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action will soft-delete the user.')) {
            return;
        }
        try {
            await usersAPI.delete(userId);
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };


    const filteredUsers = users.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">View and manage platform users and roles</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setFormData({
                                email: '',
                                firstName: '',
                                lastName: '',
                                password: '',
                                phone: '',
                                role: 'ADMIN',
                                roleId: '',
                            });
                            setIsModalOpen(true);
                        }}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        + Add User
                    </button>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-64"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">🔍</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rewards</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400 font-bold">
                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block w-fit ${user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                            {user.roleEntity && (
                                                <span className="text-[10px] font-bold text-primary uppercase">
                                                    🏷️ {user.roleEntity.name}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-white">
                                        ₹{user.rewardBalance || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/20 transition flex items-center gap-1"
                                                title="Edit User"
                                                disabled={user.role === 'SUPER_ADMIN' && user.id !== currentUser?.id}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center gap-1"
                                                title="Delete User"
                                                disabled={user.role === 'SUPER_ADMIN' || user.id === currentUser?.id}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <p>No users found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-6">{editingUser ? 'Edit User' : 'Add New User'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Password {editingUser && '(Leave blank to keep current)'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                                />
                            </div>

                            {(!editingUser || editingUser.role !== 'SUPER_ADMIN') && (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Assign Role</label>
                                    <select
                                        value={formData.roleId || formData.role}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (['CUSTOMER', 'ADMIN'].includes(val)) {
                                                setFormData({ ...formData, role: val, roleId: '' });
                                            } else {
                                                setFormData({ ...formData, role: 'ADMIN', roleId: val });
                                            }
                                        }}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition font-bold"
                                    >
                                        <optgroup label="System Roles (Basic Access)">
                                            <option value="CUSTOMER">Customer (Storefront Only)</option>
                                            <option value="ADMIN">Admin (Dashboard Only - No Tabs)</option>
                                        </optgroup>
                                        {roles.length > 0 && (
                                            <optgroup label="Custom Roles (Feature Access)">
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                    {!formData.roleId && formData.role === 'ADMIN' && (
                                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                            ⚠️ Warning: System Admin role does not have granular permissions.
                                            User will NOT see sidebar tabs unless you select a role from "Custom Roles" below.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg transition"
                                >
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
