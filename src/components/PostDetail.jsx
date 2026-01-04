import React, { useState } from 'react';
import './PostDetail.css';

function PostDetail({ post, currentUser, onEdit, onBack, onDelete, onToggleLike, onAddComment, onDeleteComment, allPosts, onSelectPost, onCreateNew }) {
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({}); // 각 댓글별 대댓글 입력
  const [showReplyForm, setShowReplyForm] = useState({}); // 답글 폼 표시 여부
  const [isScrapped, setIsScrapped] = useState(false);
  const [relatedSearchTerm, setRelatedSearchTerm] = useState('');
  const [relatedSearchType, setRelatedSearchType] = useState('titleContent'); // 'title', 'titleContent', 'comment', 'author'

  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  const isAuthor = currentUser && post.author === currentUser.username;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const isLiked = currentUser && post.likedBy && post.likedBy.includes(currentUser.username);

  // 스크랩 상태 확인
  React.useEffect(() => {
    const checkScrapStatus = async () => {
      if (currentUser && post.uuid) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const scraps = data.user.scraps || [];
            setIsScrapped(scraps.some(scrapId => scrapId === post._id));
          }
        } catch (error) {
          console.error('스크랩 상태 확인 실패:', error);
        }
      }
    };
    checkScrapStatus();
  }, [currentUser, post.uuid, post._id]);

  // 스크랩 토글
  const handleToggleScrap = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post.uuid}/scrap`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('스크랩 처리에 실패했습니다.');
      }

      const data = await response.json();
      setIsScrapped(data.isScrapped);
      alert(data.message);
    } catch (error) {
      console.error('스크랩 토글 실패:', error);
      alert('스크랩 처리에 실패했습니다.');
    }
  };

  // 같은 카테고리의 다른 게시글 (게시판 전체 검색)
  const relatedPosts = allPosts
    ? allPosts
        .filter(p => {
          if (p.category !== post.category || p.id === post.id) return false;
          if (!relatedSearchTerm) return true;
          
          const searchLower = relatedSearchTerm.toLowerCase();
          
          switch (relatedSearchType) {
            case 'title':
              return p.title.toLowerCase().includes(searchLower);
            case 'titleContent':
              return p.title.toLowerCase().includes(searchLower) ||
                     p.content.toLowerCase().includes(searchLower);
            case 'comment':
              return p.comments.some(comment => 
                comment.content.toLowerCase().includes(searchLower) ||
                (comment.replies && comment.replies.some(reply => 
                  reply.content.toLowerCase().includes(searchLower)
                ))
              );
            case 'author':
              return p.authorName.toLowerCase().includes(searchLower);
            default:
              return true;
          }
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20)
    : [];

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!commentText.trim()) {
      alert('댓글 내용을 입력하세요.');
      return;
    }
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  // 답글 폼 토글
  const toggleReplyForm = (commentId) => {
    setShowReplyForm(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // 대댓글 입력 변경
  const handleReplyTextChange = (commentId, text) => {
    setReplyTexts(prev => ({
      ...prev,
      [commentId]: text
    }));
  };

  // 대댓글 작성
  const handleSubmitReply = (commentId) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    const replyText = replyTexts[commentId];
    if (!replyText || !replyText.trim()) {
      alert('답글 내용을 입력하세요.');
      return;
    }
    onAddComment(post.id, replyText, commentId);
    setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
    setShowReplyForm(prev => ({ ...prev, [commentId]: false }));
  };

  // 댓글 총 개수 계산 (댓글 + 대댓글)
  const getTotalCommentCount = () => {
    if (!post.comments) return 0;
    return post.comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);
  };

  return (
    <div className="post-detail-container">
      <div className="detail-header">
        <div className="detail-title-wrapper">
          <h2>{post.title}</h2>
          <div className="detail-info">
            <span>작성자: {post.authorName || post.author}</span>
            <span>작성일: {new Date(post.date).toLocaleString()}</span>
            <span>조회수: {post.views}</span>
            <span>좋아요: {post.likes || 0}</span>
          </div>
        </div>
        {currentUser && (
          <button className="btn-write-new" onClick={onCreateNew}>
            글쓰기
          </button>
        )}
      </div>
      
      <div className="detail-content">
        {/* 텍스트와 이미지를 함께 렌더링 */}
        {(() => {
          const content = post.content;
          const imageRegex = /\[IMG:([^:]+):([^\]]+)\]/g;
          const parts = [];
          let lastIndex = 0;
          let match;

          while ((match = imageRegex.exec(content)) !== null) {
            // 이미지 마커 앞의 텍스트 추가
            if (match.index > lastIndex) {
              parts.push({
                type: 'text',
                content: content.substring(lastIndex, match.index)
              });
            }
            // 이미지 추가
            parts.push({
              type: 'image',
              name: match[1],
              url: match[2]
            });
            lastIndex = match.index + match[0].length;
          }

          // 마지막 텍스트 추가
          if (lastIndex < content.length) {
            parts.push({
              type: 'text',
              content: content.substring(lastIndex)
            });
          }

          return parts.map((part, index) => {
            if (part.type === 'text') {
              return <p key={index} style={{ whiteSpace: 'pre-wrap' }}>{part.content}</p>;
            } else {
              return (
                <div key={index} className="inline-image">
                  <img src={part.url} alt={part.name} />
                </div>
              );
            }
          });
        })()}
        
        {/* 비디오 파일은 별도 섹션에 표시 */}
        {post.media && post.media.filter(m => m.type === 'video').length > 0 && (
          <div className="media-section">
            {post.media.filter(m => m.type === 'video').map((media, index) => (
              <div key={index} className="media-item">
                <video controls>
                  <source src={media.url} />
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="detail-like-section">
        <button
          className={`btn-like-large ${isLiked ? 'liked' : ''}`}
          onClick={() => onToggleLike(post.id)}
        >
          {isLiked ? '❤️' : '🤍'} 좋아요 {post.likes || 0}
        </button>
        <button
          className={`btn-scrap ${isScrapped ? 'scrapped' : ''}`}
          onClick={handleToggleScrap}
        >
          {isScrapped ? '📌' : '📍'} {isScrapped ? '스크랩됨' : '스크랩'}
        </button>
      </div>

      {/* 댓글 섹션 */}
      <div className="comments-section">
        <h3>댓글 {getTotalCommentCount()}개</h3>
        
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={currentUser ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
            rows="3"
            disabled={!currentUser}
          />
          <button type="submit" className="btn-comment-submit" disabled={!currentUser}>
            댓글 작성
          </button>
        </form>

        <div className="comments-list">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => {
              const isCommentAuthor = currentUser && comment.author === currentUser.username;
              return (
                <div key={comment.id} className="comment-wrapper">
                  <div className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.authorName || comment.author}</span>
                      <span className="comment-date">
                        {new Date(comment.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      {currentUser && (
                        <button
                          className="btn-reply"
                          onClick={() => toggleReplyForm(comment.id)}
                        >
                          답글
                        </button>
                      )}
                      {isCommentAuthor && (
                        <button
                          className="btn-comment-delete"
                          onClick={() => {
                            if (window.confirm('댓글을 삭제하시겠습니까?')) {
                              onDeleteComment(post.id, comment.id);
                            }
                          }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 답글 작성 폼 */}
                  {showReplyForm[comment.id] && currentUser && (
                    <div className="reply-form">
                      <textarea
                        value={replyTexts[comment.id] || ''}
                        onChange={(e) => handleReplyTextChange(comment.id, e.target.value)}
                        placeholder="답글을 입력하세요..."
                        rows="2"
                      />
                      <div className="reply-form-actions">
                        <button
                          className="btn-reply-submit"
                          onClick={() => handleSubmitReply(comment.id)}
                        >
                          답글 작성
                        </button>
                        <button
                          className="btn-reply-cancel"
                          onClick={() => toggleReplyForm(comment.id)}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 대댓글 목록 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-list">
                      {comment.replies.map((reply) => {
                        const isReplyAuthor = currentUser && reply.author === currentUser.username;
                        return (
                          <div key={reply.id} className="reply-item">
                            <div className="reply-header">
                              <span className="reply-icon">↳</span>
                              <span className="reply-author">{reply.authorName || reply.author}</span>
                              <span className="reply-date">
                                {new Date(reply.date).toLocaleString()}
                              </span>
                            </div>
                            <div className="reply-content">{reply.content}</div>
                            {isReplyAuthor && (
                              <button
                                className="btn-reply-delete"
                                onClick={() => {
                                  if (window.confirm('답글을 삭제하시겠습니까?')) {
                                    onDeleteComment(post.id, reply.id, comment.id);
                                  }
                                }}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="no-comments">첫 댓글을 작성해보세요!</p>
          )}
        </div>
      </div>
      
      <div className="detail-actions">
        <button className="btn-back" onClick={() => onBack(post.category)}>목록</button>
        <div>
          {(isAuthor || isAdmin) && (
            <>
              {isAuthor && (
                <button className="btn-edit" onClick={() => onEdit(post)}>수정</button>
              )}
              <button 
                className="btn-delete" 
                onClick={() => {
                  if (window.confirm('정말 삭제하시겠습니까?')) {
                    onDelete(post.id);
                  }
                }}
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 관련 게시글 */}
      {allPosts && allPosts.filter(p => p.category === post.category && p.id !== post.id).length > 0 && (
        <div className="related-posts">
          <h3>같은 게시판의 다른 글 (전체 검색)</h3>
          <div className="related-search-bar">
            <select 
              value={relatedSearchType} 
              onChange={(e) => setRelatedSearchType(e.target.value)}
              className="related-search-type-select"
            >
              <option value="title">제목</option>
              <option value="titleContent">제목+내용</option>
              <option value="comment">댓글</option>
              <option value="author">작성자</option>
            </select>
            <input
              type="text"
              placeholder={`${
                relatedSearchType === 'title' ? '제목' :
                relatedSearchType === 'titleContent' ? '제목 또는 내용' :
                relatedSearchType === 'comment' ? '댓글' :
                '작성자'
              }으로 검색...`}
              value={relatedSearchTerm}
              onChange={(e) => setRelatedSearchTerm(e.target.value)}
              className="related-search-input"
            />
            {relatedSearchTerm && (
              <button className="btn-clear-related-search" onClick={() => setRelatedSearchTerm('')}>
                ✕
              </button>
            )}
          </div>
          {relatedPosts.length > 0 ? (
            <ul className="related-list">
              {relatedPosts.map(relatedPost => (
                <li key={relatedPost.id} onClick={() => onSelectPost(relatedPost.id)}>
                  <span className="related-title">{relatedPost.title}</span>
                  <span className="related-meta">
                    <span>👁️ {relatedPost.views}</span>
                    <span>❤️ {relatedPost.likes}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-related-posts">검색 결과가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default PostDetail;
