// 用户数据模型
const pool=require('../config/database')
const bcrypt=require('bcryptjs')
const {ROLES}=reqire('../config/constants')

class User{
    constructor(data){
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.password_hash = data.password_hash;
        this.fullname = data.fullname;
        this.role = data.role || ROLES.USER;
        this.avatar_url = data.avatar_url || '';
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
    }

    //验证密码
    async comparePassword(password){
        if(!this.password_hash){
            return false;
        }
        return bcrypt.compare(password,this.password_hash);
    }

    //转换成JSON，不包含密码
    toJSON(){
        return{
            id: this.id,
            username: this.username,
            email: this.email,
            fullname: this.fullname || '未设置',
            role: this.role,
            avatar_url: this.avatar_url,
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

class UserModel{
    //根据用户名查找用户
    async findByUsername(username){
        try{
            const [rows]=await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            if(rows.length===0){
                return null;
            }

            return new User(rows[0]);
        }catch(error){
            console.error('根据用户名查找用户失败：',error);
            throw error;
        }
    }

    //根据ID查找用户
    async findById(id){
        try{
            const [rows]=await pool.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );

            if(rows.length===0){
                return null;
            }

            return new User(rows[0]);
        }catch(error){
            console.error('根据ID查找用户失败：',error);
            throw error;
        }
    }

    //根据邮箱查找用户
    async findByEmail(email){
        try{
            const [rows]=await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if(rows.length===0){
                return null;
            }

            return new User(rows[0]);
        }catch(error){
            console.error('根据邮箱查找用户失败：',error);
            throw error;
        }
    }

    //创建新用户
    async create(userDate){
        try{
            const {username,email,password,fullname='',role=ROLES.USER,avatar_url=''}=userDate;

            // 检查用户是否已经存在
            const existingUserByUsername=await this.findByUsername(username);
            const existingUserByEmail=await this.findByEmail(email);

            if(existingUserByEmail){
                throw new Error('用户已存在');
            }

            if(existingUserByUsername){
                throw new Error('邮箱已被注册');
            }

            //哈希密码
            const hashedPassword=await bcrypt.hash(password,10);

            //插入数据库
            const [result]=await pool.execute(
                `INSERT INTO users 
                (username, email, password_hash, fullname, role, avatar_url, is_active, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [username, email, hashedPassword, fullname, role, avatar_url, true]
            );

            //获取新创建的用户
            return await this.findById(result.insertedId);
        }catch(error){
            console.error('创建用户失败：',error);
            throw error;
        }
    }

    //更新用户信息
    async update(id,updateData){
        try{
            const {username,email,password,fullname,role,avatar_url,is_active}=updateData;

            // 构建更新字段
            const fields=[];
            const values=[];

            if(username!==undefined){
                fields.push('username=?');
                values.push(username);
            }

            if(email!==undefined){
                fields.push('email=?');
                values.push('email');
            }

            if(fullname!==undefined){
                fields.push('fullname=?');
                values.push(fullname);
            }

            if(role!==undefined){
                fields.push('role=?');
                values.push(role);
            }

            if(avatar_url!==undefined){
                fields.push('avatar_url=?');
                values.push(avatar_url);
            }

            if(is_active!==undefined){
                fields.push('is_active=?');
                values.push(is_active);
            }

            //更新时间
            fields.push('updated_at=NOW()');

            if(fields.length===0){
                throw new Error('没有要更新的字段');
            }

            values.push(id);

            const [result]=await pool.execute(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            if(result.affectedRows===0){
                throw new Error('用户不存在');
            }

            //获取更新后的用户
            return await this.findById(id);
        }catch(error){
            console.error('更新用户失败：',error);
            throw error;
        }
    }

    //更新密码
    async updatePassword(id,newPassword){
        try{
            const hashedPassword=await bcrypt.hash(newPassword,10);

             const [result]=await pool.execute(
                'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
                [hashedPassword, id]
            );

            return result.affectedRows>0;
        }catch(error){
            console.error('更新密码失败：',error);
            throw error;
        }
    }

    //删除用户
    async delete(id){
        try{
            const [result]=await pool.execute(
                'DELETE FROM users WHERE id = ?',
                [id]
            );

            return result.affectedRows>0;
        }catch(error){
            console.error('删除用户失败：',error);
            throw error;
        }
    }

    //获取所有用户
    async findAll(options={}){
        try{
            const{
                page=1,
                limit=10,
                sortBy='created_at',
                sortOrder='DESC',
                search='',
                role='',
                is_active='',
            }=options;

            const offset=(page-1)*limit;

            //构建查询条件
            let whereClause='WHERE 1=1';
            const params=[];

            if(search){
                whereClause+=' AND (username LIKE ? OR email LIKE ? OR fullname LIKE ?)';
                const searchTerm=`%${search}%`;
                params.push(searchTerm,searchTerm,searchTerm);
            }

            if(role){
                whereClause+=' AND role = ?';
                params.push(role);
            }

            if(is_active!==''){
                whereClause+=' AND is_active = ?';
                params.push(is_active==='true');
            }

            //查询总数
            const [totalRows]=await pool.execute(
                `SELECT COUNT(*) as count FROM users ${whereClause}`,
                params
            );

            const total=totalRows[0].count;

            //查询分页数据
            const queryParams=[...params,limit,offset];
            const [rows]=await pool.execute(
                `SELECT * FROM users 
                ${whereClause}
                ORDER BY ${sortBy} ${sortOrder}
                LIMIT ? OFFSET ?`,
                queryParams
            );

            //转换为User对象数组
            const users=rows.map(row=>new User(row));

            return{
                users,
                total,
                page,
                limit,
                totalPages:Math.ceil(total/limit)
            };
        }catch(error){
            console.error('获取用户列表失败：',error);
            throw error;
        }
    }

    //激活/禁用用户
    async toggleActive(id,isActive){
        try{
            const [result]=await pool.execute(
                'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
                [isActive, id]
            );

            return result.affectedRows>0;
        }catch(error){
            console.error('切换用户状态失败：',error);
            throw error;
        }
    }
}

module.exports=new UserModel();