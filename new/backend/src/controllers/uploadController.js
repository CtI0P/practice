const path = require('path');
const { exec } = require('child_process');
const { pool } = require('../config/database');

exports.uploadLessonVideo = async (req, res) => {
  const lessonId = req.params.id;
  const inputPath = req.file.path;

  const outputDir = `src/uploads/hls/lesson_${lessonId}`;
  const m3u8Path = `${outputDir}/index.m3u8`;

  try {
    await pool.query(
      'UPDATE lessons SET video_url = ? WHERE id = ?',
      [m3u8Path, lessonId]
    );

    // 确保目录存在
    require('fs').mkdirSync(outputDir, { recursive: true });

    const cmd = `ffmpeg -i "${inputPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_list_size 0 -hls_segment_filename "${outputDir}\\index%d.ts" "${outputDir}\\index.m3u8"`;

    exec(cmd, (error, stdout, stderr) => {
    console.log('FFmpeg stdout:', stdout);
    console.error('FFmpeg stderr:', stderr);
    
    if (error) {
     console.error('FFmpeg error:', error);
      return res.status(500).json({ message: '转码失败' });
    }

     res.json({
       message: '上传成功，转码完成',
       lessonId
     });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '上传失败' });
  }
};
