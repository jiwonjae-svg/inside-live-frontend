import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import FindAccount from './components/FindAccount';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import BoardHome from './components/BoardHome';
import MyActivity from './components/MyActivity';
import NotificationToast from './components/NotificationToast';
import MessageForm from './components/MessageForm';
import DynamicBackground from './components/DynamicBackground';
import './App.css';

// UUID 생성 함수
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 추가 게시글 생성 함수
const generateMorePosts = (startId) => {
  const categories = ['comic', 'game', 'movie', 'book', 'music', 'sports'];
  const titles = {
    comic: ['최신 웹툰 추천', '만화 리뷰', '작가 인터뷰', '신작 소식', '명작 회고'],
    game: ['게임 공략', '신작 리뷰', '업데이트 소식', '팁과 트릭', '커뮤니티 이벤트'],
    movie: ['영화 리뷰', '감독 특집', '추천 작품', '시리즈 분석', 'OST 감상'],
    book: ['독서 후기', '작가 분석', '책 추천', '북클럽 모임', '베스트셀러'],
    music: ['앨범 리뷰', '콘서트 후기', '아티스트 소개', '플레이리스트', '신곡 발매'],
    sports: ['경기 결과', '선수 분석', '팀 전략', '스포츠 뉴스', '경기 일정']
  };
  
  const posts = [];
  let id = startId;
  
  for (let i = 0; i < 150; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const titleOptions = titles[category];
    const title = `${titleOptions[Math.floor(Math.random() * titleOptions.length)]} #${i + 1}`;
    const content = `이것은 ${category} 게시판의 테스트 게시글입니다. 페이지네이션 기능을 테스트하기 위한 샘플 데이터입니다.`;
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);
    
    posts.push({
      id: id++,
      uuid: generateUUID(),
      title,
      author: `user${Math.floor(Math.random() * 50)}`,
      authorName: `user${Math.floor(Math.random() * 50)}`,
      content,
      date: date.toISOString(),
      views: Math.floor(Math.random() * 500),
      likes: Math.floor(Math.random() * 100),
      likedBy: [],
      comments: [],
      media: [],
      category
    });
  }
  
  return posts;
};

// 초기 샘플 데이터 - 각 게시판별 5개씩
const initialPosts = [
  // 만화 게시판
  { id: 1, title: '원피스 최신화 스포 주의!', author: 'comic_fan', authorName: 'comic_fan', content: '루피의 새로운 능력이 드디어 공개되었습니다! 정말 대박이네요.', date: new Date('2025-12-20T09:00:00').toISOString(), views: 152, likes: 45, likedBy: [], comments: [], media: [], category: 'comic' },
  { id: 2, title: '나혼자만 레벨업 웹툰 리뷰', author: 'webtoon_lover', authorName: 'webtoon_lover', content: '소설과는 또 다른 재미가 있네요. 작화가 정말 최고입니다.', date: new Date('2025-12-19T14:30:00').toISOString(), views: 98, likes: 32, likedBy: [], comments: [], media: [], category: 'comic' },
  { id: 3, title: '귀멸의 칼날 완결 소감', author: 'manga_master', authorName: 'manga_master', content: '드디어 완결됐네요. 정말 명작이었습니다. 감동적인 엔딩이었어요.', date: new Date('2025-12-18T11:20:00').toISOString(), views: 203, likes: 67, likedBy: [], comments: [], media: [], category: 'comic' },
  { id: 4, title: '추천 웹툰 좀 알려주세요', author: 'newbie_reader', authorName: 'newbie_reader', content: '요즘 볼만한 웹툰이 뭐가 있을까요? 장르는 판타지나 액션 좋아합니다.', date: new Date('2025-12-17T16:45:00').toISOString(), views: 76, likes: 18, likedBy: [], comments: [], media: [], category: 'comic' },
  { id: 5, title: '슬램덩크 완전판 구매했어요', author: 'basketball_fan', authorName: 'basketball_fan', content: '어릴 때 봤던 추억의 만화를 완전판으로 다시 모으고 있습니다.', date: new Date('2025-12-16T10:00:00').toISOString(), views: 54, likes: 23, likedBy: [], comments: [], media: [], category: 'comic' },
  
  // 게임 게시판
  { id: 6, title: 'LOL 시즌15 티어 예측', author: 'gamer_pro', authorName: 'gamer_pro', content: '이번 시즌 메타가 많이 바뀔 것 같은데 여러분 생각은 어떤가요?', date: new Date('2025-12-20T10:30:00').toISOString(), views: 187, likes: 52, likedBy: [], comments: [], media: [], category: 'game' },
  { id: 7, title: '젤다의 전설 공략 팁 공유', author: 'zelda_master', authorName: 'zelda_master', content: '신전 공략하다가 알게 된 꿀팁들 공유합니다. 초보자분들 참고하세요!', date: new Date('2025-12-19T15:20:00').toISOString(), views: 134, likes: 41, likedBy: [], comments: [], media: [], category: 'game' },
  { id: 8, title: '스팀 겨울 세일 추천작', author: 'steam_hunter', authorName: 'steam_hunter', content: '올해 스팀 세일에서 꼭 사야할 게임들 정리했습니다. 할인율 미쳤어요.', date: new Date('2025-12-18T13:00:00').toISOString(), views: 241, likes: 78, likedBy: [], comments: [], media: [], category: 'game' },
  { id: 9, title: '발로란트 에이스 장면 모음', author: 'valorant_ace', authorName: 'valorant_ace', content: '이번 주에 했던 경쟁전에서 에이스 3번이나 했습니다 ㅋㅋ', date: new Date('2025-12-17T19:30:00').toISOString(), views: 95, likes: 29, likedBy: [], comments: [], media: [], category: 'game' },
  { id: 10, title: '포켓몬스터 신작 어때요?', author: 'pokemon_trainer', authorName: 'pokemon_trainer', content: '새로 나온 포켓몬 게임 재밌나요? 구매 고민 중입니다.', date: new Date('2025-12-16T12:15:00').toISOString(), views: 112, likes: 34, likedBy: [], comments: [], media: [], category: 'game' },
  
  // 영화 게시판
  { id: 11, title: '인터스텔라 다시 봤는데...', author: 'movie_buff', authorName: 'movie_buff', content: '볼 때마다 새로운 감동을 주는 영화입니다. 놀란 감독 최고!', date: new Date('2025-12-20T11:00:00').toISOString(), views: 156, likes: 63, likedBy: [], comments: [], media: [], category: 'movie' },
  { id: 12, title: '오펜하이머 IMAX 후기', author: 'imax_lover', authorName: 'imax_lover', content: 'IMAX로 보니까 완전 다른 영화네요. 꼭 IMAX로 보세요!', date: new Date('2025-12-19T16:00:00').toISOString(), views: 189, likes: 71, likedBy: [], comments: [], media: [], category: 'movie' },
  { id: 13, title: '넷플릭스 추천작 좀 부탁드려요', author: 'netflix_fan', authorName: 'netflix_fan', content: '주말에 볼만한 영화나 드라마 추천해주세요. 장르 안 가립니다!', date: new Date('2025-12-18T14:30:00').toISOString(), views: 143, likes: 38, likedBy: [], comments: [], media: [], category: 'movie' },
  { id: 14, title: '기생충 4K 리마스터 대박', author: 'korean_cinema', authorName: 'korean_cinema', content: '4K로 다시 보니 디테일이 더 잘 보이네요. 명작은 역시 명작.', date: new Date('2025-12-17T17:00:00').toISOString(), views: 127, likes: 49, likedBy: [], comments: [], media: [], category: 'movie' },
  { id: 15, title: '어벤져스 엔드게임 재개봉', author: 'marvel_fan', authorName: 'marvel_fan', content: '극장에서 다시 보니 눈물이... 토니 스타크를 잊을 수 없어요.', date: new Date('2025-12-16T13:45:00').toISOString(), views: 201, likes: 82, likedBy: [], comments: [], media: [], category: 'movie' },
  
  // 책 게시판
  { id: 16, title: '데미안 읽고 나서...', author: 'book_worm', authorName: 'book_worm', content: '헤르만 헤세의 명작을 이제야 읽었습니다. 정말 대단한 책이네요.', date: new Date('2025-12-20T08:00:00').toISOString(), views: 89, likes: 27, likedBy: [], comments: [], media: [], category: 'book' },
  { id: 17, title: '미스터리 소설 추천해주세요', author: 'mystery_lover', authorName: 'mystery_lover', content: '애거서 크리스티 같은 추리소설 좋아하는데 비슷한 작품 추천 부탁드립니다.', date: new Date('2025-12-19T10:00:00').toISOString(), views: 72, likes: 19, likedBy: [], comments: [], media: [], category: 'book' },
  { id: 18, title: '1Q84 완독 후기', author: 'murakami_fan', authorName: 'murakami_fan', content: '무라카미 하루키의 장편을 드디어 다 읽었습니다. 어려웠지만 재밌었어요.', date: new Date('2025-12-18T15:30:00').toISOString(), views: 105, likes: 33, likedBy: [], comments: [], media: [], category: 'book' },
  { id: 19, title: '올해의 베스트 자기계발서', author: 'self_improvement', authorName: 'self_improvement', content: '2025년에 읽은 자기계발서 중 가장 도움된 책들을 정리했습니다.', date: new Date('2025-12-17T11:00:00').toISOString(), views: 167, likes: 54, likedBy: [], comments: [], media: [], category: 'book' },
  { id: 20, title: '해리포터 20주년 기념판', author: 'hogwarts_student', authorName: 'hogwarts_student', content: '어린 시절 추억의 책을 특별판으로 다시 구매했어요. 너무 예쁩니다.', date: new Date('2025-12-16T14:20:00').toISOString(), views: 94, likes: 41, likedBy: [], comments: [], media: [], category: 'book' },
  
  // 음악 게시판
  { id: 21, title: 'BTS 새 앨범 리뷰', author: 'kpop_lover', authorName: 'kpop_lover', content: '이번 앨범 타이틀곡 진짜 좋네요. 중독성 있어요!', date: new Date('2025-12-20T12:00:00').toISOString(), views: 223, likes: 89, likedBy: [], comments: [], media: [], category: 'music' },
  { id: 22, title: '클래식 입문 추천곡', author: 'classic_music', authorName: 'classic_music', content: '클래식 처음 듣는 분들을 위한 추천곡 리스트입니다. 쉬운 곡부터 시작하세요.', date: new Date('2025-12-19T13:00:00').toISOString(), views: 78, likes: 24, likedBy: [], comments: [], media: [], category: 'music' },
  { id: 23, title: '테일러 스위프트 콘서트 후기', author: 'swiftie_korea', authorName: 'swiftie_korea', content: '드디어 한국 공연 다녀왔습니다. 인생 콘서트였어요!', date: new Date('2025-12-18T18:00:00').toISOString(), views: 312, likes: 127, likedBy: [], comments: [], media: [], category: 'music' },
  { id: 24, title: '인디음악 숨은 명곡 공유', author: 'indie_hunter', authorName: 'indie_hunter', content: '잘 알려지지 않았지만 정말 좋은 인디 뮤지션들을 소개합니다.', date: new Date('2025-12-17T15:30:00').toISOString(), views: 145, likes: 52, likedBy: [], comments: [], media: [], category: 'music' },
  { id: 25, title: '올해 최고의 OST는?', author: 'ost_collector', authorName: 'ost_collector', content: '2025년에 나온 드라마/영화 OST 중 가장 좋았던 곡 투표해요.', date: new Date('2025-12-16T16:00:00').toISOString(), views: 198, likes: 76, likedBy: [], comments: [], media: [], category: 'music' },
  
  // 스포츠 게시판
  { id: 26, title: '손흥민 해트트릭 대박!', author: 'son_fan', authorName: 'son_fan', content: '오늘 경기 보셨나요? 손흥민 선수 해트트릭 달성! 자랑스럽습니다.', date: new Date('2025-12-20T07:00:00').toISOString(), views: 267, likes: 134, likedBy: [], comments: [], media: [], category: 'sports' },
  { id: 27, title: 'NBA 올스타 투표 시작', author: 'basketball_fan', authorName: 'basketball_fan', content: '올해는 누구를 뽑을까요? 여러분의 픽은?', date: new Date('2025-12-19T11:30:00').toISOString(), views: 123, likes: 43, likedBy: [], comments: [], media: [], category: 'sports' },
  { id: 28, title: '류현진 복귀전 승리!', author: 'baseball_lover', authorName: 'baseball_lover', content: '부상에서 돌아온 첫 경기를 승리로 장식했습니다. 축하합니다!', date: new Date('2025-12-18T12:00:00').toISOString(), views: 178, likes: 67, likedBy: [], comments: [], media: [], category: 'sports' },
  { id: 29, title: '프리미어리그 우승 예측', author: 'epl_expert', authorName: 'epl_expert', content: '이번 시즌 우승팀 예측해봅니다. 맨시티? 아스날? 리버풀?', date: new Date('2025-12-17T14:00:00').toISOString(), views: 156, likes: 58, likedBy: [], comments: [], media: [], category: 'sports' },
  { id: 30, title: '마라톤 완주 후기', author: 'runner_life', authorName: 'runner_life', content: '인생 첫 풀코스 마라톤 완주했습니다! 감동이에요.', date: new Date('2025-12-16T08:30:00').toISOString(), views: 87, likes: 39, likedBy: [], comments: [], media: [], category: 'sports' }
];

// 초기 데이터는 사용하지 않음 - 서버에서 불러옴
// const allInitialPosts = [...initialPosts, ...generateMorePosts(31)];

function MainApp() {
  const { currentUser, login, register, logout, findAccount, resetPassword, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [authView, setAuthView] = useState('main'); // 'main', 'login', 'register', 'find'
  const [posts, setPosts] = useState([]);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'board', 'detail', 'create', 'edit', 'myactivity'
  const [currentBoard, setCurrentBoard] = useState(null); // 현재 선택된 게시판
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [nextId, setNextId] = useState(181);
  const [notifications, setNotifications] = useState([]);
  const [currentToast, setCurrentToast] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showBannedModal, setShowBannedModal] = useState(false);
  const [bannedReason, setBannedReason] = useState('');
  const [loading, setLoading] = useState(true);

  // 게시글 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/posts?limit=1000');
        const data = await response.json();
        
        if (data.posts) {
          // MongoDB의 _id를 id로 변환하고 필요한 필드 정리
          const formattedPosts = data.posts.map(post => ({
            id: post._id,
            uuid: post.uuid,
            title: post.title,
            author: post.author?.username || post.author,
            authorName: post.author?.username || post.author,
            content: post.content,
            date: post.date || post.createdAt,
            views: post.views || 0,
            likes: post.likes || 0,
            likedBy: post.likedBy || [],
            comments: post.comments || [],
            media: post.media || [],
            category: post.category
          }));
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error('게시글 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    
    // 알림 불러오기
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(savedNotifications);
  }, []);

  // 알림 변경 시 localStorage에 저장
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // UUID 생성 함수
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // URL 해시 기반 라우팅
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // # 제거
      if (!hash) {
        setCurrentView('home');
        setCurrentBoard(null);
        setSelectedPost(null);
        return;
      }

      const [route, param] = hash.split('/');
      
      if (route === 'board' && param) {
        setCurrentBoard(param);
        setCurrentView('board');
        setSelectedPost(null);
      } else if (route === 'post' && param) {
        // UUID 또는 숫자 ID로 게시글 찾기
        const post = posts.find(p => p.uuid === param || p.id === parseInt(param));
        if (post) {
          setCurrentBoard(post.category);
          setSelectedPost(post);
          setCurrentView('detail');
        } else {
          alert('삭제되었거나 존재하지 않는 게시글입니다.');
          window.location.hash = '';
        }
      } else if (route === 'myactivity') {
        setCurrentView('myactivity');
        setSelectedPost(null);
      } else if (route === 'create') {
        // create 모드 - 카테고리 파라미터가 있으면 설정
        setCurrentView('create');
        setEditingPost(null);
        if (param) {
          setCurrentBoard(param);
        }
      } else if (route === 'edit' && param) {
        // edit 모드 - UUID로 게시글 찾기
        const post = posts.find(p => p.uuid === param || p.id === parseInt(param));
        if (post) {
          setEditingPost(post);
          setCurrentView('edit');
          setCurrentBoard(post.category);
        } else {
          alert('수정할 게시글을 찾을 수 없습니다.');
          window.location.hash = '';
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // 초기 로드시 실행

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [posts]);

  // 홈으로 이동
  const handleBackToHome = () => {
    window.location.hash = '';
    setCurrentView('home');
    setCurrentBoard(null);
    setSelectedPost(null);
    setEditingPost(null);
  };

  // 내 활동으로 이동
  const handleGoToMyActivity = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    window.location.hash = 'myactivity';
    setCurrentView('myactivity');
  };

  // 알림 추가
  const addNotification = (type, message, link, userId) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      link,
      userId,
      date: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setCurrentToast(newNotification);
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification) => {
    // 알림을 읽음으로 표시
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // localStorage에도 저장
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    // 토스트 닫기
    setCurrentToast(null);

    // 링크로 이동
    if (notification.link) {
      if (notification.link.startsWith('#post/')) {
        const uuid = notification.link.replace('#post/', '');
        // UUID로 게시글 찾기
        const post = posts.find(p => p.uuid === uuid);
        if (post) {
          handleSelectPost(post.id);
        }
      } else if (notification.link.startsWith('#board/')) {
        const boardId = notification.link.replace('#board/', '');
        handleSelectBoard(boardId);
      }
    }
  };

  // 게시판 선택
  const handleSelectBoard = (boardId) => {
    window.location.hash = `board/${boardId}`;
    setCurrentBoard(boardId);
    setCurrentView('board');
    setSelectedPost(null);
    setEditingPost(null);
    
    // 최근 방문 게시판 목록에 추가
    if (currentUser) {
      const savedRecent = JSON.parse(localStorage.getItem('recentBoards') || '{}');
      let userRecent = savedRecent[currentUser.username] || [];
      
      // 이미 있으면 제거 후 맨 앞에 추가
      userRecent = userRecent.filter(id => id !== boardId);
      userRecent.unshift(boardId);
      
      // 최대 5개까지만 유지
      if (userRecent.length > 5) {
        userRecent = userRecent.slice(0, 5);
      }
      
      savedRecent[currentUser.username] = userRecent;
      localStorage.setItem('recentBoards', JSON.stringify(savedRecent));
    }
  };

  // 게시글 목록으로 이동
  const handleBackToList = (postCategory) => {
    // 게시글의 카테고리가 있으면 해당 게시판으로, 없으면 현재 게시판 유지
    const targetBoard = postCategory || currentBoard;
    
    if (targetBoard) {
      // 게시판이 있으면 해당 게시판으로
      window.location.hash = `board/${targetBoard}`;
      setCurrentView('board');
      if (postCategory && postCategory !== currentBoard) {
        setCurrentBoard(postCategory);
      }
    } else {
      // 게시판이 없으면 홈으로
      window.location.hash = '';
      setCurrentView('home');
      setCurrentBoard(null);
    }
    
    setSelectedPost(null);
    setEditingPost(null);
  };

  // 게시글 선택 (상세보기)
  const handleSelectPost = (id) => {
    const post = posts.find(p => p.id === id || p.uuid === id);
    if (post) {
      window.location.hash = `post/${post.uuid || post.id}`;
      // 게시글의 카테고리를 currentBoard로 설정
      if (post.category) {
        setCurrentBoard(post.category);
      }
      // 조회수 증가
      const updatedPost = { ...post, views: post.views + 1 };
      setPosts(posts.map(p => 
        (p.id === post.id || p.uuid === post.uuid) ? updatedPost : p
      ));
      setSelectedPost(updatedPost);
      setCurrentView('detail');
    }
  };

  // 새 게시글 작성 페이지로 이동
  const handleCreateNew = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 이미 create 모드면 폼을 리셋하기 위해 nextId를 증가시켜 key로 사용
    if (currentView === 'create') {
      setNextId(prev => prev + 1);
    } else {
      // URL 해시 설정 (카테고리 정보 포함)
      if (currentBoard) {
        window.location.hash = `create/${currentBoard}`;
      } else {
        window.location.hash = 'create';
      }
    }
    
    setCurrentView('create');
    setEditingPost(null);
  };

  // 게시글 수정 페이지로 이동
  const handleEditPost = (post) => {
    window.location.hash = `edit/${post.uuid || post.id}`;
    setEditingPost(post);
    setCurrentView('edit');
  };

  // 게시글 생성
  const handleCreatePost = async (formData) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 최신 사용자 정보로 업데이트 (차단 해제 상태 반영)
    try {
      await refreshUser();
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
    }
    
    // 차단 여부 확인
    if (currentUser.isBanned) {
      setBannedReason(currentUser.banReason || '관리자에 의해 차단되었습니다.');
      setShowBannedModal(true);
      return;
    }
    
    try {
      // 서버에 게시글 저장
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category || currentBoard || 'comic',
          media: formData.media || []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '게시글 작성에 실패했습니다.');
      }

      const data = await response.json();
      
      // 게시글 목록 다시 불러오기
      try {
        const postsResponse = await fetch('http://localhost:5000/api/posts?limit=1000');
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          const formattedPosts = postsData.posts.map(post => ({
            id: post._id,
            uuid: post.uuid,
            title: post.title,
            author: post.author?.username || post.author,
            authorName: post.author?.name || post.author?.username || post.author,
            content: post.content,
            date: post.date || post.createdAt,
            views: post.views || 0,
            likes: post.likes || 0,
            likedBy: post.likedBy || [],
            comments: (post.comments || []).map(comment => ({
              id: comment._id,
              author: comment.author?.username || comment.author,
              authorName: comment.author?.name || comment.author?.username || comment.author,
              content: comment.content,
              date: comment.date || comment.createdAt,
              parentId: comment.parentId,
              replies: comment.replies || []
            })),
            media: post.media || [],
            category: post.category,
            _id: post._id
          }));
          setPosts(formattedPosts);
        } else {
          console.error('게시글 목록 불러오기 실패:', postsResponse.status);
        }
      } catch (fetchError) {
        console.error('게시글 목록 갱신 실패:', fetchError);
        // 목록 갱신 실패해도 작성은 성공한 것으로 처리
      }
      
      // 해당 카테고리 게시판으로 이동
      const targetCategory = formData.category || currentBoard || 'comic';
      window.location.hash = `board/${targetCategory}`;
      setCurrentBoard(targetCategory);
      setCurrentView('board');
      
      // 게시글 작성 알림
      addNotification(
        '게시글 작성',
        `새 게시글 "${formData.title}"이(가) 작성되었습니다.`,
        `#post/${data.post.uuid}`,
        currentUser.username
      );
      
      alert('게시글이 작성되었습니다!');
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      alert(error.message || '게시글 저장에 실패했습니다.');
    }
  };

  // 게시글 수정
  const handleUpdatePost = async (formData) => {
    if (!editingPost) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${editingPost.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          media: formData.media || []
        })
      });

      if (!response.ok) {
        throw new Error('게시글 수정에 실패했습니다.');
      }

      const data = await response.json();
      
      setPosts(posts.map(post =>
        post.uuid === editingPost.uuid
          ? {
              ...post,
              title: data.post.title,
              content: data.post.content,
              media: data.post.media || post.media,
              category: data.post.category
            }
          : post
      ));
      
      setCurrentView('board');
      setEditingPost(null);
      alert('게시글이 수정되었습니다!');
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다.');
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (id) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post.uuid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('게시글 삭제에 실패했습니다.');
      }

      setPosts(posts.filter(p => p.id !== id));
      setCurrentView('board');
      setSelectedPost(null);
      alert('게시글이 삭제되었습니다.');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // 좋아요 토글
  const handleToggleLike = async (postId) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post.uuid}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('좋아요 처리에 실패했습니다.');
      }

      const data = await response.json();

      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes: data.likes,
            likedBy: data.likedBy
          };
        }
        return p;
      }));

      // 상세보기 중이면 selectedPost도 업데이트
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          likes: data.likes,
          likedBy: data.likedBy
        });
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  // 댓글 추가 (댓글 또는 대댓글)
  const handleAddComment = async (postId, commentText, parentId = null) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 최신 사용자 정보로 업데이트
    try {
      await refreshUser();
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
    }
    
    // 차단 여부 확인
    if (currentUser.isBanned) {
      setBannedReason(currentUser.banReason || '관리자에 의해 차단되었습니다.');
      setShowBannedModal(true);
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          postUuid: post.uuid,
          content: commentText,
          parentId: parentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '댓글 작성에 실패했습니다.');
      }

      const data = await response.json();
      
      const newComment = {
        id: data.comment._id,
        author: currentUser.username,
        authorName: currentUser.username,
        content: commentText,
        date: data.comment.date || new Date().toISOString(),
        parentId: parentId,
        replies: []
      };

    setPosts(posts.map(p => {
      if (p.id === postId) {
        let updatedComments;
        
        if (parentId) {
          // 대댓글인 경우 - 부모 댓글을 찾아서 replies에 추가
          updatedComments = p.comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment]
              };
            }
            return comment;
          });
        } else {
          // 일반 댓글인 경우
          updatedComments = [...p.comments, newComment];
        }
        
        // 댄글 알림
        if (p.author !== currentUser.username) {
          // 다른 사람 글에 내가 댄글 달았을 때 - 그 사람에게 알림
          addNotification(
            '새 댄글',
            `"${p.title}" 게시글에 ${currentUser.username}님이 댄글을 달았습니다.`,
            `#post/${p.uuid || postId}`,
            p.author
          );
        } else {
          // 내 글에 내가 댄글 달았을 때 - 내게 알림
          addNotification(
            '댄글 작성',
            `"${p.title}" 게시글에 댄글을 달았습니다.`,
            `#post/${p.uuid || postId}`,
            currentUser.username
          );
        }
        
        return {
          ...p,
          comments: updatedComments
        };
      }
      return p;
    }));

      // 상세보기 중이면 selectedPost도 업데이트
      if (selectedPost && selectedPost.id === postId) {
        let updatedComments;
        
        if (parentId) {
          updatedComments = selectedPost.comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment]
              };
            }
            return comment;
          });
        } else {
          updatedComments = [...selectedPost.comments, newComment];
        }
        
        setSelectedPost({
          ...selectedPost,
          comments: updatedComments
        });
      }
    } catch (error) {
      console.error('댓글 추가 실패:', error);
      alert(error.message || '댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 삭제 (댓글 또는 대댓글)
  const handleDeleteComment = async (postId, commentId, parentId = null) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          postUuid: post.uuid,
          isReply: !!parentId,
          parentId: parentId
        })
      });

      if (!response.ok) {
        throw new Error('댓글 삭제에 실패했습니다.');
      }

      setPosts(posts.map(p => {
        if (p.id === postId) {
          if (parentId) {
            // 대댓글 삭제
            return {
              ...p,
              comments: p.comments.map(comment => {
                if (comment.id === parentId) {
                  return {
                    ...comment,
                    replies: (comment.replies || []).filter(reply => reply.id !== commentId)
                  };
                }
                return comment;
              })
            };
          } else {
            // 일반 댓글 삭제
            return {
              ...p,
              comments: p.comments.filter(c => c.id !== commentId)
            };
          }
        }
        return p;
      }));

      // 상세보기 중이면 selectedPost도 업데이트
      if (selectedPost && selectedPost.id === postId) {
        if (parentId) {
          setSelectedPost({
            ...selectedPost,
            comments: selectedPost.comments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: (comment.replies || []).filter(reply => reply.id !== commentId)
                };
              }
              return comment;
            })
          });
        } else {
          setSelectedPost({
            ...selectedPost,
            comments: selectedPost.comments.filter(c => c.id !== commentId)
          });
        }
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 인증 핸들러
  const handleLogin = async (username, password, rememberMe) => {
    try {
      await login(username, password, rememberMe);
    } catch (err) {
      throw err;
    }
  };

  const handleRegister = async (userData) => {
    try {
      await register(userData.username, userData.email, userData.password, userData.username);
      alert('회원가입이 완료되었습니다!');
      // 회원가입 후 자동 로그인됨
    } catch (err) {
      throw err;
    }
  };

  // 알림 삭제
  const handleDeleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // 스크랩 삭제
  const handleDeleteScrap = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post.uuid}/scrap`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('스크랩 취소에 실패했습니다.');
      }

      const data = await response.json();
      alert(data.message);
      // 강제로 리렌더링을 위해 notifications 업데이트
      setNotifications([...notifications]);
    } catch (error) {
      console.error('스크랩 삭제 실패:', error);
      alert('스크랩 취소에 실패했습니다.');
    }
  };

  // 로그인 성공 시 메인으로 돌아가기
  useEffect(() => {
    if (currentUser) {
      setAuthView('main');
      // 뒤로가기로 로그인 화면으로 돌아가지 않도록 히스토리 교체
      window.history.replaceState(null, '', '/');
    }
  }, [currentUser]);

  // authView 변경 시 브라우저 히스토리에 추가
  useEffect(() => {
    const handlePopState = (e) => {
      // 브라우저 뒤로가기 시 authView 변경
      if (authView !== 'main') {
        setAuthView('main');
      }
    };

    // authView가 main이 아닐 때 히스토리에 추가
    if (authView !== 'main' && !currentUser) {
      window.history.pushState({ authView }, '', `#${authView}`);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [authView, currentUser]);

  // 필터링된 게시글 목록
  const filteredPosts = currentBoard 
    ? posts.filter(post => post.category === currentBoard)
    : posts;

  // 로그인 필요 뷰 (글쓰기, 수정) 또는 게스트가 인증 요청
  if (!currentUser && (authView !== 'main')) {
    if (authView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthView('register')}
          onSwitchToFindAccount={() => setAuthView('find')}
          onGoToMain={() => setAuthView('main')}
        />
      );
    } else if (authView === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView('login')}
          onGoToMain={() => setAuthView('main')}
        />
      );
    } else if (authView === 'find') {
      return (
        <FindAccount
          onFindAccount={findAccount}
          onResetPassword={resetPassword}
          onSwitchToLogin={() => setAuthView('login')}
          onGoToMain={() => setAuthView('main')}
        />
      );
    }
  }

  // 메인 앱 표시
  return (
    <div className="app">
      <DynamicBackground />
      <Header 
        currentUser={currentUser} 
        onLogout={logout}
        onOpenProfile={() => setShowProfile(true)}
        onHome={handleBackToHome}
        onGoToMyActivity={handleGoToMyActivity}
        onOpenMessageForm={() => setShowMessageForm(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        notifications={notifications}
      />
      {!currentUser && (
        <div className="guest-banner">
          <span>게시글을 작성하려면 로그인이 필요합니다.</span>
          <button onClick={() => setAuthView('login')} className="btn-login-banner">
            로그인
          </button>
        </div>
      )}

      {currentView === 'home' && (
        <BoardHome 
          posts={posts}
          currentUser={currentUser}
          onSelectBoard={handleSelectBoard}
          onSelectPost={handleSelectPost}
        />
      )}

      {currentView === 'myactivity' && currentUser && (
        <MyActivity 
          posts={posts}
          currentUser={currentUser}
          onSelectPost={handleSelectPost}
          onSelectBoard={handleSelectBoard}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onDeleteNotification={handleDeleteNotification}
          onDeleteScrap={handleDeleteScrap}
        />
      )}

      {(currentView === 'board' || currentView === 'detail' || currentView === 'create' || currentView === 'edit') && (
        <div className="main-layout">
          <Sidebar posts={posts} onSelectPost={handleSelectPost} />
          <div className="content-area">
            <div className="container">
              {currentView === 'board' && (
                <PostList
                  posts={filteredPosts}
                  currentUser={currentUser}
                  onSelectPost={handleSelectPost}
                  onDeletePost={handleDeletePost}
                  onCreateNew={handleCreateNew}
                  onToggleLike={handleToggleLike}
                  onBack={handleBackToHome}
                  boardName={currentBoard}
                />
              )}

              {currentView === 'detail' && (
                <PostDetail
                  post={selectedPost}
                  currentUser={currentUser}
                  onEdit={handleEditPost}
                  onBack={handleBackToList}
                  onDelete={handleDeletePost}
                  onToggleLike={handleToggleLike}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  allPosts={posts}
                  onSelectPost={handleSelectPost}
                  onCreateNew={handleCreateNew}
                />
              )}

              {currentView === 'create' && currentUser && (
                <PostForm
                  key={nextId}
                  currentUser={currentUser}
                  onSubmit={handleCreatePost}
                  onCancel={() => handleBackToList(currentBoard)}
                  defaultCategory={currentBoard}
                  currentBoard={currentBoard}
                />
              )}

              {currentView === 'edit' && currentUser && (
                <PostForm
                  post={editingPost}
                  currentUser={currentUser}
                  onSubmit={handleUpdatePost}
                  onCancel={() => handleBackToList(editingPost?.category)}
                  currentBoard={currentBoard}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showProfile && currentUser && (
        <Profile onClose={() => setShowProfile(false)} />
      )}

      {showAdmin && currentUser && currentUser.role === 'admin' && (
        <AdminPanel onClose={() => setShowAdmin(false)} currentUser={currentUser} />
      )}

      {/* 메시지 폼 */}
      {showMessageForm && currentUser && (
        <MessageForm
          currentUser={currentUser}
          initialRecipient=""
          onClose={() => setShowMessageForm(false)}
          onSendMessage={(msg) => {
            addNotification(
              '메시지 전송',
              `${msg.toName}에게 메시지를 보냈습니다.`,
              null,
              currentUser.username
            );
            addNotification(
              '새 메시지',
              `${msg.fromName}님이 메시지를 보냈습니다.`,
              null,
              msg.to
            );
          }}
        />
      )}

      {/* 알림 토스트 */}
      {currentToast && (
        <NotificationToast
          notification={currentToast}
          onClose={() => setCurrentToast(null)}
          onClick={handleNotificationClick}
        />
      )}

      {/* 차단 모달 */}
      {showBannedModal && (
        <div className="banned-modal-overlay" onClick={() => setShowBannedModal(false)}>
          <div className="banned-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ 차단된 사용자</h3>
            <p className="banned-message">
              귀하는 관리자에 의해 차단되었습니다.<br />
              게시글 및 댓글을 작성할 수 없습니다.
            </p>
            <div className="banned-reason">
              <strong>차단 사유:</strong>
              <p>{bannedReason}</p>
            </div>
            <button 
              className="btn-confirm" 
              onClick={() => setShowBannedModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 다크 모드 토글 버튼 */}
      <button className="theme-toggle" onClick={toggleTheme} title={`${theme === 'light' ? '다크' : '라이트'} 모드로 전환`}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
