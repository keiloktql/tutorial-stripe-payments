const { Op } = require("sequelize");

const { Accounts } = require("../schemas/Accounts");
const { Subscriptions } = require("../schemas/Subscriptions");

// Create Subscription
module.exports.createSubscription = (subscriptionID, planID, accountID, paymentIntentID, clientSecret) => Subscriptions.create({
    stripe_subscription_id: subscriptionID,
    fk_plan_id: planID,
    fk_account_id: accountID,
    stripe_payment_intent_id: paymentIntentID,
    stripe_client_secret: clientSecret,
    stripe_status: "incomplete"
});

// Update Subscription Plan
module.exports.updateSubscriptionPlan = (subscriptionID, planID) => Subscriptions.update({
    fk_plan_id: planID,
    where: {
        stripe_subscription_id: subscriptionID,
    }
});

// Update Subscription Status
module.exports.updateSubscriptionStatus = (subscriptionID, status) => Subscriptions.update({
    stripe_status: status,
    where: {
        stripe_subscription_id: subscriptionID,
    }
});

// Update Subscription Payment method
module.exports.updateSubscriptionPaymentMethod = (subscriptionID, paymentMethodID) => Subscriptions.update({
    fk_payment_method: paymentMethodID,
    where: {
        stripe_subscription_id: subscriptionID,
    }
});

// Delete Subscription (Note: Different from canceled subscriptions. Canceled Subscription records remain in the system for archival purposes)
module.exports.deleteSubscription = (subscriptionID) => Subscriptions.destroy({
    where: {
        stripe_subscription_id: subscriptionID
    }
})

// Find active subscritions
module.exports.findActiveSubscription = (accountID) => Subscriptions.findOne({
    where: {
        fk_account_id: accountID,
        stripe_status: {
            [Op.ne]: "canceled"
        }
    }
});