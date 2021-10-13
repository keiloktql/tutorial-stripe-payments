const config = require("../config/config");
const { findAccountByID } = require("../models/account");
const { findActiveSubscription } = require("../models/subscription");

// Check whether webhook request is from Stripe
module.exports.verifyStripeWebhookRequest = async (req, res, next) => {
    try {
        const event = req.body;
        // WEBHOOK SECRET
        const endpointSecret = config.stripe.test.webhookSecret;
        const stripe = require("stripe")(config.stripe.test.secretKey);

        if (endpointSecret) {
            // Get the signature sent by Stripe
            const signature = req.headers['stripe-signature'];
            try {
                event = stripe.webhooks.constructEvent(
                    req.body,
                    signature,
                    endpointSecret
                );
            } catch (err) {
                console.log(`Webhook signature verification failed.`, err.message);
                return response.sendStatus(400);
            }
        }
        return next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
};

// Check whether to allow access to content exclusive to subscribers
// (for reference) Plan types: Normal (no plan), Standard, Premium
//
// NOTE: Admin level does not affect access

// Accessible by Premium and free trial users only
module.exports.checkPremiumAccess = async (req, res, next) => {
    try {
        const { decoded } = res.locals.auth;

        const accountID = decoded.account_id;

        // Get active subscription information
        // Active can be: "active, canceling, trialing, past_due"
        const activeSubscription = findActiveSubscription(accountID);

        if (!activeSubscription) return res.status(403).send({
            message: "No active subscriptions!"
        });

        // Allow premium and free trial user access to premum plan 
        if (activeSubscription.fk_plan_id !== "123" && activeSubscription.stripe_status !== "trialing") return res.status(403).send({
            message: "Access only allowed for premium subscribers!"
        });

        return next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
}

// Accessible by Standard, Premium and free trial users only
module.exports.checkStandardAccess = async (req, res, next) => {
    try {
        const { decoded } = res.locals.auth;

        const accountID = decoded.account_id;

        // Get active subscription information
        // Active can be: "active, canceling, trialing, past_due"
        const activeSubscription = findActiveSubscription(accountID);

        if (!activeSubscription) return res.status(403).send({
            message: "No active subscriptions!"
        });

        if (activeSubscription.fk_plan_id !== "321" && activeSubscription.fk_plan_id !== "123") return res.status(403).send({
            message: "Access only allowed for premium subscribers!"
        });

        return next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
}
