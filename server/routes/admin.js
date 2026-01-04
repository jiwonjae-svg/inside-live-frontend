const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

// 관리자 권한 확인 미들웨어
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }
  next();
};

// 모든 사용자 목록 조회
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ error: '사용자 목록을 불러오는데 실패했습니다.' });
  }
});

// 모든 게시물 조회 (삭제되지 않은)
router.get('/posts', verifyToken, isAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: { $ne: true } })
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({ posts });
  } catch (error) {
    console.error('게시물 목록 조회 오류:', error);
    res.status(500).json({ error: '게시물 목록을 불러오는데 실패했습니다.' });
  }
});

// 삭제된 게시물 조회
router.get('/deleted-posts', verifyToken, isAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: true })
      .populate('author', 'username email')
      .sort({ updatedAt: -1 });
    
    res.json({ posts });
  } catch (error) {
    console.error('삭제된 게시물 조회 오류:', error);
    res.status(500).json({ error: '삭제된 게시물 목록을 불러오는데 실패했습니다.' });
  }
});

// 게시물 삭제 (소프트 삭제)
router.delete('/posts/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    res.json({ message: '게시물이 삭제되었습니다.', post });
  } catch (error) {
    console.error('게시물 삭제 오류:', error);
    res.status(500).json({ error: '게시물 삭제에 실패했습니다.' });
  }
});

// 게시물 복원
router.put('/posts/:id/restore', verifyToken, isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    post.isDeleted = false;
    post.deletedAt = null;
    await post.save();

    res.json({ message: '게시물이 복원되었습니다.', post });
  } catch (error) {
    console.error('게시물 복원 오류:', error);
    res.status(500).json({ error: '게시물 복원에 실패했습니다.' });
  }
});

// 게시물 영구 삭제
router.delete('/posts/:id/permanent', verifyToken, isAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    res.json({ message: '게시물이 영구적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('게시물 영구 삭제 오류:', error);
    res.status(500).json({ error: '게시물 영구 삭제에 실패했습니다.' });
  }
});

// 사용자 차단
router.put('/users/:id/ban', verifyToken, isAdmin, async (req, res) => {
  try {
    const { banReason } = req.body;
    
    if (!banReason || !banReason.trim()) {
      return res.status(400).json({ error: '차단 사유를 입력해주세요.' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: '관리자는 차단할 수 없습니다.' });
    }

    user.isBanned = true;
    user.banReason = banReason;
    user.bannedAt = new Date();
    await user.save();

    res.json({ message: '사용자가 차단되었습니다.', user });
  } catch (error) {
    console.error('사용자 차단 오류:', error);
    res.status(500).json({ error: '사용자 차단에 실패했습니다.' });
  }
});

// 사용자 차단 해제
router.put('/users/:id/unban', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    user.isBanned = false;
    user.banReason = '';
    user.bannedAt = null;
    await user.save();

    res.json({ message: '차단이 해제되었습니다.', user });
  } catch (error) {
    console.error('차단 해제 오류:', error);
    res.status(500).json({ error: '차단 해제에 실패했습니다.' });
  }
});

module.exports = router;
