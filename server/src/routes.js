// CONTROLLERS
const accountController = require("./controllers/account");
const authController = require("./controllers/auth");
const exclusiveContentController = require("./controllers/exclusiveContent");
const productController = require("./controllers/product");
const stripeController = require("./controllers/stripe");
const subscriptionController = require("./controllers/subscription");

// MIDDLEWARES
const { verifyStripeWebhookRequest, checkPremiumAccess, checkStandardAccess } = require("./middlewares/access");
const { isLoggedIn } = require("./middlewares/login");
const { calculateProductsTotalPrice } = require("./middlewares/payment");
const { checkIfPlanExist } = require("./middlewares/subscription");

module.exports = router => {

    // Default URL check
    router.get("/", (req, res) => {
        res.status(200).send("안녕하세요~! Deluxe api is functioning properly");
    })

    // WEBHOOKS
    router.post("/api/v1/webhooks/stripe", verifyStripeWebhookRequest, stripeController.handleWebhook);

    // LOGIN
    router.post("/api/v1/login", authController.clientLogin);

    // ACCOUNTS
    router.get("/api/v1/account/:accountID", isLoggedIn, accountController.findAccountByID);
    router.post("/api/v1/account", accountController.createAccount);
    router.put("/api/v1/account", isLoggedIn, accountController.editAccount);

    // SUBSCRIPTIONS
    router.get("/api/v1/subscription/active", isLoggedIn, subscriptionController.findActiveSubscription);
    router.get("/api/v1/subscription/live", isLoggedIn, subscriptionController.findLiveSubscription);

    // EXCLUSIVE CONTENT
    
    // All users
    router.get("/api/v1/exclusive-contents/all", isLoggedIn, (req, res) => exclusiveContentController.findExclusiveContent(req, res, 1));
    
    // Premium, standard, free trial users only
    router.get("/api/v1/exclusive-contents/standard", isLoggedIn, checkStandardAccess, (req, res) => exclusiveContentController.findExclusiveContent(req, res, 2));
    
    // Premium and free trial users only
    router.get("/api/v1/exclusive-contents/premium", isLoggedIn, checkPremiumAccess, (req, res) => exclusiveContentController.findExclusiveContent(req, res, 3));

    // STRIPE PAYMENT

    // Create payment intent
    router.post("/api/v1/stripe/payment_intents", isLoggedIn, calculateProductsTotalPrice, stripeController.createPaymentIntent);

    // Update payment intent
    router.put("/api/v1/stripe/payment_intents", isLoggedIn, calculateProductsTotalPrice, stripeController.updatePaymentIntent);

    // Create setup intent
    router.post("/api/v1/stripe/setup_intents", isLoggedIn, stripeController.createSetupIntent);

    // Create payment method
    router.post("/api/v1/stripe/payment_methods", isLoggedIn, stripeController.createPaymentMethod);

    // Delete payment method
    router.delete("/api/v1/stripe/payment_methods/:paymentMethodID", isLoggedIn, stripeController.removePaymentMethod);

    // Create Subscription
    router.post("/api/v1/stripe/subscriptions/:type", isLoggedIn, checkIfPlanExist, stripeController.createSubscription);

    // Update Subscription Plan
    router.put("/api/v1/stripe/subscriptions/:type", isLoggedIn, checkIfPlanExist, stripeController.updateSubscription);
    
    // Update Subscription Default Payment Method
    router.put("/api/v1/stripe/subscriptions", isLoggedIn, stripeController.updateSubscription);

    // Cancel Subscription
    router.delete("/api/v1/stripe/subscriptions", isLoggedIn, stripeController.cancelSubscription);

    // PRODUCTS
    router.get("/api/v1/products", isLoggedIn, productController.findAllProducts);
};