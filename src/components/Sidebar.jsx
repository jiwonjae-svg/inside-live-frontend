import React, { useMemo } from 'react';
import './Sidebar.css';

function Sidebar({ posts, onSelectPost }) {
  // 오늘 날짜의 인기 게시글 (좋아요 기준 상위 5개)
  const popularPosts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return posts
      .filter(post => {
        const postDate = new Date(post.date);
        postDate.setHours(0, 0, 0, 0);
        return postDate.getTime() === today.getTime();
      })
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  }, [posts]);

  // 전체 인기 게시글 (오늘 게시글이 없을 경우)
  const allTimePopular = useMemo(() => {
    return posts
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  }, [posts]);

  const displayPosts = popularPosts.length > 0 ? popularPosts : allTimePopular;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3 className="sidebar-title">
          🔥 {popularPosts.length > 0 ? '일일 인기 게시글' : '인기 게시글'}
        </h3>
        {displayPosts.length === 0 ? (
          <p className="no-posts">게시글이 없습니다</p>
        ) : (
          <ul className="popular-list">
            {displayPosts.map((post, index) => (
              <li
                key={post.id}
                className="popular-item"
                onClick={() => onSelectPost(post.id)}
              >
                <div className="rank">{index + 1}</div>
                <div className="popular-info">
                  <h4 className="popular-title">{post.title}</h4>
                  <div className="popular-meta">
                    <span className="likes">❤️ {post.likes}</span>
                    <span className="views">👁️ {post.views}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
