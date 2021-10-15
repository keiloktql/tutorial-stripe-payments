const { ExclusiveContents } = require("../schemas/ExclusiveContents");

module.exports.findExclusiveContent = (accessLevel) => ExclusiveContents.findAll({
    where: {
        access_level: accessLevel
    }
});