import React, { useState, useEffect } from 'react';
import './PostForm.css';

const PostForm = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        author: post.author
      });
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }
    
    if (!formData.author.trim()) {
      newErrors.author = '작성자를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="post-form">
      <div className="post-form-header">
        <h1>{post ? '게시글 수정' : '새 글 쓰기'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
            placeholder="제목을 입력하세요"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="author">작성자</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={errors.author ? 'error' : ''}
            placeholder="작성자를 입력하세요"
            disabled={post ? true : false}
          />
          {errors.author && <span className="error-message">{errors.author}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className={errors.content ? 'error' : ''}
            placeholder="내용을 입력하세요"
            rows="15"
          />
          {errors.content && <span className="error-message">{errors.content}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            {post ? '수정하기' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
