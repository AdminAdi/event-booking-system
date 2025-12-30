import express from 'express';
import { dbConnect } from '../../src/utils/database.js';
import { UserModel } from '../../src/utils/models.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        await dbConnect();
        const user = await UserModel.findOne({ $or: [{ username }, { email }] });
        
        if (!user) {
            const hashedPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            const newUser = new UserModel({
                username: username,
                email: email,
                password: hashedPass,
                role: 'user',
                profilePicture: ""
            });
            await newUser.save();
            return res.json({ success: true, message: "Account created successfully!" });
        } else {
            return res.json({ success: false, message: "There is already an account with this username or email!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        await dbConnect();
        const user = await UserModel.findOne({
            $or: [
                { email: email },
                { username: email }
            ]
        });

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(
                { 
                    id: user._id, 
                    username: user.username, 
                    email: user.email 
                },
                process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    balance: user.balance
                }
            });
        }

        return res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key');
        
        await dbConnect();
        const user = await UserModel.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                balance: user.balance
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
});

export default router;

