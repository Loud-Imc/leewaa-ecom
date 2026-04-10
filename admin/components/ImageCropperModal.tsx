import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';

interface ImageCropperModalProps {
    image: string;
    onCrop: (croppedBlob: Blob) => void;
    onCancel: () => void;
    aspect?: number;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    image,
    onCrop,
    onCancel,
    aspect = 4 / 5
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
            if (croppedBlob) {
                onCrop(croppedBlob);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl mx-4">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Crop Product Image</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="relative h-96 w-full bg-gray-100 dark:bg-gray-900">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleCropSave}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-primary-600 transition shadow-lg shadow-primary/20"
                        >
                            Save Crop
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;
