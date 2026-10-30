const { ObjectId } = require("mongodb");

class ProjectMembersModal{
    constructor(collection) {
        this.collection=collection
    }
    // post or create member 
    async createMember(projectId, userId, role = 'member') {
        const memberData = {
            projectId: new ObjectId(projectId),
            userId: new ObjectId(userId),
            role,
            joinedAt: new Date()
        };

        return await this.collection.insertOne(memberData);
    }

    // find member by project 
    async findMembersByProjectId(projectId) {
        const pipeline = [
            {
                $match: {
                    projectId: new ObjectId(projectId)
                }
            },

            // 2. Join the users collection
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },

            // 3. Convert the user array into one object
            {
                $unwind: '$user'
            },

            // 4. Select the fields we want to return
            {
                $project: {
                    _id: '$user._id',
                    name: '$user.displayName',
                    email: '$user.email',
                    photoURL: '$user.photoURL',
                    role: 1,
                    joinedAt: 1
                }
            }
        ];
        const result = await this.collection.aggregate(pipeline).toArray();
        return result;
    }


    // update project member role 
    // Update project member role
    async updateMemberRole(projectId, userId, role) {
        const query = {
            projectId: new ObjectId(projectId),
            userId: new ObjectId(userId)
        };

        const updateDoc = {
            $set: { role }
        };

        return await this.collection.updateOne(query, updateDoc);
    }

}
module.exports = ProjectMembersModal;