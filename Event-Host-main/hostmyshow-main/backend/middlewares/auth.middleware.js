import jwt from 'jsonwebtoken'
export const authenticate = (req , res , next) => {
    // First check for token in cookies
    let token = req.cookies?.token;
    
    // If not in cookies, check Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }
    
    if(!token){
        return res.status(401).send({message : "You need to login first" , success : false});
    }
    jwt.verify(token , process.env.JWT_SECRET , (err , decode)=> {
        if(err){
            return res.status(401).send({message : "Token not valid , Please Contact Admin" , success : false});
        }
        req.user = decode;
        next()
    })
}