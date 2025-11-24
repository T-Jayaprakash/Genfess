
import React, { useState } from 'react';
import { Post } from '../types/index';
import { t } from '../constants/locales';
import * as api from '../services/api';

interface ReportModalProps {
    post: Post;
    onClose: () => void;
    onDeleteBroadcast?: (postId: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ post, onClose, onDeleteBroadcast }) => {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [wasAutoDeleted, setWasAutoDeleted] = useState(false);

    const handleReport = async () => {
        if (!selectedReason) return;
        const result = await api.submitReport(post.id, selectedReason);
        
        if (result === 'DELETED') {
            setWasAutoDeleted(true);
            if (onDeleteBroadcast) {
                onDeleteBroadcast(post.id);
            }
        }
        setIsSubmitted(true);
    };

    const reportReasons = Object.entries(t.reportReasons);

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-card-bg dark:bg-dark-card-bg rounded-2xl w-11/12 max-w-sm shadow-xl dark:shadow-black/30 overflow-hidden" onClick={e => e.stopPropagation()}>
                {!isSubmitted ? (
                    <>
                        <div className="text-center p-4 border-b border-border-color dark:border-dark-border-color">
                            <h3 className="font-bold text-lg">{t.reportPostTitle}</h3>
                        </div>
                        <div className="p-4">
                             <h4 className="font-semibold text-primary-text dark:text-dark-primary-text mb-3">{t.reportReasonTitle}</h4>
                            <ul className="space-y-1">
                                {reportReasons.map(([key, reason]) => (
                                    <li key={key}>
                                        <button
                                            onClick={() => setSelectedReason(reason)}
                                            className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedReason === reason ? 'bg-accent-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-border-color'}`}
                                        >
                                            {reason}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-black">
                            <button
                                onClick={handleReport}
                                disabled={!selectedReason}
                                className="w-full bg-accent-primary text-white font-bold py-3 rounded-lg transition-colors hover:bg-accent-secondary disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {t.submitReport}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto bg-success rounded-full flex items-center justify-center mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl mb-2">{wasAutoDeleted ? "Post Removed" : t.reportSubmitted}</h3>
                        <p className="text-secondary-text dark:text-dark-secondary-text text-sm mb-6">
                            {wasAutoDeleted 
                                ? "This post has been automatically removed due to multiple reports." 
                                : t.reportSubmittedInfo}
                        </p>
                        <button onClick={onClose} className="bg-accent-primary text-white font-bold py-2 px-6 rounded-lg">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
