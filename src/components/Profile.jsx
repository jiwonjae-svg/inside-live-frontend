import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile({ onClose }) {
  const { currentUser, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showUsernameChange, setShowUsernameChange] = useState(false);
  const [usernameChangePassword, setUsernameChangePassword] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setMessage('');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setError('');
    setMessage('');
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword) {
      setError('비밀번호를 입력하세요.');
      return;
    }

    try {
      // 백엔드 API로 비밀번호 확인 및 계정 삭제
      const response = await fetch('http://localhost:5000/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: deletePassword })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || '비밀번호가 일치하지 않습니다.');
        return;
      }

      // 비밀번호가 맞으면 계정 삭제
      await deleteAccount(currentUser.id);
      
      alert('회원탈퇴가 완료되었습니다.');
      logout();
      onClose();
    } catch (err) {
      setError('회원탈퇴 중 오류가 발생했습니다.');
    }
  };

  const handleUsernameChange = () => {
    setShowUsernameChange(true);
    setError('');
    setMessage('');
  };

  const confirmUsernameChange = async () => {
    if (!usernameChangePassword) {
      setError('비밀번호를 입력하세요.');
      return;
    }

    // 사용자명 중복 체크
    try {
      const checkResponse = await fetch('http://localhost:5000/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username })
      });

      const checkData = await checkResponse.json();
      
      if (!checkData.available) {
        setError('이미 사용 중인 사용자명입니다.');
        return;
      }
    } catch (err) {
      setError('사용자명 중복 확인 중 오류가 발생했습니다.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: usernameChangePassword })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || '비밀번호가 일치하지 않습니다.');
        return;
      }

      // 비밀번호 확인 후 사용자명 업데이트
      const updateResponse = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username: formData.username })
      });

      if (!updateResponse.ok) {
        const data = await updateResponse.json();
        throw new Error(data.error || data.message || '사용자명 변경에 실패했습니다.');
      }

      const data = await updateResponse.json();
      updateProfile(currentUser.id, data.user);
      setMessage('사용자명이 성공적으로 변경되었습니다.');
      setShowUsernameChange(false);
      setUsernameChangePassword('');
      
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (err) {
      setError(err.message || '사용자명 변경 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 비밀번호 변경만 처리
    if (!formData.newPassword) {
      setError('새 비밀번호를 입력하세요.');
      return;
    }

    if (!formData.currentPassword) {
      setError('현재 비밀번호를 입력하세요.');
      return;
    }

    // 백엔드 API로 현재 비밀번호 확인
    try {
      const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: formData.currentPassword })
      });

      if (!verifyResponse.ok) {
        setError('현재 비밀번호가 일치하지 않습니다.');
        return;
      }
    } catch (err) {
      setError('비밀번호 확인 중 오류가 발생했습니다.');
      return;
    }

    if (formData.newPassword.length < 4) {
      setError('새 비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const updatedData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      // 백엔드 API로 비밀번호 업데이트
      const response = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || '비밀번호 변경에 실패했습니다.');
      }

      const data = await response.json();
      updateProfile(currentUser.id, data.user);

      setMessage('비밀번호가 성공적으로 변경되었습니다.');

      // 2초 후 자동으로 닫기
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>회원정보 수정</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="사용자명을 입력하세요"
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                className="btn-change-username"
                onClick={handleUsernameChange}
                style={{ 
                  padding: '15px 24px',
                  background: '#0B1751',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
              >
                변경
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <div style={{ 
              padding: '12px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              color: '#666'
            }}>
              {formData.email}
            </div>
          </div>

          <div className="divider-line"></div>
          <p className="section-title">비밀번호 변경 (선택사항)</p>

          <div className="form-group">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="새 비밀번호를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-submit">
              비밀번호 변경
            </button>
          </div>
        </form>

        <div className="danger-zone">
          <h3>위험 구역</h3>
          <p>회원탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
          <button type="button" className="btn-delete-account" onClick={handleDeleteAccount}>
            회원탈퇴
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>회원탈퇴 확인</h3>
              <p className="warning-text">
                정말로 회원탈퇴하시겠습니까?<br />
                모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
              <div className="form-group">
                <label htmlFor="deletePassword">비밀번호 확인</label>
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoFocus
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setError('');
                }}>
                  취소
                </button>
                <button type="button" className="btn-delete-confirm" onClick={confirmDeleteAccount}>
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}

        {showUsernameChange && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>사용자명 변경</h3>
              <p className="warning-text">
                사용자명을 변경하시겠습니까?<br />
                보안을 위해 비밀번호를 입력해주세요.
              </p>
              <div className="form-group">
                <label htmlFor="usernameChangePassword">비밀번호 확인</label>
                <input
                  type="password"
                  id="usernameChangePassword"
                  value={usernameChangePassword}
                  onChange={(e) => setUsernameChangePassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoFocus
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowUsernameChange(false);
                  setUsernameChangePassword('');
                  setError('');
                }}>
                  취소
                </button>
                <button type="button" className="btn-submit" onClick={confirmUsernameChange}>
                  변경하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
