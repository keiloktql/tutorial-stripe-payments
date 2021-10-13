const { Accounts } = require("./src/schemas/Accounts");
const { Accounts_PaymentMethods } = require("./src/schemas/Accounts_PaymentMethods");
const { Invoices } = require("./src/schemas/Invoices");
const { Passwords } = require("./src/schemas/Passwords");
const { PaymentMethods } = require("./src/schemas/PaymentMethods");
const { Plans } = require("./src/schemas/Plans");
const { Products } = require("./src/schemas/Products");
const { Subscriptions } = require("./src/schemas/Subscriptions");


const express = require("express");
const cors = require("cors");
const chalk = require('chalk');

const config = require("./src/config/config");
const routes = require("./src/routes");
const db = require("./src/config/connection");

const app = express();
const PORT = config.port ?? 5000;   // ?? are called nullish coalescing

const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();
app.use(router);

app.listen(PORT, (error) => {
    if (error) console.log(chalk.red(`FAIL TO LISTEN ON PORT ${PORT}`));
    else console.log(chalk.green(`LISTENING TO PORT ${PORT}`));
});

// setting this to true will drop all tables and seed new data
const reset = false;

// sync sequelize with sql db
// immediately invoked function necessary to run await async code
// no top level await available here (only in es modules/mjs)
(async function () {
    try {
        // force: drop all tables and regen them
        // alter: attempts to change tables to conform to models (doesn't always work)
        await db.sync({ force: reset });
        console.log(chalk.green("SUCCESSFULLY SYNCED DB"));

        // seeding data
        if (reset) {
            console.log(chalk.yellow("LOADING SEEDER"));
            // dynamic imports
            // should help with faster startup if not in use
            const { seeder } = require("./database/seeder");
            await seeder();
        }
    } catch (error) {
        console.log(error);
    }
})();

routes(router);