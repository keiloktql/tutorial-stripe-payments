const config = require("../config/config");

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
//
// tier -> 0 = All users
//         1 = Standard and Premium Users only
//         2 = Premium Users only
