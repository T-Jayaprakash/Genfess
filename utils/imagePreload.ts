// Image preloading utility for better performance

const preloadedImages = new Set<string>();

export const preloadImage = (src: string): Promise<void> => {
    // Skip if already preloaded
    if (preloadedImages.has(src)) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            preloadedImages.add(src);
            resolve();
        };
        img.onerror = () => {
            reject(new Error(`Failed to preload image: ${src}`));
        };
        img.src = src;
    });
};

export const preloadImages = (srcs: string[]): Promise<void[]> => {
    return Promise.all(srcs.map(src => preloadImage(src).catch(() => {})));
};

export const isImagePreloaded = (src: string): boolean => {
    return preloadedImages.has(src);
};
