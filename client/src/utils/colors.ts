import { FastAverageColor } from 'fast-average-color';

const fac = new FastAverageColor();

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSV {
    h: number;
    s: number;
    v: number;
}

export const extractDominantColor = async (imageUrl: string): Promise<RGB> => {
    try {
        const color = await fac.getColorAsync(imageUrl, {
            crossOrigin: 'anonymous',
            algorithm: 'dominant'
        });
        return { r: color.value[0], g: color.value[1], b: color.value[2] };
    } catch (err) {
        console.error("Color extraction failed", err);
        throw err;
    }
};

export const rgbToHsv = ({ r, g, b }: RGB): HSV => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s, v };
};

export const sortAlbumsByColor = (albums: any[]) => {
    return [...albums].sort((a, b) => {
        if (!a.hsv || !b.hsv) return 0;
        
        // Primary sort: Hue
        if (a.hsv.h !== b.hsv.h) {
            return a.hsv.h - b.hsv.h;
        }
        
        // Secondary sort: Saturation
        if (a.hsv.s !== b.hsv.s) {
            return a.hsv.s - b.hsv.s;
        }
        
        // Tertiary sort: Value
        return a.hsv.v - b.hsv.v;
    });
};
