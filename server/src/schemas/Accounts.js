const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const Accounts = db.define(
    "Accounts",
    {
        account_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        trialed: {
            // Tracks whether account has free trialed the system before
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        // Stripe
        stripe_customer_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        stripe_payment_intent_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        stripe_payment_intent_client_secret: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        }
    },
    {
        tableName: "accounts",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true,
        deletedAt: "deleted_at"
    }
);

module.exports = { Accounts };