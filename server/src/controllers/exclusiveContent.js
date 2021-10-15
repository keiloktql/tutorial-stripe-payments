const { findExclusiveContent } = require("../models/exclusiveContents");

// Get exclusive content
module.exports.findExclusiveContent = async (req, res, accessLevel) => {
    try {

        const exclusiveContent = await findExclusiveContent(accessLevel);

        if (!exclusiveContent) return res.status(404).json({
            message: "Cannot find \"exclusiveContent\""
        });

        return res.status(200).send({ exclusiveContent });
    }  catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > exclusiveContent.js > findExclusiveContent! " + error);
    }

};