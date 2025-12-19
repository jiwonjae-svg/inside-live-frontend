// Service for managing bulletin board posts using localStorage
const STORAGE_KEY = 'bulletin_board_posts';

// Get all posts from localStorage
export const getAllPosts = () => {
  const posts = localStorage.getItem(STORAGE_KEY);
  return posts ? JSON.parse(posts) : [];
};

// Get a single post by ID
export const getPostById = (id) => {
  const posts = getAllPosts();
  return posts.find(post => post.id === parseInt(id));
};

// Create a new post
export const createPost = (post) => {
  const posts = getAllPosts();
  const newPost = {
    id: Date.now(),
    ...post,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return newPost;
};

// Update an existing post
export const updatePost = (id, updatedPost) => {
  const posts = getAllPosts();
  const index = posts.findIndex(post => post.id === parseInt(id));
  if (index !== -1) {
    posts[index] = {
      ...posts[index],
      ...updatedPost,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return posts[index];
  }
  return null;
};

// Delete a post
export const deletePost = (id) => {
  const posts = getAllPosts();
  const filteredPosts = posts.filter(post => post.id !== parseInt(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPosts));
  return true;
};

// Initialize with sample data if empty
export const initializeSampleData = () => {
  const posts = getAllPosts();
  if (posts.length === 0) {
    const samplePosts = [
      {
        id: 1,
        title: '게시판에 오신 것을 환영합니다',
        content: '이것은 React JS로 만든 CRUD 게시판입니다. 게시글을 자유롭게 작성, 수정, 삭제할 수 있습니다.',
        author: '관리자',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'React JS CRUD 게시판 사용법',
        content: '1. 목록 보기: 모든 게시글을 확인할 수 있습니다.\n2. 글쓰기: "새 글 쓰기" 버튼을 클릭하여 새 게시글을 작성합니다.\n3. 상세보기: 제목을 클릭하여 게시글의 전체 내용을 확인합니다.\n4. 수정하기: 상세보기에서 "수정" 버튼을 클릭합니다.\n5. 삭제하기: 상세보기에서 "삭제" 버튼을 클릭합니다.',
        author: '관리자',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePosts));
  }
};
