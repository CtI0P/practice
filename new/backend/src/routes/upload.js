const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadLessonVideo } = require('../controllers/uploadController');

// 计算绝对路径
const rawDir = path.join(__dirname, '../uploads/raw');

// 确保目录存在（非常重要）
if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, rawDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post(
  '/lesson/:id/video',
  upload.single('video'),
  uploadLessonVideo
);

module.exports = router;
