"use client"

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface WaveformHighlightProps {
    start: number | null; // start px
    end: number | null; // end px
    trackLength: number;
    waveformWidth: number;
    containerRef: HTMLDivElement | null
    waveformOffset: number;
    minWidth: number;
}

export function WaveformHighlight({
    start,
    end,
    trackLength,
    waveformWidth,
    containerRef,
    waveformOffset,
    minWidth
}: WaveformHighlightProps) {

    if(!start || !end) return <></>
    
    const localStart = Math.min(start, end);
    const localEnd = Math.max(start, end);

    if(localEnd - localStart < minWidth) return <></>

    function convertRange (OldValue: number, OldMin: number, OldMax: number, NewMin: number, NewMax: number)  {
        const OldRange = (OldMax - OldMin)
        if (OldRange == 0)
            var NewValue = NewMin
        else
        {
            var NewRange = (NewMax - NewMin)  
            var NewValue = (((OldValue - OldMin) * NewRange) / OldRange) + NewMin
        }
        return NewValue
    }

    function getContainerWidth(): number {
        return containerRef?.getBoundingClientRect().width || waveformWidth;
    }

    const containerWidth = getContainerWidth();
    const highlightLeft = convertRange(localStart, 0, trackLength, 0, containerWidth) + waveformOffset;
    const highlightRight = convertRange(localEnd, 0, trackLength, 0, containerWidth) + waveformOffset;
    const highlightWidth = highlightRight - highlightLeft;

    return (
        <div
            style={{
                position: 'absolute',
                width: `${highlightWidth}px`,
                top: 0,
                left: `${highlightLeft}px`,
                bottom: 0,
                backgroundColor: 'rgba(200,200,200,0.2)',
                pointerEvents: 'none', // ensures the highlight doesn't block interactions
                zIndex: 10
            }}
        />
    );
}
