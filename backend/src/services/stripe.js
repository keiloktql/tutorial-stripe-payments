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