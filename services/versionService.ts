import { APP_VERSION, MIN_SUPPORTED_VERSION, VERSION_CHECK_URL } from '../constants/version';

interface VersionInfo {
    latestVersion: string;
    minSupportedVersion: string;
    updateUrl: string;
    forceUpdate: boolean;
    message?: string;
}

/**
 * Compare two semantic version strings
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 < part2) return -1;
        if (part1 > part2) return 1;
    }

    return 0;
};

/**
 * Check if the current app version is supported
 * Returns an object with update information
 */
export const checkVersion = async (): Promise<{
    needsUpdate: boolean;
    forceUpdate: boolean;
    versionInfo: VersionInfo | null;
}> => {
    try {
        // Try to fetch remote version info
        const response = await fetch(VERSION_CHECK_URL, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.warn('Version check failed, using local version info');
            return checkLocalVersion();
        }

        const versionInfo: VersionInfo = await response.json();

        // Check if current version is below minimum supported
        const isOutdated = compareVersions(APP_VERSION, versionInfo.minSupportedVersion) < 0;

        // Check if there's a newer version available
        const hasUpdate = compareVersions(APP_VERSION, versionInfo.latestVersion) < 0;

        return {
            needsUpdate: hasUpdate,
            forceUpdate: isOutdated || versionInfo.forceUpdate,
            versionInfo,
        };
    } catch (error) {
        console.error('Version check error:', error);
        // Fallback to local version check
        return checkLocalVersion();
    }
};

/**
 * Fallback version check using local constants
 */
const checkLocalVersion = (): {
    needsUpdate: boolean;
    forceUpdate: boolean;
    versionInfo: VersionInfo | null;
} => {
    const isOutdated = compareVersions(APP_VERSION, MIN_SUPPORTED_VERSION) < 0;

    return {
        needsUpdate: isOutdated,
        forceUpdate: isOutdated,
        versionInfo: isOutdated ? {
            latestVersion: MIN_SUPPORTED_VERSION,
            minSupportedVersion: MIN_SUPPORTED_VERSION,
            updateUrl: 'https://lastbench.in',
            forceUpdate: true,
            message: 'Please update to the latest version',
        } : null,
    };
};

/**
 * Get current app version
 */
export const getCurrentVersion = (): string => {
    return APP_VERSION;
};

/**
 * Store version check timestamp to avoid excessive checks
 */
const VERSION_CHECK_KEY = 'lastbench_last_version_check';
const VERSION_CHECK_INTERVAL = 3600000; // 1 hour in milliseconds

export const shouldCheckVersion = (): boolean => {
    try {
        const lastCheck = localStorage.getItem(VERSION_CHECK_KEY);
        if (!lastCheck) return true;

        const lastCheckTime = parseInt(lastCheck, 10);
        const now = Date.now();

        return (now - lastCheckTime) > VERSION_CHECK_INTERVAL;
    } catch {
        return true;
    }
};

export const markVersionChecked = (): void => {
    try {
        localStorage.setItem(VERSION_CHECK_KEY, Date.now().toString());
    } catch {
        // Ignore storage errors
    }
};
