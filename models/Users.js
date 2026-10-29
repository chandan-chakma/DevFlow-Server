const { ObjectId } = require("mongodb");

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

    // find signle user by email 
    async findUserByEmail(email) {
        return await this.collection.findOne({ email });
    }

    // update user role 
    async updateRole(id, role) {
        const query = { _id: new ObjectId(id) }
        const updateDoc = {
            $set:{
                role:role
            }
        }
        return await this.collection.updateOne(query,updateDoc)
    }

    // delet user

    async deleteUser(id) {
        const query = { _id: new ObjectId(id) }
        const result = await this.collection.deleteOne(query);
        return result;
    }


}
module.exports = UserModel;