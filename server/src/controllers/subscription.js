const { Subscription, findActiveSubscription, findLiveSubscription } = require('../models/subscription');

// active means 'subscription status' / 'stripe_status' can be:
// 'active', 'trialing', 'past_due'
module.exports.findActiveSubscription = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);
        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const activeSubscription = await findActiveSubscription(accountID);

        if (!activeSubscription) return res.status(204).send();

        return res.status(200).send({ activeSubscription });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > subscription.js > findActiveSubscription! " + error);
    }
}

// live means 'subscription status' / 'stripe_status' can be: 
// 'incomplete', 'active', 'trialing', 'past_due'
module.exports.findLiveSubscription = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);
        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const liveSubscription = await findLiveSubscription(accountID);

        if (!liveSubscription) return res.status(204).send();

        return res.status(200).send({ liveSubscription });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > subscription.js > findLiveSubscription! " + error);
    }
}