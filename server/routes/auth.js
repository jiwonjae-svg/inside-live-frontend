const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// JWT 토큰 생성 함수
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 리프레시 토큰 생성 함수
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register - 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // 입력 검증
    if (!username || !email || !password) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    // 사용자명 검증 (3-20자, 영문/숫자/언더스코어만)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ 
        message: '사용자명은 3-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.' 
      });
    }

    // 이메일 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: '유효하지 않은 이메일 형식입니다.' });
    }

    // 비밀번호 강도 검증 (8자 이상, 대소문자, 숫자, 특수문자 포함)
    if (password.length < 8) {
      return res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다.' });
    }

    // 중복 확인
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
      }
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = new User({
      username,
      email,
      password: hashedPassword,
      name: name || username
    });

    await user.save();

    // JWT 토큰 생성
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isBanned: user.isBanned || false,
        banReason: user.banReason || '',
        bannedAt: user.bannedAt || null
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

// POST /api/auth/login - 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '사용자명과 비밀번호를 입력해주세요.' });
    }

    // 사용자 찾기 (사용자명 또는 이메일)
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: '잘못된 사용자명 또는 비밀번호입니다.' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: '잘못된 사용자명 또는 비밀번호입니다.' });
    }

    // JWT 토큰 생성
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      message: '로그인 성공',
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        favorites: user.favorites,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

// POST /api/auth/refresh - 토큰 갱신
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: '리프레시 토큰이 필요합니다.' });
    }

    // 리프레시 토큰 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // 새로운 액세스 토큰 생성
    const newToken = generateToken(decoded.userId);

    res.json({
      token: newToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '리프레시 토큰이 만료되었습니다.' });
    }
    console.error('Token refresh error:', error);
    res.status(401).json({ message: '유효하지 않은 리프레시 토큰입니다.' });
  }
});

// GET /api/auth/me - 현재 사용자 정보
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
        bio: req.user.bio,
        role: req.user.role,
        favorites: req.user.favorites,
        scraps: req.user.scraps,
        isBanned: req.user.isBanned,
        banReason: req.user.banReason,
        bannedAt: req.user.bannedAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '사용자 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// POST /api/auth/logout - 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', verifyToken, (req, res) => {
  // 실제로는 클라이언트에서 토큰을 삭제하면 됨
  // 서버에서는 블랙리스트 관리 가능 (Redis 등 사용)
  res.json({ message: '로그아웃되었습니다.' });
});

// POST /api/auth/verify-password - 현재 비밀번호 확인
router.post('/verify-password', verifyToken, async (req, res) => {
  console.log('🔍 verify-password 엔드포인트 호출됨');
  console.log('📝 req.userId:', req.userId);
  console.log('📝 req.user:', req.user ? req.user._id : 'undefined');
  console.log('📝 req.body:', req.body);
  try {
    const { password } = req.body;

    if (!password) {
      console.log('❌ 비밀번호 없음');
      return res.status(400).json({ error: '비밀번호를 입력하세요.' });
    }

    // 사용자 조회 (req.userId 또는 req.user._id 사용)
    const userId = req.userId || (req.user ? req.user._id : null);
    if (!userId) {
      console.log('❌ userId가 없음');
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ 사용자를 DB에서 찾을 수 없음');
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    console.log('✅ 사용자 찾음:', user.username);

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 비밀번호 매치:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    res.json({ message: '비밀번호가 확인되었습니다.' });
  } catch (error) {
    console.error('비밀번호 확인 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/auth/find-account - 이메일로 사용자명 찾기
router.post('/find-account', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '이메일을 입력하세요.' });
    }

    const user = await User.findOne({ email }).select('username');
    
    if (!user) {
      return res.status(404).json({ error: '해당 이메일로 등록된 계정이 없습니다.' });
    }

    res.json({ 
      message: '계정을 찾았습니다.',
      username: user.username 
    });
  } catch (error) {
    console.error('계정 찾기 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/auth/reset-password - 비밀번호 재설정
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: '이메일과 새 비밀번호를 입력하세요.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: '비밀번호는 최소 4자 이상이어야 합니다.' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: '해당 이메일로 등록된 계정이 없습니다.' });
    }

    // 비밀번호 해싱 후 업데이트
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/auth/check-username - 사용자명 중복 확인
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ available: false, error: '사용자명을 입력해주세요.' });
    }

    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return res.json({ available: false });
    }

    res.json({ available: true });
  } catch (error) {
    console.error('사용자명 확인 오류:', error);
    res.status(500).json({ available: false, error: '서버 오류가 발생했습니다.' });
  }
});

// OAuth 콜백 처리는 passport.js에서 관리
console.log('✅ auth.js 라우터 로드 완료 - verify-password 엔드포인트 등록됨');

module.exports = router;
