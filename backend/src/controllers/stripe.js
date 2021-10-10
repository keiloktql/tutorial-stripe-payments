const { createPaymentIntent, updatePaymentIntent, detachPaymentMethod } = require('../services/stripe');
const { findAccountByID, updateAccountByID } = require('../models/account');

// Create payment intent
module.exports.createPaymentIntent = async (req, res) => {
    try {

        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const account = await findAccountByID(accountID);

        if (!account) return res.status(400).json({
            message: "Cannot find \"account\""
        });

        const { totalPrice } = res.locals;

        let clientSecret;
        let paymentIntentID;

        // Check if user already has a payment intent
        if (account.stripe_payment_intent_id === null) {
            const paymentIntent = await createPaymentIntent(totalPrice, account.stripe_customer_id, account.email);

            clientSecret = paymentIntent.client_secret;
            paymentIntentID = paymentIntent.id;

            const updateAccountContent = {
                stripe_payment_intent_id: paymentIntentID,
                stripe_payment_intent_client_secret: clientSecret
            };
            // Update account with the new payment intent and client secret
            await updateAccountByID(accountID, updateAccountContent);
        } else {
            clientSecret = account.stripe_payment_intent_client_secret;
            paymentIntentID = account.stripe_payment_intent_id;
        }

        return res.status(200).send({ clientSecret, paymentIntentID });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js > createPaymentIntent! " + error);
    }
};

// Update payment intent
module.exports.updatePaymentIntent = async (req, res) => {
    try {
        const { paymentIntentID } = req.body;
        if (!paymentIntentID) return res.status(400).json({
            message: "Cannot find parameter \"paymentIntentID\""
        });
        const { totalPrice } = res.locals;

        await updatePaymentIntent(paymentIntentID, totalPrice);

        return res.status(204).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js > updatePaymentIntent! " + error);
    }
};

// Create setup intent
module.exports.createSetupIntent = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const account = await findAccountByID(accountID);

        if (!account) return res.status(400).json({
            message: "Cannot find \"account\""
        });

        const setupIntent = await createSetupIntent(account.stripe_customer_id);
        const clientSecret = setupIntent.client_secret;
        const setupIntentID = setupIntent.id;

        return res.status(200).send({ clientSecret, setupIntentID });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > createSetupIntent " + error);
    }
};

// Create payment method
module.exports.verifyPaymentMethodSetup = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const { paymentMethodID } = req.body;

        if (!paymentMethodID) return res.status(400).json({
            message:  "Cannot find parameter \"paymentMethodID\""
        });

        // Obtain more details about payment method from Stripe
        const paymentMethod = await findPaymentMethodFromStripe(paymentMethodID);

        if (!paymentMethod) return res.status(400).json({
            message: "Cannot find \"paymentMethod\""
        });

        // Every card has a unique fingerprint
        const cardFingerprint = paymentMethod.card.fingerprint;

        // Check if new payment method already exists in our database
        const duplicatedPaymentMethod = await findDuplicatePaymentMethod(accountID, cardFingerprint, paymentMethodID);

        if (duplicatedPaymentMethod) {
            await detachPaymentMethod(paymentMethodID);

            return res.status(400).json({
                duplicate: true,
                message: "Payment Method already exists"
            });
        }

        const cardLastFourDigit = paymentMethod.card.last4;
        const cardType = paymentMethod.card.brand;
        const cardExpMonth = paymentMethod.card.exp_month.toString();
        const cardExpYear = paymentMethod.card.exp_year.toString();
        const cardExpDate = cardExpMonth + "/" + cardExpYear.charAt(2) + cardExpYear.charAt(3);
            
        await insertPaymentMethod(accountID, paymentMethodID, cardFingerprint, cardLastFourDigit, cardType, cardExpDate);
    
        return res.status(200).send({ duplicate: false });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > createPaymentMethod " + error);
    }
};

// Remove payment method
module.exports.removePaymentMethod = async (req, res) => {
    try {
        const { decoded } = res.locals.auth;
        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const { paymentMethodID } = req.body;

        if (!paymentMethodID) return res.status(400).json({
            message:  "Cannot find parameter \"paymentMethodID\""
        });

        // Remove payment method
        await detachPaymentMethod(paymentMethodID); // Stripe

        await removePaymentMethod(paymentMethodID); // Our database shd be shifte=d to webhook

        // Find payment method in our database
        const paymentMethod = await findPaymentMethod(paymentMethodID);

        if (!paymentMethod) return res.status(400).json({
            message:  "Cannot find \"paymentMethod\""
        });



    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! > removePaymentMethod " + error);
    }
};

// Webhooks
module.exports.handleWebhook = async (req, res) => {
    try {
        const event = req.body;

        // Types of events: https://stripe.com/docs/api/events/types
        switch (event.type) {
            case 'payment_intent.succeeded': {
                // event.data.object returns payment intent
                const paymentIntent = event.data.object;

                // Find out account id from stripe customer id
                const stripeCustomerID = paymentIntent.customer;

                const account = await findAccountByStripeCustID(stripeCustomerID);

                // This step is only applicable for one time payment
                if (paymentIntent.id === account.stripe_payment_intent_id) {
                    const accountID = account.account_id;

                    // Remove customer payment intent and client secret
                    await updateAccountByID(accountID, {
                        stripe_payment_intent_client_secret: null,
                        stripe_payment_intent_id: null
                    });
                }
                break;
            }
            case 'payment_method.automatically_updated': {
                const paymentMethod = event.data.object;

                const cardFingerprint = paymentMethod.card.fingerprint;
                const cardLastFourDigit = paymentMethod.card.last4;
                const cardType = paymentMethod.card.brand;
                const cardExpMonth = paymentMethod.card.exp_month.toString();
                const cardExpYear = paymentMethod.card.exp_year.toString();
                const cardExpDate = cardExpMonth + "/" + cardExpYear.charAt(2) + cardExpYear.charAt(3);
                const paymentMethodID = paymentMethod.id;

                // Update payment method
                await updatePaymentMethod(paymentMethodID, cardFingerprint, cardLastFourDigit, cardType, cardExpDate);
                break;
            }

            // Unexpected event type
            default: {
                // should print errors into a log file
                console.log(`Unhandled event type ${event.type}.`);
            }
        };

        return res.status(200).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js > handleWebhook! " + error);
    }
}