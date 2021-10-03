const { Products } = require("../model_definitions/Products");

module.exports.findAllProducts = () => Products.findAll();