import React from 'react';
import './PostDetail.css';

const PostDetail = ({ post, onEdit, onDelete, onBack }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      onDelete(post.id);
    }
  };

  return (
    <div className="post-detail">
      <div className="post-detail-header">
        <h1>{post.title}</h1>
        <div className="post-detail-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            목록으로
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(post.id)}>
            수정
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            삭제
          </button>
        </div>
      </div>

      <div className="post-detail-meta">
        <div className="meta-item">
          <span className="meta-label">작성자:</span>
          <span className="meta-value">{post.author}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">작성일:</span>
          <span className="meta-value">{formatDate(post.createdAt)}</span>
        </div>
        {post.createdAt !== post.updatedAt && (
          <div className="meta-item">
            <span className="meta-label">수정일:</span>
            <span className="meta-value">{formatDate(post.updatedAt)}</span>
          </div>
        )}
      </div>

      <div className="post-detail-content">
        {post.content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export default PostDetail;
