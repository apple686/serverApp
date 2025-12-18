var express = require('express');
var router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
// 创建目录（如果不存在）
const uploadPath = path.resolve(__dirname, '../public/images');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extraName = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extraName);
        console.log(uniqueSuffix, extraName);
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.array('image', 12), function (req, res, next) {

    res.setHeader('content-type', 'application/json');

    try {
        // ✅ 关键：检查文件是否上传成功
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        // 成功处理示例
        const filePaths = req.files.map(f => {
            return {
                src: `${req.protocol}://${req.headers.host}/${f.filename}`,
                filename: f.filename,
                size: f.size
            };
        });
        res.json({
            message: `${req.files.length} files uploaded`,
            paths: filePaths
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

// 删除图片
router.delete('/', async (req, res) => {
    const fs = require('fs').promises; // 使用Promise版fs模块
    const path = require('path');

    try {
        // 1. 构建完整文件路径（假设图片存储在public/uploads目录）
        const uploadDir = path.join(__dirname, 'public', 'images');
        const filePath = path.join(uploadDir, req.params.filename);

        // 2. 检查文件是否存在
        try {
            await fs.access(filePath);
        } catch (err) {
            return res.status(404).json({ error: '文件不存在' });
        }

        // 3. 执行删除
        await fs.unlink(filePath);

        // 4. 返回成功响应
        res.json({ message: '文件删除成功', deletedFile: req.params.filename });
    } catch (err) {
        console.error('删除失败:', err);
        res.status(500).json({ error: '服务器内部错误' });
    }


});

module.exports = router;