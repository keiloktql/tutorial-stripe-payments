const { findAllProducts } = require('../models/product');

// READ
module.exports.findAllProducts = async (req, res) => {
    try {
        const products = await findAllProducts();

        if (products.length === 0) return res.status(204).send();

        return res.status(200).send(products);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > product.js > findAllProducts! " + error);
    }
}
