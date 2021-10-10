const { Products } = require("../schemas/Products");
const { Op } = require("sequelize");

module.exports.findAllProducts = () => Products.findAll();

module.exports.findProducts = (productsArr) => Products.findAll({
    where: {
        product_id: {
            [Op.in]: productsArr
        }
    }
});