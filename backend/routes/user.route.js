import express from "express";
import {login, logout, register} from "../controllers/user.controller";

const router  = express.router();
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthen);