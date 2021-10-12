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
module.exports.createSubscriptionInStripe = (stripeCustomerID, stripeSubscriptionPriceID, email) => stripe.paymentIntents.create({
  customer: stripeCustomerID,
  items: [{
    price: stripeSubscriptionPriceID
  }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
  receipt_email: email
});

// Update subscription
module.exports.updateSubscriptionInStripe = (stripeSubscriptionID, stripeSubscriptionPriceID) => stripe.paymentIntents.update({
  customer: stripeCustomerID,
  items: [{
    price: stripeSubscriptionPriceID
  }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
  receipt_email: email
});