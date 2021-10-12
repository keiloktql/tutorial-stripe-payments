const { findProducts } = require("../models/product");

module.exports.calculateProductsTotalPrice = async (req, res, next) => {
    // This middleware double checks the total price before creating a payment intent
    try {
        const { decoded } = res.locals.auth;

        const accountID = parseInt(decoded.account_id);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        // Get all the items 
        const { items } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ message: "No items in cart" });

        const products = await findProducts(items);

        // Calculate products total price
        let totalPrice = 0;
        products.forEach((product, index) => {
            totalPrice += parseFloat(product.price);
        });

        res.locals.totalPrice = parseInt((totalPrice * 100).toFixed(2));    // save total price in res.locals
        return next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
}