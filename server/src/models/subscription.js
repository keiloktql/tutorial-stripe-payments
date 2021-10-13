const { Op } = require("sequelize");
const { Invoices } = require("../schemas/Invoices");

const { Plans } = require("../schemas/Plans");
const { Subscriptions } = require("../schemas/Subscriptions");

// Create Subscription
module.exports.createSubscription = (subscriptionID, planID, accountID, status, meta) => Subscriptions.create({
    ...meta,
    stripe_subscription_id: subscriptionID,
    fk_plan_id: planID,
    fk_account_id: accountID,
    stripe_status: status
});

// Update Subscription
module.exports.updateSubscription = (subscriptionID, meta) => Subscriptions.update({
    ...meta,
    where: {
        stripe_subscription_id: subscriptionID
    }
});

// Delete Subscription (Note: Different from canceled subscriptions. Canceled Subscription records remain in the system for archival purposes)
module.exports.deleteSubscription = (subscriptionID) => Subscriptions.destroy({
    where: {
        stripe_subscription_id: subscriptionID
    }
});

// Find live subscriptions
// live means subscription status aka stripe_status can be: 
// 'incomplete', 'active', 'trialing', 'past_due'
module.exports.findLiveSubscription = (accountID) => Subscriptions.findOne({
    where: {
        fk_account_id: accountID,
        stripe_status: {
            [Op.ne]: "canceled"
        }
    },
    include: [{
        model: Plans,
        as: "plan"
    }, {
        model: Invoices,
        as: "invoice"
    }] 
});

// Find active subscriptiobs
// active means subscription status aka stripe_status can be:
// 'active', 'trialing', 'past_due'
module.exports.findActiveSubscription = (accountID) => Subscriptions.findOne({
    where: {
        fk_account_id: accountID,
        stripe_status: {
            [Op.notIn]: ["canceled", "incomplete"]
        }
    },
    include: [{
        model: Plans,
        as: "plan"
    }] 
});

// Find all subscriptions by accountID
module.exports.findSubscriptionsByAccountID = (accountID) => Subscriptions.findAll({
    where: {
        fk_account_id: accountID
    },
    include: [{
        model: Invoices,
        as: "invoice"
    }]
});