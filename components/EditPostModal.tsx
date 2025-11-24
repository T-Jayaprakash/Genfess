import React, { useState } from 'react';
import { Post } from '../types/index';
import { XMarkIcon } from './Icons';

interface EditPostModalProps {
    post: Post;
    onClose: () => void;
    onSave: (text: string) => Promise<void>;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
    const [text, setText] = useState(post.text);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!text.trim()) return;
        setSaving(true);
        await onSave(text);
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card-bg dark:bg-dark-card-bg w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center p-4 border-b border-border-color dark:border-dark-border-color">
                    <h3 className="font-bold text-lg text-primary-text dark:text-dark-primary-text">Edit Post</h3>
                    <button onClick={onClose} className="text-secondary-text dark:text-dark-secondary-text hover:text-primary-text">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-32 bg-gray-100 dark:bg-dark-border-color rounded-xl p-3 text-primary-text dark:text-dark-primary-text resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        placeholder="What's on your mind?"
                    />
                </div>
                <div className="p-4 border-t border-border-color dark:border-dark-border-color flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 font-bold text-secondary-text dark:text-dark-secondary-text">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !text.trim()}
                        className="px-6 py-2 bg-accent-primary text-white rounded-xl font-bold disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;
