
import React, { useState } from 'react';
import { Post, User } from '../types/index';
import { t } from '../constants/locales';
import { TrashIcon, FlagIcon, CheckIcon, XMarkIcon, PencilIcon } from './Icons';

interface PostOptionsModalProps {
    post: Post;
    currentUser: User | null;
    onClose: () => void;
    onReport: () => void;
    onDelete: () => void;
    onEdit: () => void;
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({ post, currentUser, onClose, onReport, onDelete, onEdit }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const isAuthor = currentUser && currentUser.anonId === post.authorAnonId;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-card-bg dark:bg-dark-card-bg w-full rounded-t-2xl overflow-hidden animate-slide-in-up pb-safe shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                <div className="p-4 border-b border-border-color dark:border-dark-border-color">
                    <h3 className="text-center font-bold text-lg text-primary-text dark:text-dark-primary-text">
                        {showConfirm ? "Are you sure?" : t.options}
                    </h3>
                </div>

                <div className="p-4 space-y-2">
                    {showConfirm ? (
                        <div className="space-y-3 animate-fade-in">
                            <p className="text-center text-secondary-text dark:text-dark-secondary-text text-sm mb-2">
                                This action cannot be undone.
                            </p>
                            <button
                                onClick={onDelete}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-red-500 text-white rounded-xl font-bold active:scale-95 transition-transform"
                            >
                                <TrashIcon className="w-6 h-6" />
                                Yes, Delete It
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-primary-text dark:text-dark-primary-text font-bold active:scale-95 transition-transform"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            {isAuthor && (
                                <>
                                    <button
                                        onClick={onEdit}
                                        className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-primary-text dark:text-dark-primary-text font-bold active:scale-95 transition-transform"
                                    >
                                        <PencilIcon className="w-6 h-6" />
                                        Edit Post
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 font-bold active:scale-95 transition-transform"
                                    >
                                        <TrashIcon className="w-6 h-6" />
                                        {t.deletePost}
                                    </button>
                                </>
                            )}

                            {/* Always show Report option, even for authors (useful for testing or removal requests) */}
                            <button
                                onClick={onReport}
                                className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-primary-text dark:text-dark-primary-text font-bold active:scale-95 transition-transform"
                            >
                                <FlagIcon className="w-6 h-6" />
                                {t.reportPostTitle}
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full p-4 mt-2 bg-transparent text-secondary-text dark:text-dark-secondary-text font-bold active:scale-95 transition-transform"
                            >
                                {t.cancel}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostOptionsModal;
