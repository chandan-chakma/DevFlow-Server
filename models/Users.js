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

    // check existing user 
    async existUser(email) {
        const user = await this.collection.findOne({ email });
        return !!user;
    }

    // find all user or get user 
    async findAllUser() {
        const cursor = await this.collection.find().toArray();
        return cursor;
    }


}
module.exports = UserModel;