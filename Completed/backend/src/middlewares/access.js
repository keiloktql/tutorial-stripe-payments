const config = require("../config/config");

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
                console.log(`⚠️  Webhook signature verification failed.`, err.message);
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