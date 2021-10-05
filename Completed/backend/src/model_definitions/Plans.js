const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const Plans = db.define(
    "Plans",
    {
        plan_id: {
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
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        // Stripe
        stripe_product_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        stripe_price_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        }
    },
    {
        tableName: "plans",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true,
        deletedAt: "deleted_at"
    }
);

module.exports = { Plans };