"use client";

import React from "react";

interface MemberCardProps {
    name?: string;
    memberId?: string;
}

export default function MemberCard({ name = "Membre Exclusif", memberId = "2024-LMN-ACCESS" }: MemberCardProps) {
    return (
        <>
            <div className="loomina-card-container">
                <div className="loomina-card">
                    <div className="card-header">
                        <h2 className="brand-name">Loomina</h2>
                        <div className="gold-badge">CARTE D'ACCÈS MEMBRE</div>
                    </div>

                    <div className="card-body">
                        <h1 className="member-title">{name}</h1>
                        <div className="separator-line"></div>
                    </div>

                    <div className="card-footer">
                        <div className="auth-signature">
                            <span>ID: {memberId}</span>
                        </div>
                        <div className="watermark-icon">✨</div>
                    </div>
                </div>
            </div>
        </>
    );
}
