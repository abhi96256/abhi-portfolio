import React from 'react';
import '../../styles/AchievementsPanel.scss';

const AchievementsPanel = ({ isOpen, onClose }) => {
    const stats = [
        { id: 'exp', title: '2+', label: 'Years Experience', icon: '🕒' },
        { id: 'projects', title: '20+', label: 'Projects Completed', icon: '🚀' },
        { id: 'tools', title: '15+', label: 'Tools Mastered', icon: '🛠️' }
    ];

    return (
        <div className={`achievements-panel ${isOpen ? 'open' : ''}`} inert={!isOpen ? true : undefined}>
            <div className="achievements-card professional-stats">
                <div className="achievements-header">
                    <h3>PROFESSIONAL STATS</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close stats"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="achievements-list stats-list">
                    {stats.map((stat) => (
                        <div key={stat.id} className="achievement-item stat-item">
                            <div className="achievement-icon stat-icon">
                                <span>{stat.icon}</span>
                            </div>
                            <div className="achievement-text">
                                <div className="achievement-title stat-value">{stat.title}</div>
                                <div className="achievement-label stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="achievements-footer stats-footer">
                    <span>CRAFTING DIGITAL EXPERIENCES</span>
                </div>
            </div>
        </div>
    );
};

export default AchievementsPanel;
