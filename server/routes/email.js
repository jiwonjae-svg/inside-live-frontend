const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

// 메모리에 임시 저장 (프로덕션에서는 Redis 등 사용)
const verificationCodes = new Map();

// 이메일 전송 설정 (Gmail 예시)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// transporter 연결 확인
transporter.verify((error, success) => {
  if (error) {
    console.error('📧 이메일 설정 오류:', error.message);
    console.log('⚠️ .env 파일에서 EMAIL_USER와 EMAIL_PASSWORD를 확인하세요.');
  } else {
    console.log('✅ 이메일 서버 연결 성공!');
  }
});

// 인증 코드 생성
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// 이메일 인증 코드 발송
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '이메일을 입력하세요.' });
    }

    // 이메일 중복 체크
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
    }

    // 인증 코드 생성
    const code = generateVerificationCode();
    
    // 5분간 유효
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // 이메일 전송 (콘솔에도 출력)
    console.log(`\n📧 이메일 인증 코드 전송 (${email}): ${code}\n`);

    // 개발 모드 또는 이메일 설정이 없는 경우 콘솔만 출력
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-insidelivenoreply@gmail.com') {
      console.log('⚠️ 개발 모드: 실제 이메일 전송 생략');
      return res.json({ 
        message: '인증 코드가 발송되었습니다.',
        devCode: code  // 개발용 코드 반환
      });
    }

    // 실제 이메일 전송
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '커뮤니티 게시판 이메일 인증',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">이메일 인증</h2>
          <p>안녕하세요!</p>
          <p>커뮤니티 게시판 회원가입을 위한 인증 코드입니다.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">이 코드는 5분간 유효합니다.</p>
          <p style="color: #666; font-size: 14px;">본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
        </div>
      `
    });

    res.json({ message: '인증 코드가 이메일로 발송되었습니다.' });
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    console.error('에러 상세:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    res.status(500).json({ 
      error: '이메일 전송에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 비밀번호 재설정용 이메일 인증 코드 발송
router.post('/send-reset-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '이메일을 입력하세요.' });
    }

    // 이메일이 존재하는지 확인 (비밀번호 재설정은 기존 계정이 필요)
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: '해당 이메일로 등록된 계정이 없습니다.' });
    }

    // 인증 코드 생성
    const code = generateVerificationCode();
    
    // 5분간 유효
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // 이메일 전송 (콘솔에도 출력)
    console.log(`\n📧 비밀번호 재설정 인증 코드 전송 (${email}): ${code}\n`);

    // 개발 모드 또는 이메일 설정이 없는 경우 콘솔만 출력
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-insidelivenoreply@gmail.com') {
      console.log('⚠️ 개발 모드: 실제 이메일 전송 생략');
      return res.json({ 
        message: '비밀번호 재설정 인증 코드가 발송되었습니다.',
        devCode: code  // 개발용 코드 반환
      });
    }

    // 실제 이메일 전송
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '커뮤니티 게시판 비밀번호 재설정',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">비밀번호 재설정</h2>
          <p>안녕하세요!</p>
          <p>비밀번호 재설정을 위한 인증 코드입니다.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">이 코드는 5분간 유효합니다.</p>
          <p style="color: #666; font-size: 14px;">본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
        </div>
      `
    });

    res.json({ message: '비밀번호 재설정 인증 코드가 이메일로 발송되었습니다.' });
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    res.status(500).json({ 
      error: '이메일 전송 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 인증 코드 확인
router.post('/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: '이메일과 인증 코드를 입력하세요.' });
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return res.status(400).json({ error: '인증 코드를 먼저 요청하세요.' });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: '인증 코드가 만료되었습니다.' });
    }

    if (stored.code !== code) {
      return res.status(400).json({ error: '인증 코드가 일치하지 않습니다.' });
    }

    // 인증 성공 - 코드 삭제
    verificationCodes.delete(email);

    res.json({ message: '이메일 인증이 완료되었습니다.' });
  } catch (error) {
    console.error('인증 확인 오류:', error);
    res.status(500).json({ error: '인증 확인에 실패했습니다.' });
  }
});

module.exports = router;
