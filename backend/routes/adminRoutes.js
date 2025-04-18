const express = require("express");
const User = require("../models/user");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// @route GET /api/admin/users
// @desc get all users
// @access Private/Admin

router.get("/", protect, admin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

// @route POST /api/admin/users
// @desc create a user
// @access Private/Admin

router.post("/", protect, admin, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({
            email,
        });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        user = new User({
            name,
            email,
            password,
            role : role || "customer",
        });
        await user.save();
        res.status(201).json({ message: "User created", user});
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

// @route PUT /api/admin/users/:id
// @desc update user
// @access Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
    const { name, email, role } = req.body;

    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();
        res.status(200).json({ message: "User updated", user });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

//@route DELETE /api/admin/users/:id
//@desc delete user
//@access Private/Admin

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.deleteOne();
        res.json({ message: "User removed" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);
module.exports = router;