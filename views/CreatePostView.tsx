
import React, { useState, useRef } from 'react';
import { PostTag, Post } from '../types/index';
import { t } from '../constants/locales';
import { PhotoIcon, XMarkIcon } from '../components/Icons';
import * as userService from '../services/userService';
import * as api from '../services/api';
import { useToast } from '../components/Toast';

interface CreatePostViewProps {
    onPostSuccess: (post: Post) => void;
    onCancel: () => void;
}

const CreatePostView: React.FC<CreatePostViewProps> = ({ onPostSuccess, onCancel }) => {
    const [text, setText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    // We remove visual blocking state 'isPosting' to allow immediate close

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast, updateToast } = useToast();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files) as File[];
            const totalFiles = [...selectedFiles, ...newFiles].slice(0, 10);
            setSelectedFiles(totalFiles);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            const totalPreviews = [...previews, ...newPreviews].slice(0, 10);
            setPreviews(totalPreviews);
        }
    };

    const handleRemoveImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    }

    const handleSubmit = async () => {
        if (!text.trim() && selectedFiles.length === 0) return;

        // 1. IMMEDIATE FEEDBACK: Close the view instantly
        onCancel();

        try {
            // 2. Create OPTIMISTIC post immediately (Instagram-like instant feedback)
            if (selectedFiles.length > 0) {
                // Get current user for optimistic post
                const currentUser = await userService.getCurrentUser();

                // Create optimistic post with local blob URLs for instant display
                const localUrls = selectedFiles.map(file => URL.createObjectURL(file));

                // Create a temporary optimistic post
                const optimisticPost: any = {
                    id: `temp_${Date.now()}`,
                    text,
                    images: localUrls,
                    imageUrl: localUrls[0],
                    authorAnonId: currentUser?.anonId || 'You',
                    displayName: currentUser?.displayName || 'You',
                    authorAvatarColor: currentUser?.avatarColor || '#000',
                    authorAvatarUrl: currentUser?.avatarUrl,
                    department: currentUser?.department || '',
                    tags: [],
                    likesCount: 0,
                    commentsCount: 0,
                    createdAt: new Date(),
                    trendingScore: 0,
                    isLiked: false
                };

                // Show optimistic post immediately
                onPostSuccess(optimisticPost);

                // 3. Upload images in background
                const uploadPromises = selectedFiles.map(async (file) => {
                    return await userService.uploadPostImage(file);
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                const validUrls = uploadedUrls.filter(url => url !== null) as string[];

                if (validUrls.length === 0) {
                    throw new Error("Image upload failed.");
                }

                // 4. Create real post with uploaded URLs
                const newPost = await api.createPost({
                    text,
                    images: validUrls,
                    tags: [],
                });

                if (newPost) {
                    // Replace optimistic post with real post
                    onPostSuccess(newPost);
                } else {
                    throw new Error("Failed to save post.");
                }

                // Clean up blob URLs
                localUrls.forEach(url => URL.revokeObjectURL(url));

            } else {
                // Text-only post - no need for optimistic update
                const newPost = await api.createPost({
                    text,
                    tags: [],
                });

                if (newPost) {
                    onPostSuccess(newPost);
                } else {
                    throw new Error("Failed to save post.");
                }
            }

        } catch (e: any) {
            console.error("Post creation failed", e);
            updateToast("Post failed. Try again.", 'error');
        }
    };

    return (
        <div className="flex flex-col h-full p-6 bg-background dark:bg-black animate-fade-in relative">
            {/* Title */}
            <div className="text-center mb-8 mt-4">
                <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400">{t.newPostCTA}</h2>
            </div>

            {/* Text Input */}
            <div className="flex-grow relative">
                <textarea
                    className="w-full bg-transparent text-primary-text dark:text-white text-xl placeholder-gray-600 dark:placeholder-gray-700 resize-none focus:outline-none text-center min-h-[120px]"
                    placeholder={t.whatsOnYourMind}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {/* Image Previews Carousel */}
                {previews.length > 0 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
                        {previews.map((src, index) => (
                            <div key={index} className="relative flex-shrink-0 w-60 aspect-[4/5] rounded-lg overflow-hidden snap-center border border-gray-800 bg-gray-900">
                                <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500/80 transition-colors backdrop-blur-sm"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white font-bold backdrop-blur-sm">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-auto">
                {/* Add Photo Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-accent-primary font-bold mb-6 hover:text-accent-secondary transition-colors"
                >
                    <PhotoIcon className="w-6 h-6" />
                    <span>{t.addPhoto}</span>
                </button>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                />

                {/* Footer Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 text-primary-text dark:text-white font-bold rounded-xl active:scale-95 transition-transform"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!text.trim() && selectedFiles.length === 0}
                        className="flex-1 py-3 bg-gray-700 text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                        {t.post}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostView;
