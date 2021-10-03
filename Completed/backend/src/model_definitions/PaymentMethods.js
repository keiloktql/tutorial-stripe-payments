const { DataTypes } = require("sequelize");
const db = require("../config/connection");

const PaymentMethods = db.define(
    "PaymentMethods",
    {
        payment_method_id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
            autoIncrement: false
        },
        payment_method_fingerprint: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        card_exp_date: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        card_last_four_digit: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        card_type: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        card_bg_variation: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    },
    {
        tableName: "payment_methods",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        paranoid: true,
        deletedAt: "deleted_at"
    }
);

module.exports = { PaymentMethods };