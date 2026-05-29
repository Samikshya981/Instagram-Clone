import express from "express";
import { editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, register, searchUsers, getChatUsers } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.post('/logout', logout);
router.route('/search').get(isAuthenticated, searchUsers);
router.route('/chat/users').get(isAuthenticated, getChatUsers);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.put('/profile/edit', isAuthenticated, upload.single('profilePicture'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.post('/follow/:id', isAuthenticated, followOrUnfollow);

export default router;