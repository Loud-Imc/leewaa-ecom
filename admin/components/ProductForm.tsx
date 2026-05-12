'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import { 
    FaDroplet, 
    FaFilter, 
    FaFlask, 
    FaVial, 
    FaMicrochip, 
    FaMobile, 
    FaTv, 
    FaBolt, 
    FaSun, 
    FaShieldHalved, 
    FaLeaf, 
    FaGem, 
    FaCheckDouble, 
    FaMedal,
    FaPlus,
    FaTrashCan
} from 'react-icons/fa6';

const ICON_BUNDLE = [
    { id: 'FaDroplet', icon: <FaDroplet />, label: 'Water Drop' },
    { id: 'FaFilter', icon: <FaFilter />, label: 'Filter' },
    { id: 'FaFlask', icon: <FaFlask />, label: 'Flask' },
    { id: 'FaVial', icon: <FaVial />, label: 'Alkaline' },
    { id: 'FaMicrochip', icon: <FaMicrochip />, label: 'IoT/Smart' },
    { id: 'FaMobile', icon: <FaMobile />, label: 'Mobile App' },
    { id: 'FaTv', icon: <FaTv />, label: 'Display' },
    { id: 'FaBolt', icon: <FaBolt />, label: 'Speed' },
    { id: 'FaSun', icon: <FaSun />, label: 'UV Light' },
    { id: 'FaShieldHalved', icon: <FaShieldHalved />, label: 'Shield' },
    { id: 'FaLeaf', icon: <FaLeaf />, label: 'Natural' },
    { id: 'FaGem', icon: <FaGem />, label: 'Minerals' },
    { id: 'FaCheckDouble', icon: <FaCheckDouble />, label: 'Certified' },
    { id: 'FaMedal', icon: <FaMedal />, label: 'Warranty' },
];

interface ProductFeature {
    id: string;
    text: string;
    icon: string;
}

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
        position: '0',
        features: [] as ProductFeature[],
        colors: [] as string[],
    });
    const [displayImages, setDisplayImages] = useState<{ id: string; type: 'existing' | 'local'; url: string; file?: File }[]>([]);
    const [compressing, setCompressing] = useState(false);

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
                position: initialData.position?.toString() || '0',
                features: initialData.features || [],
                colors: initialData.colors || [],
            });

            if (initialData.images) {
                setDisplayImages(initialData.images.map((img: string) => ({
                    id: img,
                    type: 'existing',
                    url: getImageUrl(img)
                })));
            }
        }
    }, [initialData]);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setCompressing(true);
        const newFiles = Array.from(files);

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1600,
                useWebWorker: true,
                initialQuality: 0.85
            };

            const compressedFiles = await Promise.all(
                newFiles.map(async (file) => {
                    try {
                        const compressed = await imageCompression(file, options);
                        return compressed as File;
                    } catch (error) {
                        console.error('Compression failed for', file.name, error);
                        return file;
                    }
                })
            );

            const newItems = compressedFiles.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                type: 'local' as const,
                url: URL.createObjectURL(file),
                file
            }));

            setDisplayImages(prev => [...prev, ...newItems]);
        } catch (error) {
            console.error('Failed to process images', error);
        } finally {
            setCompressing(false);
        }
    };

    const removeImage = (index: number) => {
        setDisplayImages((prev) => {
            const item = prev[index];
            if (item.type === 'local') {
                URL.revokeObjectURL(item.url);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const moveImage = (index: number, direction: 'left' | 'right') => {
        setDisplayImages((prev) => {
            const newImages = [...prev];
            const targetIndex = direction === 'left' ? index - 1 : index + 1;
            if (targetIndex >= 0 && targetIndex < newImages.length) {
                [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
            }
            return newImages;
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
        payload.append('position', formData.position);
        payload.append('features', JSON.stringify(formData.features));
        payload.append('colors', formData.colors.join(','));

        // Create the image order and separate files
        const imageOrder: string[] = [];
        let fileIndex = 0;
        const submitFiles: File[] = [];

        displayImages.forEach((item) => {
            if (item.type === 'existing') {
                imageOrder.push(item.id); // The original URL key
            } else if (item.file) {
                const placeholder = `file_${fileIndex}`;
                imageOrder.push(placeholder);
                submitFiles.push(item.file);
                fileIndex++;
            }
        });

        // Add established image URLs to images[] for backward compatibility/DTO validation
        const existingImages = displayImages
            .filter(img => img.type === 'existing')
            .map(img => img.id);

        existingImages.forEach(img => payload.append('images[]', img));
        imageOrder.forEach(order => payload.append('imageOrder[]', order));
        submitFiles.forEach(file => payload.append('files', file));

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
        <form onSubmit={handleSubmit} className="relative space-y-8 max-w-4xl pb-10">
            {/* Sticky Action Bar */}
            <div className="sticky top-0 z-40 -mx-6 px-6 py-4 mb-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex justify-end gap-4 shadow-sm rounded-t-xl sm:-mx-8 sm:px-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-lg font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || compressing}
                    className="bg-primary text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 shadow-sm shadow-primary/20"
                >
                    {loading && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
                </button>
            </div>

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
                        Display Position (Priority)
                    </label>
                    <input
                        type="number"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="0"
                    />
                    <p className="mt-1 text-[10px] text-gray-500">Lower numbers (e.g. 0, 1) appear first.</p>
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
                        {/* Unified Image Display */}
                        {displayImages.map((item, index) => (
                            <div key={item.id} className={`relative group w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border ${item.type === 'local' ? 'border-primary dark:border-primary-400' : 'border-gray-100 dark:border-gray-600'}`}>
                                <img
                                    src={item.url}
                                    alt={`Product ${index}`}
                                    className="w-full h-full object-cover"
                                />

                                {item.type === 'local' && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 dark:bg-primary/90 text-[10px] text-white text-center py-0.5">New</div>
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() => moveImage(index, 'left')}
                                        className="bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 transition disabled:opacity-30"
                                        title="Move Left"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition"
                                        title="Remove"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={index === displayImages.length - 1}
                                        onClick={() => moveImage(index, 'right')}
                                        className="bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 transition disabled:opacity-30"
                                        title="Move Right"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary-400 transition">
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {compressing ? 'Processing...' : 'Add Image'}
                            </span>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">WebP, PNG, JPG supported</p>
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

            {/* Colors Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-transparent dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Product Colors</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                    {formData.colors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full border dark:border-gray-600">
                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color }}></div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{color}</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }))}
                                className="text-red-500 hover:text-red-700"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="e.g. #FFFFFF or White"
                        className="flex-grow px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !formData.colors.includes(val)) {
                                    setFormData(prev => ({ ...prev, colors: [...prev.colors, val] }));
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={(e) => {
                            const input = (e.currentTarget.previousSibling as HTMLInputElement);
                            const val = input.value.trim();
                            if (val && !formData.colors.includes(val)) {
                                setFormData(prev => ({ ...prev, colors: [...prev.colors, val] }));
                                input.value = '';
                            }
                        }}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
                    >
                        Add Color
                    </button>
                </div>
            </div>

            {/* Features Builder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-transparent dark:border-gray-700">
                <div className="mb-8 pb-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Best Features</h3>
                    <p className="text-xs text-gray-500 mt-1">Add key highlights and icons for this product</p>
                </div>

                <div className="space-y-6">
                    {formData.features.map((feature, index) => (
                        <div key={feature.id} className="flex gap-6 items-start p-6 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border dark:border-gray-700 group transition-all hover:shadow-sm">
                            {/* Visual Icon Picker */}
                            <div className="flex-shrink-0">
                                <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 px-1">Select Icon</label>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 shadow-sm">
                                    {ICON_BUNDLE.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            title={item.label}
                                            onClick={() => {
                                                const newFeatures = [...formData.features];
                                                newFeatures[index].icon = item.id;
                                                setFormData({ ...formData, features: newFeatures });
                                            }}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all ${
                                                feature.icon === item.id 
                                                ? 'border-primary bg-primary/5 text-primary scale-110 shadow-sm' 
                                                : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="text-lg">{item.icon}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-grow">
                                <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 px-1">Description</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={feature.text}
                                        onChange={(e) => {
                                            const newFeatures = [...formData.features];
                                            newFeatures[index].text = e.target.value;
                                            setFormData({ ...formData, features: newFeatures });
                                        }}
                                        className="w-full pl-4 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium"
                                        placeholder="Enter feature highlight..."
                                    />
                                    {feature.text.length > 0 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-7">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm group/del"
                                    title="Delete Feature"
                                >
                                    <FaTrashCan className="text-sm transition-transform group-hover/del:scale-110" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {formData.features.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4">
                                <FaDroplet className="text-2xl" />
                            </div>
                            <p className="text-gray-500 font-medium text-sm">No highlights added yet</p>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                    ...prev,
                                    features: [...prev.features, { id: Math.random().toString(36).substr(2, 9), text: '', icon: 'FaDroplet' }]
                                }))}
                                className="mt-4 text-primary font-bold text-sm hover:underline"
                            >
                                + Add your first feature
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                            ...prev,
                            features: [...prev.features, { id: Math.random().toString(36).substr(2, 9), text: '', icon: 'FaDroplet' }]
                        }))}
                        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-bold flex items-center justify-center gap-2 group"
                    >
                        <FaPlus className="text-sm group-hover:scale-110 transition-transform" />
                        Add New Highlight
                    </button>
                </div>
            </div>

        </form>
    );
}
