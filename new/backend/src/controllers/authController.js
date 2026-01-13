const User=require('../models/User');
const {generateToken}=require('../utils/jwt');
const {HTTP_STATUS,ROLES}=require('../config/constants');

class AuthController{
    // 用户注册
    async register(req,res){
        try{
            const {username,password,email,role=ROLES.USER}=req.body;

            // 创建用户
            const user=await User.create({username,password,email,role});

            // 生成JWT令牌
            const token=generateToken({
                userId:user.id,
                username:user.name,
                role:user.role,
                email:user.email
            });

            res.status(HTTP_STATUS.CREATED).json({
                success:true,
                message:'注册成功',
                data:{
                    token,
                    user:user.toJSON()
                }
            });
        }catch(error){
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success:false,
                message:error.message || '注册失败'
            });
        }
    }

    // 用户登录
    async login(req,res){
        try{
            const {username,password}=req.body;

            // 查找用户
            const user=await User.findByUsername(usename);
            if(!user){
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success:false,
                    message:'用户名或密码错误'
                });
            }

            // 生成JWT令牌
            const token=generateToken({
                userId:user.id,
                username:user.username,
                role:user.role,
                email:user.email
            });

            res.json({
                success:true,
                message:'登录成功',
                data:{
                    token,
                    user:user.toJSON()
                }
            });
        }catch(error){
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success:false,
                message:'登录失败'
            });
        }
    }

    //获取当前用户信息
    async getProfile(req,res){
        try{
            const user=await User.findById(req.user.userId);
            if(!user){
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success:false,
                    message:'用户不存在'
                });
            }
            
            res.json({
                success:true,
                data:user.toJSON()
            });
        }catch(error){
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success:false,
                message:'获取用户信息失败'
            });
        }
    }

    //刷新令牌
    async refreshToken(req,res){
        try{
            // 实际项目中这里会验证刷新令牌
            // 这里简化处理，直接使用现有用户信息生成新令牌
            const newToken=generateToken(req.user);

            res.json({
                success:true,
                message:'令牌刷新成功',
                data:{
                    token:newToekn
                }
            });


        }catch(error){
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success:false,
                message:'刷新令牌失败'
            });
        }
    }

    //管理员获取所有用户 
    async getAllUsers(req,res){
        try{
            // 示例，要修改的
            //
            //
            const users=await Promise.all(User.users.map(async user=>{
                return user.toJSON();
            }));

            res.json({
                success:true,
                data:{
                    users,
                    total:users.length
                }
            });
        }catch(error){
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success:false,
                message:'获取用户列表失败'
            });
        }
    }
}

module.exports=new AuthController();