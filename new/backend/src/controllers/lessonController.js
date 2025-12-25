const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { pool } = require('../config/database');

// 核心常量：精准指向实际的hls目录
const HLS_ROOT_DIR = path.resolve(__dirname, '../uploads/hls');

/**
 * 校验路径是否在允许的目录内（防路径遍历攻击）
 * @param {string} targetPath 目标文件路径
 * @param {string} allowedDir 允许的根目录
 * @returns {boolean} 路径是否合法
 */
const isPathInAllowedDir = (targetPath, allowedDir) => {
  const normalizedTarget = path.normalize(targetPath).toLowerCase();
  const normalizedAllowed = path.normalize(allowedDir).toLowerCase();
  return normalizedTarget === normalizedAllowed || normalizedTarget.startsWith(normalizedAllowed + path.sep);
};

/**
 * 接口1：获取 HLS 播放列表（index.m3u8）
 */
exports.getPlaylist = async (req, res) => {
  try {
    // 1. 校验课程ID
    const lessonId = String(req.params.id).trim();
    if (!lessonId || lessonId === 'null' || lessonId === 'undefined') {
      return res.status(400).json({ message: '课程ID无效（不能为空/Null）' });
    }

    // 2. 直接拼接播放列表路径（不再依赖数据库路径）
    const playlistPath = path.resolve(HLS_ROOT_DIR, `lesson_${lessonId}`, 'index.m3u8');

    // 3. 调试日志
    console.log('=== 路径匹配验证 ===');
    console.log('你的实际视频路径:', 'c:\\users\\appie\\desktop\\all\\practice\\new\\backend\\src\\uploads\\hls\\lesson_1\\index.m3u8');
    console.log('代码拼接的路径:', playlistPath);
    console.log('HLS_ROOT_DIR:', HLS_ROOT_DIR);
    console.log('路径是否合法:', isPathInAllowedDir(playlistPath, HLS_ROOT_DIR));

    // 4. 路径合法性校验
    if (!isPathInAllowedDir(playlistPath, HLS_ROOT_DIR)) {
      return res.status(403).json({ message: '访问被拒绝（路径非法/越权）' });
    }

    // 5. 校验文件是否存在
    await fs.access(playlistPath, fs.constants.F_OK);

    // 6. 响应播放列表
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    const stream = fsSync.createReadStream(playlistPath);
    stream.on('error', (err) => {
      console.error('[播放列表读取失败]', err);
      if (!res.headersSent) {
        return res.status(500).json({ message: '播放列表文件读取失败' });
      }
    });
    stream.pipe(res);

  } catch (err) {
    console.error('[获取播放列表异常]', err);
    if (err.code === 'ENOENT') {
      return res.status(404).json({ message: '播放列表文件不存在' });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: '获取播放列表失败：' + err.message });
    }
  }
};

/**
 * 接口2：获取 HLS 分片文件（index*.ts）
 */
exports.getSegment = async (req, res) => {
  try {
    // 1. 校验参数
    const lessonId = String(req.params.id).trim();
    const fileName = String(req.params.file).trim();

    if (!lessonId || lessonId === 'null' || lessonId === 'undefined') {
      return res.status(400).json({ message: '课程ID无效（不能为空/Null）' });
    }
    if (!fileName || fileName === 'null') {
      return res.status(400).json({ message: '分片文件名不能为空' });
    }
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(fileName)) {
      return res.status(400).json({ message: '分片文件名包含非法字符（仅允许字母/数字/._-）' });
    }

    // 2. 拼接分片路径
    const tsPath = path.resolve(HLS_ROOT_DIR, `lesson_${lessonId}`, fileName);

    // 3. 调试日志
    console.log('=== 分片路径匹配验证 ===');
    console.log('拼接的分片路径:', tsPath);
    console.log('路径是否合法:', isPathInAllowedDir(tsPath, HLS_ROOT_DIR));

    // 4. 路径校验
    if (!isPathInAllowedDir(tsPath, HLS_ROOT_DIR)) {
      return res.status(403).json({ message: '访问被拒绝（路径非法/越权）' });
    }

    // 5. 校验文件存在性
    await fs.access(tsPath, fs.constants.F_OK);

    // 6. 响应分片文件
    res.setHeader('Content-Type', 'video/mp2t');
    const stream = fsSync.createReadStream(tsPath);
    stream.on('error', (err) => {
      console.error('[分片文件读取失败]', err);
      if (!res.headersSent) {
        return res.status(500).json({ message: '分片文件读取失败' });
      }
    });
    stream.pipe(res);

  } catch (err) {
    console.error('[获取分片文件异常]', err);
    if (err.code === 'ENOENT') {
      return res.status(404).json({ message: '分片文件不存在' });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: '获取分片文件失败：' + err.message });
    }
  }
};