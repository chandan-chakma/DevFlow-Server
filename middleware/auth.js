var jwt = require('jsonwebtoken');
const verfyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send({message:'Unauthorize Access'})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decoded);
            req.token_email = decoded.email;
            next(); 
    }
    catch (error) {
        return res.status(401).send({message:'Unauthorize Access'})
    }
}

const verifyAdmin = async(req, res, next) => {
    if (!req.collections) {
        return res.status(500).send({ message: 'Database collections not available' });
    }
    const { users } = req.collections;
    const email = req.token_email;
    const query = { email };
    const user = await users.findOne(query);
    if (!user || user.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' });
    }

    next();
}




const verifyProjectManager = async (req, res, next) => {
    try {
        const { users, projectMembers } = req.collections;

        // Find authenticated user
        const user = await users.findOne({
            email: req.token_email
        });

        if (!user) {
            return res.status(404).send({
                message: 'User not found'
            });
        }

        // Global admin can manage every project
        if (user.role === 'admin') {
            return next();
        }

        // Get project ID from request
        const projectId = req.params.id || req.params.projectId;

        if (!projectId || !/^[a-fA-F0-9]{24}$/.test(projectId)) {
            return res.status(400).send({
                message: 'Invalid project ID'
            });
        }

        // Check project manager membership
        const membership = await projectMembers.findOne({
            projectId: new (require('mongodb').ObjectId)(projectId),
            userId: user._id,
            role: 'manager'
        });

        if (!membership) {
            return res.status(403).send({
                message: 'Only project managers can perform this action'
            });
        }

        next();

    } catch (error) {
        console.error('Project manager authorization error:', error);

        return res.status(500).send({
            message: 'Internal Server Error'
        });
    }
};

module.exports = { verfyToken, verifyAdmin, verifyProjectManager }