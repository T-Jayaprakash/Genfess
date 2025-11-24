
import React, { useState, useEffect } from 'react';
import { Post, User, Theme } from '../types/index';
import * as api from '../services/api';
import { t } from '../constants/locales';
import { PencilIcon, SunIcon, MoonIcon, TrashIcon } from '../components/Icons';
import { DEPARTMENTS, AVATAR_COLORS } from '../constants/config';

interface ProfileViewProps {
    user: User | null;
    onUpdateUser: (user: User) => void;
    theme: Theme;
    toggleTheme: () => void;
    onLogout: () => void;
    onViewImages: (images: string[], index: number) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, theme, toggleTheme, onLogout, onViewImages }) => {
    const [activeTab, setActiveTab] = useState<'myPosts' | 'likedPosts'>('myPosts');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [editedName, setEditedName] = useState(user?.displayName || '');
    const [editedDept, setEditedDept] = useState(user?.department || '');
    const [editedColor, setEditedColor] = useState(user?.avatarColor || AVATAR_COLORS[0]);
    const [editedAvatarUrl, setEditedAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
    const [imgError, setImgError] = useState(false);

    const [customDept, setCustomDept] = useState('');
    const [isOtherDept, setIsOtherDept] = useState(false);

    useEffect(() => {
        if (user && isEditing) {
            setEditedName(user.displayName);
            setEditedColor(user.avatarColor);
            setEditedAvatarUrl(user.avatarUrl);
            setImgError(false);

            const isStandardDept = DEPARTMENTS.some(d => d === user.department);
            if (isStandardDept) {
                setEditedDept(user.department);
                setIsOtherDept(false);
                setCustomDept('');
            } else {
                setEditedDept('Other');
                setIsOtherDept(true);
                setCustomDept(user.department);
            }
        }
    }, [user, isEditing]);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const fetchedPosts = activeTab === 'myPosts'
                    ? await api.getUserPosts(user.anonId)
                    : await api.getLikedPosts(user.anonId);
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Failed to fetch profile posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [activeTab, user]);

    if (!user) {
        return <div className="text-center p-8 text-secondary-text dark:text-dark-secondary-text">Loading profile...</div>;
    }

    const handleSave = () => {
        const finalDept = isOtherDept ? customDept.trim() : editedDept;
        if (!editedName.trim() || !finalDept) return;
        const updatedUser = {
            ...user,
            displayName: editedName.trim(),
            department: finalDept,
            avatarColor: editedColor,
            avatarUrl: editedAvatarUrl
        };
        onUpdateUser(updatedUser);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this post?")) {
            const success = await api.deletePost(postId);
            if (success) {
                setPosts(prev => prev.filter(p => p.id !== postId));
            } else {
                alert("Failed to delete post.");
            }
        }
    };

    const currentAvatarUrl = isEditing ? editedAvatarUrl : user.avatarUrl;
    const currentAvatarColor = isEditing ? editedColor : user.avatarColor;
    const currentDisplayName = isEditing ? editedName : user.displayName;

    return (
        <div className="p-4 bg-background dark:bg-dark-background h-full flex flex-col animate-fade-in">
            <div className="flex flex-col items-center p-4 relative">
                {/* Header Controls */}
                <div className="absolute top-0 left-0 flex gap-2">
                    <button onClick={toggleTheme} className="text-secondary-text dark:text-dark-secondary-text hover:text-primary-text dark:hover:text-dark-primary-text p-2 transition-colors" aria-label="Toggle Theme">
                        {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                    </button>
                </div>

                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="absolute top-0 right-0 text-accent-primary hover:text-accent-secondary p-2 transition-colors" aria-label="Edit Profile">
                        <PencilIcon className="w-6 h-6" />
                    </button>
                )}

                <div className="relative mt-6">
                    <div
                        className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white dark:text-dark-background mb-3 transition-all duration-300 overflow-hidden ${isEditing ? 'ring-4 ring-accent-primary ring-offset-2 ring-offset-background dark:ring-offset-dark-background' : ''}`}
                        style={{ backgroundColor: (currentAvatarUrl && !imgError) ? 'transparent' : currentAvatarColor }}
                    >
                        {currentAvatarUrl && !imgError ? (
                            <img
                                src={currentAvatarUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            currentDisplayName.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>

                {/* User Details or Edit Form */}
                {isEditing ? (
                    <div className="w-full max-w-xs mt-4 space-y-4 animate-fade-in">
                        <div>
                            <label className="text-xs text-secondary-text dark:text-dark-secondary-text font-bold uppercase">Welcome !!</label>
                            <label className="block text-red-500 font-bold uppercase text-lg">{user.displayName}</label>
                        </div>
                        <div>
                            <label className="text-xs text-secondary-text dark:text-dark-secondary-text font-bold uppercase">Username</label>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-dark-border-color border border-border-color dark:border-dark-border-color rounded-lg p-2 mt-1 focus:ring-2 focus:ring-accent-primary focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-secondary-text dark:text-dark-secondary-text font-bold uppercase">Department</label>
                            <select
                                value={isOtherDept ? 'Other' : editedDept}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEditedDept(val);
                                    setIsOtherDept(val === 'Other');
                                    if (val !== 'Other') setCustomDept('');
                                }}
                                className="w-full bg-gray-100 dark:bg-dark-border-color border border-border-color dark:border-dark-border-color rounded-lg p-2 mt-1 focus:ring-2 focus:ring-accent-primary focus:outline-none"
                            >
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                <option value="Other">Other...</option>
                            </select>
                            {isOtherDept && (
                                <input
                                    type="text"
                                    value={customDept}
                                    onChange={(e) => setCustomDept(e.target.value)}
                                    placeholder="Enter department"
                                    className="w-full bg-gray-100 dark:bg-dark-border-color border border-border-color dark:border-dark-border-color rounded-lg p-2 mt-2 focus:ring-2 focus:ring-accent-primary focus:outline-none"
                                />
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-secondary-text dark:text-dark-secondary-text font-bold uppercase">Avatar Color</label>
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-2 no-scrollbar">
                                {AVATAR_COLORS.map(color => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full flex-shrink-0 transition-transform ${editedColor === color ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            setEditedColor(color);
                                            setEditedAvatarUrl(undefined);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button onClick={handleCancel} className="flex-1 py-2 bg-gray-200 dark:bg-dark-border-color rounded-lg font-bold">{t.cancel}</button>
                            <button
                                onClick={handleSave}
                                disabled={!editedName.trim() || (isOtherDept && !customDept.trim())}
                                className="flex-1 py-2 bg-accent-primary text-white rounded-lg font-bold disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mt-2 animate-fade-in">
                        <div className="leading-tight">
                            <h2 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Welcome !!</h2>
                            <h2 className="text-xl font-bold text-red-500">{user.displayName}</h2>
                        </div>
                        <p className="text-secondary-text dark:text-dark-secondary-text text-sm mt-1">
                            {user.department} • {user.college}
                        </p>
                        <div className="mt-2 inline-block bg-gray-100 dark:bg-dark-border-color rounded-full px-3 py-1 text-xs font-mono text-secondary-text dark:text-dark-secondary-text">
                            {user.anonId}
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            {!isEditing && (
                <>
                    <div className="flex border-b border-border-color dark:border-dark-border-color mt-2">
                        <button
                            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'myPosts' ? 'text-primary-text dark:text-dark-primary-text' : 'text-secondary-text dark:text-dark-secondary-text'}`}
                            onClick={() => setActiveTab('myPosts')}
                        >
                            {t.myPosts}
                            {activeTab === 'myPosts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-text dark:bg-dark-primary-text"></div>}
                        </button>
                        <button
                            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'likedPosts' ? 'text-primary-text dark:text-dark-primary-text' : 'text-secondary-text dark:text-dark-secondary-text'}`}
                            onClick={() => setActiveTab('likedPosts')}
                        >
                            {t.likedPosts}
                            {activeTab === 'likedPosts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-text dark:bg-dark-primary-text"></div>}
                        </button>
                    </div>

                    {/* Posts Grid */}
                    <div className="flex-grow overflow-y-auto pb-safe no-scrollbar">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="grid grid-cols-3 gap-0.5">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden group cursor-pointer"
                                        onClick={() => {
                                            const images = (post.images && post.images.length > 0) ? post.images : (post.imageUrl ? [post.imageUrl] : []);
                                            if (images.length > 0) onViewImages(images, 0);
                                        }}
                                    >
                                        {post.imageUrl ? (
                                            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-2 bg-accent-primary/10 text-center">
                                                <p className="text-[10px] line-clamp-4 text-primary-text dark:text-dark-primary-text font-medium leading-tight">{post.text}</p>
                                            </div>
                                        )}
                                        {post.images && post.images.length > 1 && (
                                            <div className="absolute top-1 right-1 text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 drop-shadow-md">
                                                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm pointer-events-none">
                                            {post.likesCount} ❤
                                        </div>

                                        {activeTab === 'myPosts' && (
                                            <button
                                                onClick={(e) => handleDeletePost(e, post.id)}
                                                className="absolute top-1 left-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-secondary-text dark:text-dark-secondary-text">
                                {activeTab === 'myPosts' ? "No posts yet." : "No liked posts."}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfileView;
