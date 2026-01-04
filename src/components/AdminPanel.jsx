import React, { useState, useEffect } from 'react';
import '../styles/AdminPanel.css';

function AdminPanel({ onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [deletedPostSearch, setDeletedPostSearch] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'deleted') {
      fetchDeletedPosts();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('사용자 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('게시물 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/deleted-posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('삭제된 게시물 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setDeletedPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('게시물 삭제에 실패했습니다.');
      }

      setMessage('게시물이 삭제되었습니다.');
      setTimeout(() => setMessage(''), 2000);
      fetchPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestorePost = async (postId) => {
    if (!window.confirm('이 게시물을 복원하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('게시물 복원에 실패했습니다.');
      }

      setMessage('게시물이 복원되었습니다.');
      setTimeout(() => setMessage(''), 2000);
      fetchDeletedPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePermanentDelete = async (postId) => {
    if (!window.confirm('게시물을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('게시물 영구 삭제에 실패했습니다.');
      }

      setMessage('게시물이 영구적으로 삭제되었습니다.');
      setTimeout(() => setMessage(''), 2000);
      fetchDeletedPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBanUser = (user) => {
    setSelectedUser(user);
    setBanReason(user.banReason || '');
    setShowBanModal(true);
  };

  const confirmBanUser = async () => {
    if (!selectedUser) return;

    if (!selectedUser.isBanned && !banReason.trim()) {
      setError('차단 사유를 입력해주세요.');
      return;
    }

    try {
      const endpoint = selectedUser.isBanned 
        ? `http://localhost:5000/api/admin/users/${selectedUser._id}/unban`
        : `http://localhost:5000/api/admin/users/${selectedUser._id}/ban`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ banReason })
      });

      if (!response.ok) {
        throw new Error(selectedUser.isBanned ? '차단 해제에 실패했습니다.' : '사용자 차단에 실패했습니다.');
      }

      setMessage(selectedUser.isBanned ? '차단이 해제되었습니다.' : '사용자가 차단되었습니다.');
      setTimeout(() => setMessage(''), 2000);
      setShowBanModal(false);
      setSelectedUser(null);
      setBanReason('');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  return (
    <div className="admin-overlay">
      <div className="admin-modal">
        <div className="admin-header">
          <h2>관리자 패널</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            회원 목록
          </button>
          <button 
            className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            게시물 관리
          </button>
          <button 
            className={`admin-tab ${activeTab === 'deleted' ? 'active' : ''}`}
            onClick={() => setActiveTab('deleted')}
          >
            삭제된 게시물
          </button>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="users-list">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="사용자 이름 검색..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>사용자명</th>
                        <th>이메일</th>
                        <th>권한</th>
                        <th>상태</th>
                        <th>가입일</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(user => 
                          user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(userSearch.toLowerCase())
                        )
                        .map(user => (
                        <tr key={user._id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role === 'admin' ? '관리자' : '일반'}
                            </span>
                          </td>
                          <td>
                            {user.isBanned ? (
                              <span className="status-badge banned" title={user.banReason}>
                                차단됨
                              </span>
                            ) : (
                              <span className="status-badge active">
                                활동
                              </span>
                            )}
                          </td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            {user.role !== 'admin' && (
                              <button 
                                className={user.isBanned ? 'btn-unban' : 'btn-ban'}
                                onClick={() => handleBanUser(user)}
                              >
                                {user.isBanned ? '차단 해제' : '차단'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <p className="empty-message">회원이 없습니다.</p>}
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="posts-list">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="게시물 제목 검색..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>카테고리</th>
                        <th>작성일</th>
                        <th>조회수</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts
                        .filter(post => 
                          post.title.toLowerCase().includes(postSearch.toLowerCase()) ||
                          post.author?.username.toLowerCase().includes(postSearch.toLowerCase())
                        )
                        .map(post => (
                        <tr key={post._id}>
                          <td className="post-title">{post.title}</td>
                          <td>{post.author?.username || '알 수 없음'}</td>
                          <td>{post.category}</td>
                          <td>{formatDate(post.createdAt)}</td>
                          <td>{post.views || 0}</td>
                          <td>
                            <button 
                              className="btn-delete-small"
                              onClick={() => handleDeletePost(post._id)}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {posts.length === 0 && <p className="empty-message">게시물이 없습니다.</p>}
                </div>
              )}

              {activeTab === 'deleted' && (
                <div className="deleted-posts-list">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="삭제된 게시물 검색..."
                      value={deletedPostSearch}
                      onChange={(e) => setDeletedPostSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>카테고리</th>
                        <th>삭제일</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedPosts
                        .filter(post => 
                          post.title.toLowerCase().includes(deletedPostSearch.toLowerCase()) ||
                          post.author?.username.toLowerCase().includes(deletedPostSearch.toLowerCase())
                        )
                        .map(post => (
                        <tr key={post._id}>
                          <td className="post-title deleted">{post.title}</td>
                          <td>{post.author?.username || '알 수 없음'}</td>
                          <td>{post.category}</td>
                          <td>{formatDate(post.deletedAt || post.updatedAt)}</td>
                          <td>
                            <button 
                              className="btn-restore"
                              onClick={() => handleRestorePost(post._id)}
                            >
                              복원
                            </button>
                            <button 
                              className="btn-permanent-delete"
                              onClick={() => handlePermanentDelete(post._id)}
                            >
                              영구 삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {deletedPosts.length === 0 && <p className="empty-message">삭제된 게시물이 없습니다.</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* 차단 모달 */}
        {showBanModal && selectedUser && (
          <div className="ban-modal-overlay">
            <div className="ban-modal">
              <h3>{selectedUser.isBanned ? '차단 해제' : '사용자 차단'}</h3>
              {selectedUser.isBanned ? (
                <>
                  <p className="warning-text">
                    <strong>{selectedUser.username}</strong>님의 차단을 해제하시겠습니까?
                  </p>
                  {selectedUser.banReason && (
                    <div className="ban-info">
                      <strong>차단 사유:</strong> {selectedUser.banReason}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="warning-text">
                    <strong>{selectedUser.username}</strong>님을 차단하시겠습니까?<br />
                    차단된 사용자는 게시글과 댓글을 작성할 수 없습니다.
                  </p>
                  <div className="form-group">
                    <label htmlFor="banReason">차단 사유</label>
                    <textarea
                      id="banReason"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="차단 사유를 입력하세요"
                      rows="4"
                      required
                    />
                  </div>
                </>
              )}
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                    setBanReason('');
                    setError('');
                  }}
                >
                  취소
                </button>
                <button 
                  type="button" 
                  className={selectedUser.isBanned ? 'btn-unban' : 'btn-ban'}
                  onClick={confirmBanUser}
                >
                  {selectedUser.isBanned ? '차단 해제' : '차단하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
