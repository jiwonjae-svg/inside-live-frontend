const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// POST /api/comments - 댓글 작성
router.post('/', verifyToken, async (req, res) => {
  try {
    const { postUuid, content, parentId } = req.body;

    // 사용자 정보 조회 (차단 여부 확인)
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        message: '차단된 사용자입니다. 댓글을 작성할 수 없습니다.',
        banReason: user.banReason 
      });
    }

    if (!postUuid || !content) {
      return res.status(400).json({ message: '필수 항목을 입력해주세요.' });
    }

    const post = await Post.findOne({ uuid: postUuid });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (parentId) {
      // 대댓글 작성
      const parentComment = post.comments.id(parentId);

      if (!parentComment) {
        return res.status(404).json({ message: '부모 댓글을 찾을 수 없습니다.' });
      }

      const reply = {
        author: req.user._id,
        content
      };

      parentComment.replies.push(reply);
      await post.save();

      // 작성자 정보 포함
      await post.populate('comments.replies.author', 'username avatar');

      const addedReply = parentComment.replies[parentComment.replies.length - 1];

      res.status(201).json({
        message: '대댓글이 작성되었습니다.',
        reply: addedReply,
        commentId: parentId
      });
    } else {
      // 일반 댓글 작성
      const comment = {
        author: req.user._id,
        content
      };

      post.comments.push(comment);
      await post.save();

      // 작성자 정보 포함
      await post.populate('comments.author', 'username avatar');

      const addedComment = post.comments[post.comments.length - 1];

      res.status(201).json({
        message: '댓글이 작성되었습니다.',
        comment: addedComment
      });
    }
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: '댓글 작성 중 오류가 발생했습니다.' });
  }
});

// PUT /api/comments/:id - 댓글 수정
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { postUuid, content, isReply, parentId } = req.body;

    if (!content) {
      return res.status(400).json({ message: '내용을 입력해주세요.' });
    }

    const post = await Post.findOne({ uuid: postUuid });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (isReply && parentId) {
      // 대댓글 수정
      const parentComment = post.comments.id(parentId);
      
      if (!parentComment) {
        return res.status(404).json({ message: '부모 댓글을 찾을 수 없습니다.' });
      }

      const reply = parentComment.replies.id(id);

      if (!reply) {
        return res.status(404).json({ message: '대댓글을 찾을 수 없습니다.' });
      }

      // 작성자 확인
      if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: '수정 권한이 없습니다.' });
      }

      reply.content = content;
      await post.save();

      res.json({
        message: '대댓글이 수정되었습니다.',
        reply
      });
    } else {
      // 일반 댓글 수정
      const comment = post.comments.id(id);

      if (!comment) {
        return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      }

      // 작성자 확인
      if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: '수정 권한이 없습니다.' });
      }

      comment.content = content;
      await post.save();

      res.json({
        message: '댓글이 수정되었습니다.',
        comment
      });
    }
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: '댓글 수정 중 오류가 발생했습니다.' });
  }
});

// DELETE /api/comments/:id - 댓글 삭제
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { postUuid, isReply, parentId } = req.query;

    const post = await Post.findOne({ uuid: postUuid });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (isReply === 'true' && parentId) {
      // 대댓글 삭제
      const parentComment = post.comments.id(parentId);

      if (!parentComment) {
        return res.status(404).json({ message: '부모 댓글을 찾을 수 없습니다.' });
      }

      const reply = parentComment.replies.id(id);

      if (!reply) {
        return res.status(404).json({ message: '대댓글을 찾을 수 없습니다.' });
      }

      // 작성자 확인
      if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: '삭제 권한이 없습니다.' });
      }

      reply.deleteOne();
      await post.save();

      res.json({ message: '대댓글이 삭제되었습니다.' });
    } else {
      // 일반 댓글 삭제
      const comment = post.comments.id(id);

      if (!comment) {
        return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      }

      // 작성자 확인
      if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: '삭제 권한이 없습니다.' });
      }

      comment.deleteOne();
      await post.save();

      res.json({ message: '댓글이 삭제되었습니다.' });
    }
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: '댓글 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
