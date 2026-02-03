'use client';

import { useEffect, useState } from 'react';
import { rolesAPI } from '@/lib/api';
import { PERMISSION_GROUPS } from '@/constants/permissions'; // I need to create this file in admin too

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const response = await rolesAPI.getAll();
            setRoles(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleEdit = (role: any) => {
        setCurrentRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || [],
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentRole(null);
        setFormData({
            name: '',
            description: '',
            permissions: [],
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentRole) {
                await rolesAPI.update(currentRole.id, formData);
            } else {
                await rolesAPI.create(formData);
            }
            setIsModalOpen(false);
            loadRoles();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save role');
        }
    };

    const handleDelete = async (roleId: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await rolesAPI.delete(roleId);
            loadRoles();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete role');
        }
    };

    const togglePermission = (permission: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    if (loading) return <div className="p-8">Loading roles...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Role Management</h1>
                    <p className="text-gray-500">Define roles and granular permissions</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
                >
                    + Create Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">{role.name}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(role)} className="text-blue-500 hover:text-blue-600">Edit</button>
                                <button onClick={() => handleDelete(role.id)} className="text-red-500 hover:text-red-600">Delete</button>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">{role.description || 'No description provided.'}</p>
                        <div className="text-xs text-gray-400">
                            {role.permissions?.length || 0} permissions assigned
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            {role._count?.users || 0} users assigned
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl p-8 my-8 shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                            {currentRole ? 'Edit Role' : 'Create Role'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Role Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Inventory Manager"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief purpose of this role"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-b pb-2 dark:border-gray-700">Permissions Matrix</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {PERMISSION_GROUPS.map((group) => (
                                        <div key={group.name} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-primary mb-3">{group.name}</h4>
                                            <div className="space-y-3">
                                                {group.permissions.map((perm) => (
                                                    <label key={perm.key} className="flex items-center gap-3 group cursor-pointer">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.permissions.includes(perm.key)}
                                                                onChange={() => togglePermission(perm.key)}
                                                                className="peer hidden"
                                                            />
                                                            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                                                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-1 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                                <path d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition">
                                                            {perm.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
                                >
                                    {currentRole ? 'Update Changes' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
