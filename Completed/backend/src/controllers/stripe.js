const { updatePaymentIntent } = require('../services/stripe');

// Update payment intent
module.exports.updatePaymentIntent = async (req, res) => {
    try {
        const { paymentIntentID } = req.body;
        if (!paymentIntentID) return res.status(400).json({
            message: "Cannot find parameter \"paymentIntentID\""
        });
        const totalPrice = res.locals.cartInfo;
  
        await updatePaymentIntent(paymentIntentID, totalPrice);
  
        return res.status(204).send();
  
    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > stripe.js! " + error);
    }
  };
  