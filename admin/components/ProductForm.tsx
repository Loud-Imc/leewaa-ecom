'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import ImageCropperModal from './ImageCropperModal';

interface ProductFormProps {
    id?: string;
    initialData?: any;
}

export default function ProductForm({ id, initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount: '0',
        stock: '',
        categoryId: '',
        images: [] as string[],
        isActive: true,
        isFeatured: false,
    });
    const [localFiles, setLocalFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [compressing, setCompressing] = useState(false);

    // Cropping State
    const [cropQueue, setCropQueue] = useState<File[]>([]);
    const [currentCropFile, setCurrentCropFile] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    useEffect(() => {
        loadCategories();
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price?.toString() || '',
                discount: initialData.discount?.toString() || '0',
                stock: initialData.stock?.toString() || '',
                categoryId: initialData.categoryId || '',
                images: initialData.images || [],
                isActive: initialData.isActive ?? true,
                isFeatured: initialData.isFeatured ?? false,
            });
        }
    }, [initialData]);

    // Handle cropping queue
    useEffect(() => {
        if (!isCropping && cropQueue.length > 0) {
            const nextFile = cropQueue[0];
            const objectUrl = URL.createObjectURL(nextFile);
            setCurrentCropFile(objectUrl);
            setIsCropping(true);
        }
    }, [isCropping, cropQueue]);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);
        setCropQueue(prev => [...prev, ...newFiles]);

        // Clear input so same file can be selected again
        e.target.value = '';
    };

    const onCropComplete = async (croppedBlob: Blob) => {
        setCompressing(true);
        setIsCropping(false);

        try {
            const originalFile = cropQueue[0];
            const croppedFile = new File([croppedBlob], originalFile.name, { type: 'image/jpeg' });

            // Compression options
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
                initialQuality: 0.7
            };

            const compressed = await imageCompression(croppedFile, options);

            setLocalFiles(prev => [...prev, compressed as File]);
            setPreviews(prev => [...prev, URL.createObjectURL(compressed)]);

            // Clean up
            if (currentCropFile) URL.revokeObjectURL(currentCropFile);

        } catch (error) {
            console.error('Processing failed', error);
        } finally {
            setCropQueue(prev => prev.slice(1));
            setCurrentCropFile(null);
            setCompressing(false);
        }
    };

    const onCropCancel = () => {
        if (currentCropFile) URL.revokeObjectURL(currentCropFile);
        setCropQueue(prev => prev.slice(1));
        setCurrentCropFile(null);
        setIsCropping(false);
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const removeLocalFile = (index: number) => {
        setLocalFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => {
            const newPreviews = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index]);
            return newPreviews;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('description', formData.description);
        payload.append('price', formData.price);
        payload.append('discount', formData.discount);
        payload.append('stock', formData.stock);
        payload.append('categoryId', formData.categoryId);
        payload.append('isActive', String(formData.isActive));
        payload.append('isFeatured', String(formData.isFeatured));

        // Append existing image URLs
        formData.images.forEach((img) => payload.append('images[]', img));

        // Append new files
        localFiles.forEach((file) => payload.append('files', file));

        try {
            if (id) {
                await productsAPI.update(id, payload);
            } else {
                await productsAPI.create(payload);
            }
            router.push('/dashboard/products');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert((error as any).response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border border-transparent dark:border-gray-700">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Product Name
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g. RO Water Purifier"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Detailed product specification..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Price (₹)
                    </label>
                    <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Discount (%)
                    </label>
                    <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Stock Quantity
                    </label>
                    <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Category
                    </label>
                    <select
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="" className="bg-white dark:bg-gray-800">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-white dark:bg-gray-800">
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Images
                    </label>
                    <div className="mt-2 flex flex-wrap gap-4">
                        {/* Existing Images */}
                        {formData.images.map((img, index) => (
                            <div key={`existing-${index}`} className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600">
                                <img
                                    src={getImageUrl(img)}
                                    alt={`Product ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        {/* Local Previews */}
                        {previews.map((preview, index) => (
                            <div key={`local-${index}`} className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-primary dark:border-primary-400">
                                <img
                                    src={preview}
                                    alt={`New Preview ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 dark:bg-primary/90 text-[10px] text-white text-center py-0.5">New</div>
                                <button
                                    type="button"
                                    onClick={() => removeLocalFile(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary-400 transition">
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {compressing ? 'Processing...' : 'Add Image'}
                            </span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={compressing}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-6 md:col-span-2 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:bg-gray-700"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:bg-gray-700"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</span>
                    </label>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading || compressing}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                    {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-3 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                    Cancel
                </button>
            </div>

            {/* Cropping Modal */}
            {isCropping && currentCropFile && (
                <ImageCropperModal
                    image={currentCropFile}
                    onCrop={onCropComplete}
                    onCancel={onCropCancel}
                    aspect={4 / 5}
                />
            )}
        </form>
    );
}
