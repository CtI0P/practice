const {verifyToken}=require('../utils/jwt');
const {HTTP_STATUS}=require('../config/constants');

//验证JWT令牌的中间件
exports.authenticateToken=async (req,res,next)=>{
    try{
        //从请求头中就获取token
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success:false,
                message:'未提供认证令牌'
            });
        }

        const token=authHeader.split(' ')[1];

        // 验证令牌
        const decoded=verifyToken(token);

        // 将用户信息附加到请求对象
        req.user=decoded;

        next();
    }catch(error){
        if(error.message==='令牌已过期'){
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success:false,
                message:'令牌已过期，请重新登录'
            });
        }
        
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success:false,
            message:'无效的认证令牌'
        });
    }
}

// 授权中间件（检查角色）
exports.authorize=(...allowedRoles)=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success:false,
                message:'用户未认证'
            });
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success:false,
                message:'权限不足，禁止访问'
            });
        }

        next();
    }
}

// 验证请求数据的中间件
exports.validateRegister=(req,res,next)=>{
    const {username,password,email}=req.body;

    const errors=[];

    if(!username || username.length<3){
        errors.push('用户名至少需要3个字符');
    }

    if(!password || password.length<8){
        errors.push('密码至少需要8个字符');
    }

    if(!email || !/\S+@\S+\.\S+/.test(email)){
        errors.push('邮箱格式不正确');
    }

    if(errors.length>0){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success:false,
            message:'验证失败',
            errors
        });
    }

    next();
}