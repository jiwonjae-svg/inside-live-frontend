const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { verifyToken } = require('../middleware/auth');

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer 메모리 스토리지 설정
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지와 비디오만 허용
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 또는 비디오 파일만 업로드 가능합니다.'), false);
    }
  }
});

// POST /api/upload - 파일 업로드
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 제공되지 않았습니다.' });
    }

    // 파일 타입 확인
    const isImage = req.file.mimetype.startsWith('image/');
    const isVideo = req.file.mimetype.startsWith('video/');

    // Cloudinary 업로드 옵션
    const uploadOptions = {
      folder: 'community-board',
      resource_type: isVideo ? 'video' : 'image',
      transformation: isImage ? [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ] : undefined
    };

    // Base64로 변환
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Cloudinary에 업로드
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    res.json({
      message: '파일이 업로드되었습니다.',
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        type: isVideo ? 'video' : 'image',
        name: req.file.originalname,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.message === '이미지 또는 비디오 파일만 업로드 가능합니다.') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: '파일 업로드 중 오류가 발생했습니다.' });
  }
});

// POST /api/upload/multiple - 여러 파일 업로드
router.post('/multiple', verifyToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '파일이 제공되지 않았습니다.' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const isImage = file.mimetype.startsWith('image/');
      const isVideo = file.mimetype.startsWith('video/');

      const uploadOptions = {
        folder: 'community-board',
        resource_type: isVideo ? 'video' : 'image',
        transformation: isImage ? [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ] : undefined
      };

      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        type: isVideo ? 'video' : 'image',
        name: file.originalname,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    });

    const files = await Promise.all(uploadPromises);

    res.json({
      message: `${files.length}개의 파일이 업로드되었습니다.`,
      files
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: '파일 업로드 중 오류가 발생했습니다.' });
  }
});

// DELETE /api/upload/:publicId - 파일 삭제
router.delete('/:publicId', verifyToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    // public_id 디코딩 (URL 인코딩된 경우)
    const decodedPublicId = decodeURIComponent(publicId);

    // Cloudinary에서 삭제
    const result = await cloudinary.uploader.destroy(decodedPublicId, {
      resource_type: resourceType
    });

    if (result.result === 'ok') {
      res.json({ message: '파일이 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: '파일 삭제 중 오류가 발생했습니다.' });
  }
});

// 에러 핸들링 미들웨어
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '파일 크기는 10MB 이하여야 합니다.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: '최대 10개의 파일만 업로드 가능합니다.' });
    }
  }
  next(error);
});

module.exports = router;
