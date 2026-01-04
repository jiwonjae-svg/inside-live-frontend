const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Post = require('../models/Post');
const User = require('../models/User');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// GET /api/posts - 게시글 목록 조회
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 30, 
      search, 
      searchType = 'title',
      sort = 'date' 
    } = req.query;

    // 필터 구성
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    // 검색 필터
    if (search) {
      switch (searchType) {
        case 'title':
          filter.title = { $regex: search, $options: 'i' };
          break;
        case 'titleContent':
          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ];
          break;
        case 'author':
          // 작성자 이름으로 검색
          const users = await User.find({ 
            username: { $regex: search, $options: 'i' } 
          });
          filter.author = { $in: users.map(u => u._id) };
          break;
        case 'comment':
          // 댓글 내용으로 검색
          filter['comments.content'] = { $regex: search, $options: 'i' };
          break;
      }
    }

    // 정렬 옵션
    const sortOptions = {};
    switch (sort) {
      case 'date':
        sortOptions.date = -1;
        break;
      case 'views':
        sortOptions.views = -1;
        break;
      case 'likes':
        sortOptions.likes = -1;
        break;
    }

    // 페이지네이션
    const skip = (page - 1) * limit;

    // 게시글 조회
    const posts = await Post.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username name avatar')
      .lean();

    // 전체 개수
    const total = await Post.countDocuments(filter);

    // 사용자가 좋아요한 게시글 표시
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.likedBy.some(
          id => id.toString() === req.user._id.toString()
        );
      });
    }

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: '게시글을 불러오는 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// GET /api/posts/:uuid - 게시글 상세 조회
router.get('/:uuid', optionalAuth, async (req, res) => {
  try {
    const { uuid } = req.params;

    const post = await Post.findOne({ uuid })
      .populate('author', 'username name avatar bio');

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    post.views += 1;
    await post.save();

    // 좋아요 여부 확인
    const response = post.toObject();
    if (req.user) {
      response.isLiked = post.likedBy.some(
        id => id.toString() === req.user._id.toString()
      );
    }

    res.json(response);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: '게시글을 가져오는 중 오류가 발생했습니다.' });
  }
});

// POST /api/posts - 게시글 작성
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, category, media } = req.body;

    // 사용자 정보 조회 (차단 여부 확인)
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        message: '차단된 사용자입니다. 게시글을 작성할 수 없습니다.',
        banReason: user.banReason 
      });
    }

    // 입력 검증
    if (!title || !content || !category) {
      return res.status(400).json({ message: '필수 항목을 입력해주세요.' });
    }

    // 카테고리 검증
    const validCategories = ['comic', 'game', 'movie', 'book', 'music', 'sports'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
    }

    // 게시글 생성
    const post = new Post({
      uuid: uuidv4(),
      title,
      content,
      category,
      author: req.user._id,
      media: media || []
    });

    await post.save();

    // 작성자 정보 포함하여 응답
    await post.populate('author', 'username name avatar');

    res.status(201).json({
      message: '게시글이 작성되었습니다.',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: '게시글 작성 중 오류가 발생했습니다.' });
  }
});

// PUT /api/posts/:uuid - 게시글 수정
router.put('/:uuid', verifyToken, async (req, res) => {
  try {
    const { uuid } = req.params;
    const { title, content, media } = req.body;

    const post = await Post.findOne({ uuid });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 작성자 확인
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    // 수정
    if (title) post.title = title;
    if (content) post.content = content;
    if (media !== undefined) post.media = media;

    await post.save();
    await post.populate('author', 'username name avatar');

    res.json({
      message: '게시글이 수정되었습니다.',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: '게시글 수정 중 오류가 발생했습니다.' });
  }
});

// DELETE /api/posts/:uuid - 게시글 삭제
router.delete('/:uuid', verifyToken, async (req, res) => {
  try {
    const { uuid } = req.params;

    const post = await Post.findOne({ uuid });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 작성자 확인
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await post.deleteOne();

    // 사용자의 스크랩에서 제거
    await User.updateMany(
      { scraps: post._id },
      { $pull: { scraps: post._id } }
    );

    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: '게시글 삭제 중 오류가 발생했습니다.' });
  }
});

// POST /api/posts/:uuid/like - 게시글 좋아요/취소
router.post('/:uuid/like', verifyToken, async (req, res) => {
  try {
    const { uuid } = req.params;

    const post = await Post.findOne({ uuid });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const userId = req.user._id;
    const likedIndex = post.likedBy.findIndex(
      id => id.toString() === userId.toString()
    );

    if (likedIndex > -1) {
      // 좋아요 취소
      post.likedBy.splice(likedIndex, 1);
      post.likes -= 1;
    } else {
      // 좋아요 추가
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.json({
      message: likedIndex > -1 ? '좋아요가 취소되었습니다.' : '좋아요를 눌렀습니다.',
      likes: post.likes,
      isLiked: likedIndex === -1
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: '좋아요 처리 중 오류가 발생했습니다.' });
  }
});

// POST /api/posts/:uuid/scrap - 게시글 스크랩
router.post('/:uuid/scrap', verifyToken, async (req, res) => {
  try {
    const { uuid } = req.params;

    const post = await Post.findOne({ uuid });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const user = await User.findById(req.user._id);
    const scrapIndex = user.scraps.findIndex(
      id => id.toString() === post._id.toString()
    );

    if (scrapIndex > -1) {
      // 스크랩 취소
      user.scraps.splice(scrapIndex, 1);
    } else {
      // 스크랩 추가
      user.scraps.push(post._id);
    }

    await user.save();

    res.json({
      message: scrapIndex > -1 ? '스크랩이 취소되었습니다.' : '게시글을 스크랩했습니다.',
      isScrapped: scrapIndex === -1
    });
  } catch (error) {
    console.error('Scrap post error:', error);
    res.status(500).json({ message: '스크랩 처리 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
