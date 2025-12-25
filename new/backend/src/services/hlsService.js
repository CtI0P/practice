const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.generateHLS = (videoPath, lessonId) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, '../uploads/hls', `lesson_${lessonId}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const cmd = `
      ffmpeg -i ${videoPath} \
      -codec: copy \
      -start_number 0 \
      -hls_time 10 \
      -hls_list_size 0 \
      -f hls ${outputDir}/index.m3u8
    `;

    exec(cmd, err => {
      if (err) reject(err);
      else resolve(`${outputDir}/index.m3u8`);
    });
  });
};
