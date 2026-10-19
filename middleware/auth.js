var jwt = require('jsonwebtoken');
const verfyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send({message:'Unauthorize Access'})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            // console.log(decoded);
            req.token_email = decoded.email;
            next();
        })  
    }
    catch (error) {
        return res.status(401).send({message:'Unauthorize Access'})
    }
}
module.exports={verfyToken}