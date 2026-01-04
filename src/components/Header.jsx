import React from 'react';
import './Header.css';

function Header({ currentUser, onLogout, onOpenProfile, onHome, onGoToMyActivity, onOpenMessageForm, onOpenAdmin, notifications = [] }) {
  // 읽지 않은 알림 개수 계산
  const unreadCount = currentUser 
    ? notifications.filter(n => !n.read && n.userId === currentUser.username).length 
    : 0;

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="logo" onClick={onHome} style={{ cursor: 'pointer' }}>
          Inside Live
        </h1>
        {currentUser && (
          <div className="user-info">
            <span className="welcome">환영합니다, <strong>{currentUser.username}</strong>님!
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </span>
            <button className="btn-message" onClick={onOpenMessageForm}>
              메시지
            </button>
            <button className="btn-myactivity" onClick={onGoToMyActivity}>
              내 활동
            </button>
            {currentUser.role === 'admin' && (
              <button className="btn-admin" onClick={onOpenAdmin}>
                관리자
              </button>
            )}
            <button className="btn-profile" onClick={onOpenProfile}>
              회원정보
            </button>
            <button className="btn-logout" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
