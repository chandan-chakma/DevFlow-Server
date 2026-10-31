// Middleware to attach database collections to request object
const attachCollections = (collection) => {
    return (req, res, next) => {
        req.collections = collection;
        next();
    };
};

module.exports = { attachCollections };
