const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController');
const authMiddleware=require('../middleware/authMiddleware');
const {ROLES}=require('../config/constants')

//公开路由
router.post(
    '/register',
    authMiddleware.validateRegister, // 验证数据
    authController.register
);

router.post('/login',authController.login)

// 需要认证的路由
router.get(
    '/profile',
    authMiddleware.authenticateToken, // 先验证令牌
    authController.getProfile
);

router.post(
    '/refresh-token',
    authMiddleware.authenticateToken,
    authController.refreshToken
);

// 需要管理员权限的路由
router.get(
    '/admin/users',
    authMiddleware.authenticateToken, // 先验证令牌
    authMiddleware.authorize(ROLES.ADMIN),
    authController.getAllUsers
);