import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import postServiceContainer from "../services/PostsService.js";
import postController from "../controllers/PostController.js";
import userControllerContainer from "../controllers/UserController.js";
export const router = new Router();

const postService = postServiceContainer.resolve("postService")



router.post("/registration", body('email').isEmail(), body('password').isLength({ min: 4, max: 30 }), userControllerContainer.resolve("userController").registration)
router.post('/createHistogram', postService.createPost)
router.post("/login", userControllerContainer.resolve("userController").login)
router.post("/logout", authMiddleware, userControllerContainer.resolve("userController").logout )
router.get("/activate/:link", userControllerContainer.resolve("userController").activate)
router.get("/refresh", userControllerContainer.resolve("userController").refresh)
router.get("/users", authMiddleware, userControllerContainer.resolve("userController").getUsers)
router.get("/user/:id"  , userControllerContainer.resolve("userController").getUsersPosts)
router.get("/post/:id"  , postController.getPostById)
router.post("/isuser"  , userControllerContainer.resolve("userController").getUser)