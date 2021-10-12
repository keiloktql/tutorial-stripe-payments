const { Plans } = require("../schemas/Plans");


// Find Plan
module.exports.findPlan = (type) => Plans.findOne({
    where: {
        name: type
    }
});