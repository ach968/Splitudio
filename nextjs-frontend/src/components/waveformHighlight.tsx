"use client"

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface WaveformHighlightProps {
    start: number | null;
    end: number | null;
    trackLength: number;
    waveformWidth: number;
}

export function WaveformHighlight({
    start,
    end,
    trackLength,
    waveformWidth,
}: WaveformHighlightProps) {
    
    if(!start || !end || trackLength === 0) return <></>

    const normalizedStart = Math.min(start, end);
    const normalizedEnd = Math.max(start, end);

    const left = (normalizedStart / trackLength) * waveformWidth
    const width = ((normalizedEnd - normalizedStart) / trackLength) * waveformWidth
    return (
        <div 
        style={{
            position: 'absolute',
            width: `${width}px`,
            top: 0,
            left: `${133 + left}px`,
            bottom: 0,
            backgroundColor: 'rgba(255,255,0,0.3)',
            pointerEvents: 'none', // ensures the highlight doesn't block interactions
        }}
        />
    );
}
