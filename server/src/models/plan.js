const { Plans } = require("../schemas/Plans");


// Find Plan
module.exports.findPlan = (type) => Plans.findOne({
    where: {
        name: type
    }
});

// Find Plan By PriceID
module.exports.findPlanByPriceID = (priceID) => Plans.findOne({
    where: {
        stripe_price_id: priceID
    }
});