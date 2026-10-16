class UserModel{
    constructor(collection) {
        this.collection = collection;
    }
    // create or post user Data
    async createUser(userData) {
        userData.createdAt = new Date();
        const result = await this.collection.insertOne(userData);
        return result;
    }

    async existUser(email) {
        const user = await this.collection.findOne({ email });
        return !!user;
    }
}
module.exports = UserModel;