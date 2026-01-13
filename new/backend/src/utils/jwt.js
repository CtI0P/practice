const jwt=require('jsonwebtoken');
const {JWT}=require('../config/constants.js');

class JWTService{
    static generateToken(payload,expiresIn=JWT.EXPIRES_IN){
        const options={
            expiresIn,
            algorithm:JWT.ALGORITHM
        };

        return jwt.sign(payload,JWT.SECRET,options);
    }

    static verifyToken(token){
        try{
            return jwt.verify(token,JWT.SECRET)
        }catch(error){
            if(error.name==='TokenExpiredError'){
                throw new Error('令牌已过期，请重新登录');
            }
            if(error.name==='JsonWebTokenError'){
                throw new Error('无效的令牌');
            }
            throw new Error('令牌验证失效');
        }
    }

    static decodeToken(token){
        return jwt.decode(token);
    }
}

module.exports=JWTService;