import React, { useState } from 'react';
import './BoardHome.css';

function BoardHome({ posts, currentUser, onSelectBoard, onSelectPost }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteBoards, setFavoriteBoards] = useState({});
  const [recentBoards, setRecentBoards] = useState([]);

  const boards = [
    { id: 'comic', name: '만화', icon: '📚', color: '#FF6B6B' },
    { id: 'game', name: '게임', icon: '🎮', color: '#4ECDC4' },
    { id: 'movie', name: '영화', icon: '🎬', color: '#95E1D3' },
    { id: 'book', name: '책', icon: '📖', color: '#F38181' },
    { id: 'music', name: '음악', icon: '🎵', color: '#AA96DA' },
    { id: 'sports', name: '스포츠', icon: '⚽', color: '#FCBAD3' }
  ];

  // 즐겨찾기 및 최근 방문 게시판 불러오기
  React.useEffect(() => {
    if (currentUser) {
      const savedFavorites = JSON.parse(localStorage.getItem('favoriteBoards') || '{}');
      setFavoriteBoards(savedFavorites);
      
      const savedRecent = JSON.parse(localStorage.getItem('recentBoards') || '{}');
      const userRecent = savedRecent[currentUser.username] || [];
      setRecentBoards(userRecent);
    }
  }, [currentUser]);

  // 최근 방문 게시판 제거
  const handleRemoveRecentBoard = (e, boardId) => {
    e.stopPropagation();
    const savedRecent = JSON.parse(localStorage.getItem('recentBoards') || '{}');
    let userRecent = savedRecent[currentUser.username] || [];
    userRecent = userRecent.filter(id => id !== boardId);
    savedRecent[currentUser.username] = userRecent;
    localStorage.setItem('recentBoards', JSON.stringify(savedRecent));
    setRecentBoards(userRecent);
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = (e, boardId) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const savedFavorites = JSON.parse(localStorage.getItem('favoriteBoards') || '{}');
    let userFavorites = savedFavorites[currentUser.username] || [];

    if (userFavorites.includes(boardId)) {
      userFavorites = userFavorites.filter(id => id !== boardId);
    } else {
      userFavorites.push(boardId);
    }

    savedFavorites[currentUser.username] = userFavorites;
    localStorage.setItem('favoriteBoards', JSON.stringify(savedFavorites));
    setFavoriteBoards(savedFavorites);
  };

  const isFavorite = (boardId) => {
    if (!currentUser) return false;
    const userFavorites = favoriteBoards[currentUser.username] || [];
    return userFavorites.includes(boardId);
  };

  const getBoardPosts = (boardId) => {
    return posts
      .filter(post => post.category === boardId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  // 게시판 검색 필터링
  const filteredBoards = boards.filter(board => 
    board.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="board-home">
      {/* 게시판 검색 */}
      <div className="board-search-container">
        <input
          type="text"
          placeholder="게시판 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="board-search-input"
        />
        {searchTerm && (
          <button className="btn-clear-board-search" onClick={() => setSearchTerm('')}>
            ✕
          </button>
        )}
      </div>

      {/* 최근 방문한 게시판 */}
      {currentUser && recentBoards.length > 0 && (
        <div className="recent-boards-section">
          <h3>최근 방문한 게시판</h3>
          <div className="recent-boards-list">
            {recentBoards.map(boardId => {
              const board = boards.find(b => b.id === boardId);
              if (!board) return null;
              return (
                <div 
                  key={boardId} 
                  className="recent-board-item"
                  onClick={() => onSelectBoard(boardId)}
                >
                  <span className="recent-board-icon">{board.icon}</span>
                  <span className="recent-board-name">{board.name}</span>
                  <button
                    className="btn-remove-recent"
                    onClick={(e) => handleRemoveRecentBoard(e, boardId)}
                    title="목록에서 제거"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="boards-grid">
        {filteredBoards.map(board => {
          const boardPosts = getBoardPosts(board.id);
          return (
            <div key={board.id} className="board-card" style={{ borderTopColor: board.color }}>
              <div className="board-header" onClick={() => onSelectBoard(board.id)}>
                <span className="board-icon">{board.icon}</span>
                <h2 className="board-name">{board.name} 게시판</h2>
                {currentUser && (
                  <button
                    className={`btn-board-favorite ${isFavorite(board.id) ? 'favorited' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, board.id)}
                    title={isFavorite(board.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    {isFavorite(board.id) ? '★' : '☆'}
                  </button>
                )}
                <span className="board-arrow">→</span>
              </div>
              <div className="board-posts">
                {boardPosts.length > 0 ? (
                  <ul>
                    {boardPosts.map((post, index) => (
                      <li key={post.id} onClick={() => onSelectPost(post.id)}>
                        <span className="post-number">{index + 1}</span>
                        <span className="post-title">{post.title}</span>
                        <div className="post-meta">
                          <span>👁️ {post.views}</span>
                          <span>❤️ {post.likes}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-posts">아직 게시글이 없습니다</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredBoards.length === 0 && (
        <div className="no-boards-message">
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default BoardHome;
