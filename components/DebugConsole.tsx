import React, { useState, useEffect } from 'react';

const DebugConsole: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Override console methods to capture logs
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            setLogs(prev => [`LOG: ${args.map(a => JSON.stringify(a)).join(' ')}`, ...prev].slice(0, 50));
            originalLog(...args);
        };

        console.error = (...args) => {
            setLogs(prev => [`ERR: ${args.map(a => JSON.stringify(a)).join(' ')}`, ...prev].slice(0, 50));
            originalError(...args);
        };

        console.warn = (...args) => {
            setLogs(prev => [`WARN: ${args.map(a => JSON.stringify(a)).join(' ')}`, ...prev].slice(0, 50));
            originalWarn(...args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-20 right-4 z-[9999] bg-red-600 text-white p-2 rounded-full shadow-lg text-xs font-bold opacity-50 hover:opacity-100"
            >
                BUG
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 text-green-400 font-mono text-xs p-4 overflow-auto flex flex-col">
            <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                <h3 className="font-bold text-white">Debug Console</h3>
                <div className="flex gap-2">
                    <button onClick={() => setLogs([])} className="bg-gray-700 px-2 py-1 rounded text-white">Clear</button>
                    <button onClick={() => setIsVisible(false)} className="bg-red-600 px-2 py-1 rounded text-white">Close</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className={`break-words ${log.startsWith('ERR') ? 'text-red-400' : log.startsWith('WARN') ? 'text-yellow-400' : 'text-green-400'}`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DebugConsole;
