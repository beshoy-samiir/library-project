const jwt = require('jsonwebtoken');

const userAuthentication = async (req, res, next) => {
    const authHeader = req.headers.Authorization || req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "Token Not Found" 
        });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWTKEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "User token is incorrect." 
            });
        } else {
            req.user = decoded.userData;
            next();
        }
    });
};

module.exports = userAuthentication;