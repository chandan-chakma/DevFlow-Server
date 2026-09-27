
const ProjectModel = require("./Projects.js");

function initializeModels(collection) {
    return {
        Project: new ProjectModel(collection.projects)
    }
}
module.exports={initializeModels}