const config = require("../config/config");

// Test secret API Key
const stripe = require("stripe")(config.stripe.test.secretKey);

// Create payment intent
module.exports.createPaymentIntent = (totalPrice, stripeCustomerID, email) => stripe.paymentIntents.create({
  amount: totalPrice,
  currency: "sgd",
  customer: stripeCustomerID || null,
  receipt_email: email || null
});

// Update payment intent
module.exports.updatePaymentIntent = (paymentIntentID, totalPrice) => stripe.paymentIntents.update(
  paymentIntentID, {
  amount: totalPrice,
  currency: "sgd"
});

// Create customer
module.exports.createStripeCustomer = (email, username) => stripe.customers.create({
  email,
  name: username
});

// Update customer
module.exports.updateStripeCustomer = (customerID, meta) => stripe.customers.update(
  customerID,
  meta
);

// Detach payment method
module.exports.detachPaymentMethod = (paymentMethodID) => stripe.paymentMethods.detach(
  paymentMethodID
);

// Find payment method
module.exports.findPaymentMethodFromStripe = (paymentMethodID) => stripe.paymentMethods.retrieve(
  paymentMethodID
);

// Create setup intent
module.exports.createSetupIntent = (customerID) => stripe.setupIntents.create({
  customer: customerID,
});

// Create subscription
module.exports.createSubscriptionInStripe = (customerID, subscriptionPriceID, email) => stripe.subscriptions.create({
  customer: customerID,
  items: [{
    price: subscriptionPriceID
  }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
  receipt_email: email // setting email for receipt_email will tell Stripe to automatically  send email for successful payments
});

// Update subscription plan
module.exports.updateSubscriptionPlanInStripe = (subscriptionID, subscriptionPriceID) => stripe.subscriptions.update(
  subscriptionID,
  {
    items: [{
      price: subscriptionPriceID
    }],
    proration_behavior: none
  },
);

// Update subscription payment method
module.exports.updateSubscriptionPaymentMethodInStripe = (subscriptionID, paymentMethodID) => stripe.subscriptions.update(
  subscriptionID,
  {
    default_payment_method: paymentMethodID
  }
);

// Update subscription email
module.exports.updateSubscriptionEmailInStripe = (subscriptionID, email) => stripe.subscriptions.update(
  subscriptionID,
  {
    receipt_email: email  // invoice email will be sent to this email automatically
  }
);

// Cancel subscription
module.exports.cancelSubscription = (stripeSubscriptionID) => stripe.subscriptions.del(
  stripeSubscriptionID
);