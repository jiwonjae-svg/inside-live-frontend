import React, { useState, useEffect } from 'react';
import './App.css';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  initializeSampleData
} from './services/postService';

function App() {
  const [posts, setPosts] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'create', 'edit'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Load posts on component mount
  useEffect(() => {
    initializeSampleData();
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts = getAllPosts();
    setPosts(allPosts);
  };

  const handleSelectPost = (postId) => {
    const post = getPostById(postId);
    setSelectedPost(post);
    setSelectedPostId(postId);
    setCurrentView('detail');
  };

  const handleNewPost = () => {
    setSelectedPost(null);
    setSelectedPostId(null);
    setCurrentView('create');
  };

  const handleEditPost = (postId) => {
    const post = getPostById(postId);
    setSelectedPost(post);
    setSelectedPostId(postId);
    setCurrentView('edit');
  };

  const handleSavePost = (postData) => {
    if (currentView === 'create') {
      createPost(postData);
    } else if (currentView === 'edit') {
      updatePost(selectedPostId, postData);
    }
    loadPosts();
    setCurrentView('list');
  };

  const handleDeletePost = (postId) => {
    deletePost(postId);
    loadPosts();
    setCurrentView('list');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPost(null);
    setSelectedPostId(null);
  };

  return (
    <div className="App">
      {currentView === 'list' && (
        <PostList
          posts={posts}
          onSelectPost={handleSelectPost}
          onNewPost={handleNewPost}
        />
      )}

      {currentView === 'detail' && selectedPost && (
        <PostDetail
          post={selectedPost}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onBack={handleBackToList}
        />
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <PostForm
          post={currentView === 'edit' ? selectedPost : null}
          onSave={handleSavePost}
          onCancel={handleBackToList}
        />
      )}
    </div>
  );
}

export default App;
