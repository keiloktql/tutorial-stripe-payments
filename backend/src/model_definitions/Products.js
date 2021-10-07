const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const Products = db.define(
    "Products",
    {
        product_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        image_link: {
            type: DataTypes.STRING(500),
            allowNull: false,
        }
    },
    {
        tableName: "products",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true,
        deletedAt: "deleted_at"
    }
);

module.exports = { Products };