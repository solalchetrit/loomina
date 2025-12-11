"use client";

import React from "react";

interface MemberCardProps {
    name?: string;
    memberId?: string;
}

export default function MemberCard({ name = "ÉDITION BIOGRAPHIQUE", memberId = "2024 • LMN • 9357" }: MemberCardProps) {
    // If a name is passed (e.g. from SuccessPage), we might want to display it.
    // The design has "Loomina" (brand) and "ÉDITION BIOGRAPHIQUE" (status).
    // If name is provided, let's use it in place of "ÉDITION BIOGRAPHIQUE" or append it?
    // Let's replace "ÉDITION BIOGRAPHIQUE" with the name if provided and significantly different from default.
    // Actually, for a "Member Card", having the User's Name is standard.
    // So we default to "ÉDITION BIOGRAPHIQUE" if no name, else use Name.

    const displayTitle = name === "ÉDITION BIOGRAPHIQUE" || !name ? "ÉDITION\nBIOGRAPHIQUE" : name;

    return (
        <div className="loomina-card-container">
            <div className="loomina-card-dark">
                <div className="glow-effect"></div>

                <div className="card-content">
                    <div className="header-row">
                        <span className="access-label">MEMBRE ACCRÉDITÉ</span>
                        <span className="card-chip">✦</span>
                    </div>

                    <div className="main-title-block">
                        <h2 className="brand-text">Loomina</h2>
                        {/* We allow newlines in displayTitle if it's the default text */}
                        <h1 className="member-status" style={{ whiteSpace: 'pre-line' }}>
                            {displayTitle}
                        </h1>
                    </div>

                    <div className="footer-row">
                        <div className="code-block">
                            <label>ID MEMBRE</label>
                            <span className="code-value">{memberId}</span>
                        </div>
                        <div className="signature-block">
                            <span className="start-date">ACCÈS VALIDE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
