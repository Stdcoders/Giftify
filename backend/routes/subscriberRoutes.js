const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// @route POST /api/subscribers
// @desc new subscriber in database
// @access Public

router.post("/subscribe", async (req, res) => {
    const { email } = req.body;
    if(!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        let subscriber = await Subscriber
            .findOne({ email });
        if (subscriber) {
            return res.status(400).json({ message: "Subscriber already exists" });
        }
        // create subscriber
        subscriber = new Subscriber({
            email,
        });
        await subscriber.save();
        res.status(201).json({ message: "Subscribed to the newsletter"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;