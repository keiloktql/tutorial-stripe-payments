// MODELS IMPORT
const { Accounts } = require("../src/schemas/Accounts");
const { Passwords } = require("../src/schemas/Passwords");
const { Products } = require("../src/schemas/Products");
const { Plans } = require("../src/schemas/Plans");

// SERVICES IMPORT
const { createStripeCustomer } = require("../src/services/stripe");

// NPM modules import
const bcrypt = require("bcryptjs");
const chalk = require('chalk');
const { ExclusiveContents } = require("../src/schemas/ExclusiveContents");

module.exports.seeder = async () => {
    try {
        
            // Create user
            const username = "kim";
            const email = `${username}@deluxe.com`;
            const customer = await createStripeCustomer(email, username);
            const stripeCustomerID = customer.id;

            await Accounts.create({
                username,
                email,
                trialed: false,
                balance: 0,
                passwords: [{
                    password: bcrypt.hashSync("123", 10)
                }],
                stripe_customer_id: stripeCustomerID
            }, {
                include: ["passwords"]
            });

            // Insert product
            await Products.create({
                name: "iTele 15 (Orange) - 128 GB",
                price: "1299.90",
                description: "Better than Apple.",
                image_link: "http://localhost:3000/static/media/iphone_15_orange.d6d6f070.jpg"
            });

            // Insert plans
            await Plans.bulkCreate([
                {
                    name: "Standard",
                    price: "9.90",
                    description: "It's now or never, sign up now to waste money!",
                    // Copy and paste product id and price id from Stripe dashboard
                    stripe_product_id: "prod_KOrxSC360YBZiR",
                    stripe_price_id: "price_1Jk4DlHXFJZDlbxPhKWZwik6"
                },
                {
                    name: "Premium",
                    price: "15.90",
                    description: "A slightly more expensive plan than standard plan.",
                    // Copy and paste product id and price id from Stripe dashboard
                    stripe_product_id: "prod_KOrvrHij2yIrRi",
                    stripe_price_id: "price_1Jk4BiHXFJZDlbxPnocwx0Xm"
                },
            ]);

            // Insert Exclusive Contents
            await ExclusiveContents.bulkCreate([
                {
                    content: "111",
                    access_level: 1
                },
                {
                    content: "222",
                    access_level: 2
                },
                {
                    content: "333",
                    access_level: 3
                },
            ]);
        
        console.log(chalk.green("SEEDING COMPLETE"));
    } catch (error) {
        console.log(chalk.red("ERROR IN DATA SEEDING"), error);
    }
}