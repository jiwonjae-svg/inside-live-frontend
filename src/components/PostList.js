import React from 'react';
import './PostList.css';

const PostList = ({ posts, onSelectPost, onNewPost }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="post-list">
      <div className="post-list-header">
        <h1>게시판</h1>
        <button className="btn btn-primary" onClick={onNewPost}>
          새 글 쓰기
        </button>
      </div>
      
      <div className="post-count">
        전체 게시글: {posts.length}개
      </div>

      <table className="post-table">
        <thead>
          <tr>
            <th className="col-id">번호</th>
            <th className="col-title">제목</th>
            <th className="col-author">작성자</th>
            <th className="col-date">작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-posts">
                등록된 게시글이 없습니다.
              </td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post.id} onClick={() => onSelectPost(post.id)} className="post-row">
                <td className="col-id">{posts.length - index}</td>
                <td className="col-title">{post.title}</td>
                <td className="col-author">{post.author}</td>
                <td className="col-date">{formatDate(post.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PostList;
