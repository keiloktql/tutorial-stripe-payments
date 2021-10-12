const { db: { name, user, password, host, port } } = require("./config");
const { Sequelize } = require("sequelize");
const chalk = require('chalk');

const db = new Sequelize(name, user, password, {
    host, port, dialect: "mysql"
});

(async function () {
    try {
        await db.authenticate()
            .then(() => console.log(chalk.green("CONNECTED TO DATABASE SUCCESSFULLY")))
            .catch(error => {
                console.log(chalk.red(`FAILED TO CONNECT TO DATABASE: ${error}`));
                process.exit(1);
            });
    } catch (error) {
        console.log(error);
    }
})();

module.exports = db;
