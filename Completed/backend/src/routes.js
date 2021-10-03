// CONTROLLERS
// const accountController = require("./controllers/account");
const authController = require("./controllers/auth");
// const stripeController = require("./controllers/stripe");
const productController = require("./controllers/product");

// MIDDLEWARES
const { isLoggedIn } = require("./middlewares/login");
// const { calculateProductsTotalPrice } = require("./middlewares/payment");
const { verifyStripeWebhookRequest } = require("./middlewares/access");

module.exports = router => {

    // Default URL check
    router.get("/", (req, res) => {
        res.status(200).send("안녕하세요~! Deluxe api is functioning properly");
    })

    // // WEBHOOKS
    // router.post("/api/v1/webhooks/stripe", verifyStripeWebhookRequest, stripeController.handleWebhook);

    // LOGIN
    router.post("/api/v1/login", authController.clientLogin);

    // // STRIPE PAYMENT
    // router.post("/api/v1/stripe/payment_intents", isLoggedIn, calculateProductsTotalPrice, stripeController.createPaymentIntent);
    // router.put("/api/v1/stripe/payment_intents", isLoggedIn, calculateProductsTotalPrice, stripeController.updatePaymentIntent);

    // PRODUCTS
    router.get("/api/v1/products", isLoggedIn, productController.findAllProducts);
};