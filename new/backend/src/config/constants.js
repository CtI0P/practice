module.exports={
    JWT:{
        SECRET: process.env.JWT_SECRET,
        EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        ALGORITHM:'HS256'   
    },
    ROLES:{
        ADMIN:'admin',
        USER:'user',
        GUEST:'guest'
    },
    HTTP_STATUS:{
        OK:200,
        CREATED:201,
        BAD_REQUEST:400,
        UNAUTHORIZED:401,
        FORBIDDEN:403,
        NOT_FOUND:404,
        INTERNAL_ERROR:500
    }
}