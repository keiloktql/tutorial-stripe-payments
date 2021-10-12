const { findPlan } = require('../models/plan');

module.exports.checkIfPlanExist = async (req, res, next) => {
    // This middleware checks if plan exists
    try {

        const { type } = req.params;

        if (!type) return res.status(400).json({
            message: "Invalid parameter \"type\""
        });

        // Check if plan exists
        const plan = await findPlan(type);
        if (!plan) return res.status(404).json({
            message: "Cannot find parameter \"plan\""
        });

        res.locals.plan = plan;

        return next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
};