const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// POST /api/messages - 메시지 전송
router.post('/', verifyToken, async (req, res) => {
  try {
    const { to, content } = req.body;

    if (!to || !content) {
      return res.status(400).json({ message: '받는 사람과 내용을 입력해주세요.' });
    }

    // 받는 사람 존재 여부 확인
    const recipient = await User.findOne({ username: { $regex: new RegExp(`^${to}$`, 'i') } });
    if (!recipient) {
      return res.status(404).json({ message: '존재하지 않는 사용자입니다.' });
    }

    // 자기 자신에게 메시지 방지
    if (recipient.username === req.user.username) {
      return res.status(400).json({ message: '자기 자신에게는 메시지를 보낼 수 없습니다.' });
    }

    const message = new Message({
      from: req.user.username,
      fromName: req.user.username,
      to: recipient.username,
      toName: recipient.username,
      content: content.trim(),
      read: false
    });

    await message.save();

    res.status(201).json({
      message: `${recipient.username}에게 메시지를 보냈습니다.`,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: '메시지 전송 중 오류가 발생했습니다.' });
  }
});

// GET /api/messages - 내가 받은 메시지 목록
router.get('/', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ to: req.user.username })
      .sort({ date: -1 })
      .limit(100);

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: '메시지를 가져오는 중 오류가 발생했습니다.' });
  }
});

// GET /api/messages/sent - 내가 보낸 메시지 목록
router.get('/sent', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ from: req.user.username })
      .sort({ date: -1 })
      .limit(100);

    res.json({ messages });
  } catch (error) {
    console.error('Get sent messages error:', error);
    res.status(500).json({ message: '메시지를 가져오는 중 오류가 발생했습니다.' });
  }
});

// PUT /api/messages/:id/read - 메시지 읽음 처리
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: '메시지를 찾을 수 없습니다.' });
    }

    if (message.to !== req.user.username) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    message.read = true;
    await message.save();

    res.json({ message: '메시지를 읽음 처리했습니다.', data: message });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: '메시지 처리 중 오류가 발생했습니다.' });
  }
});

// DELETE /api/messages/:id - 메시지 삭제
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: '메시지를 찾을 수 없습니다.' });
    }

    // 받는 사람 또는 보낸 사람만 삭제 가능
    if (message.to !== req.user.username && message.from !== req.user.username) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: '메시지가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: '메시지 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
