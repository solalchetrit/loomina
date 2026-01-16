import React from 'react';

export default function BackgroundEffects() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
            <div className="ambient-orb gold w-[800px] h-[800px] -top-48 -left-48 opacity-[0.08]" />
            <div className="ambient-orb gold w-[600px] h-[600px] top-[20%] -right-36 opacity-[0.06]" />
            <div className="ambient-orb gold w-[700px] h-[700px] bottom-[-10%] -left-36 opacity-[0.05]" />
        </div>
    );
}
