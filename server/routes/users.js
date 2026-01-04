const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const { verifyToken, isSelfOrAdmin } = require('../middleware/auth');

// GET /api/users/check/:username - 사용자 존재 여부 확인
router.get('/check/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).select('username');
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ exists: true, username: user.username });
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({ message: '사용자 확인 중 오류가 발생했습니다.' });
  }
});

// GET /api/users/:id - 사용자 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '사용자 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// PUT /api/users/:id - 사용자 정보 수정
router.put('/:id', verifyToken, isSelfOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, name, bio, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자명 변경 시 중복 확인
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
      }
      user.username = username;
    }

    // 이메일 변경 시 중복 확인
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
      }
      user.email = email;
    }

    // 비밀번호 변경
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: '새 비밀번호는 8자 이상이어야 합니다.' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // 기타 정보 업데이트
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: '사용자 정보가 수정되었습니다.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: '사용자 정보 수정 중 오류가 발생했습니다.' });
  }
});

// DELETE /api/users/:id - 계정 삭제
router.delete('/:id', verifyToken, isSelfOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자의 모든 게시글 삭제
    await Post.deleteMany({ author: id });

    // 사용자 삭제
    await user.deleteOne();

    res.json({ message: '계정이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '계정 삭제 중 오류가 발생했습니다.' });
  }
});

// GET /api/users/:id/posts - 사용자 작성 게시글
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username name avatar')
      .lean();

    const total = await Post.countDocuments({ author: id });

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
    console.error('Get user posts error:', error);
    res.status(500).json({ message: '게시글을 가져오는 중 오류가 발생했습니다.' });
  }
});

// GET /api/users/:id/favorites - 즐겨찾기 게시판
router.get('/:id/favorites', verifyToken, isSelfOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('favorites');

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: '즐겨찾기를 가져오는 중 오류가 발생했습니다.' });
  }
});

// POST /api/users/:id/favorites - 즐겨찾기 추가/제거
router.post('/:id/favorites', verifyToken, isSelfOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { board } = req.body;

    if (!board) {
      return res.status(400).json({ message: '게시판을 선택해주세요.' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const index = user.favorites.indexOf(board);

    if (index > -1) {
      // 즐겨찾기 제거
      user.favorites.splice(index, 1);
    } else {
      // 즐겨찾기 추가
      user.favorites.push(board);
    }

    await user.save();

    res.json({
      message: index > -1 ? '즐겨찾기가 제거되었습니다.' : '즐겨찾기에 추가되었습니다.',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: '즐겨찾기 처리 중 오류가 발생했습니다.' });
  }
});

// GET /api/users/:id/scraps - 스크랩한 게시글
router.get('/:id/scraps', verifyToken, isSelfOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const user = await User.findById(id).populate({
      path: 'scraps',
      populate: { path: 'author', select: 'username name avatar' },
      options: {
        sort: { date: -1 },
        skip: (page - 1) * limit,
        limit: parseInt(limit)
      }
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      posts: user.scraps,
      pagination: {
        total: user.scraps.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(user.scraps.length / limit)
      }
    });
  } catch (error) {
    console.error('Get scraps error:', error);
    res.status(500).json({ message: '스크랩을 가져오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
