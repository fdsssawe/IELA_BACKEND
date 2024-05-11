import userService from "../services/UserService.js"
import * as dotenv from "dotenv"
import { validationResult } from "express-validator"
import { ApiError } from "../exceptions/apiError.js"
import User from "../model/User.js"
import userServiceContainer from "../services/UserService.js"
import { createContainer , asValue } from "awilix"

dotenv.config()


//Decorator pattern implementated here in order to simplify working with different types of users (authorized and unauthorized)
export class UserController {
  async registration(req,res,next){
    try{
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return next(ApiError.BadRequests('Validation error , make sure your email is correct', errors.array())) 
      }
      const {email, password} = req.body
      const userData = await userServiceContainer.resolve("userService").registration(email,password)
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 1000,
        sameSite: 'none', 
        secure: true, 
        httpOnly: false,
    });
      return res.json(userData)
    }catch(e){
      next(e);
    }
  }

  async login(req,res,next){
        try {
            const {email, password} = req.body;
            const userData = await userServiceContainer.resolve("userService").login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {
              maxAge: 30 * 24 * 60 * 1000,
              sameSite: 'none', 
              secure: true, 
              httpOnly: false,
          });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
  }

  async logout(req,res,next){
    try{
      return res.json("Logout is unavailable whithout authorization")
    }catch(e){
      next(e);
    }
  }

  async activate(req,res,next){
    try{
      const activationLink = req.params.link
      await userServiceContainer.resolve("userService").activate(activationLink)
      return res.redirect(process.env.CLIENT_URL)
    }catch(e){
      next(e);
    }
  }

  async refresh(req,res,next){
    try{
      const {refreshToken} = req.cookies
      const userData = await userServiceContainer.resolve("userService").refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none', 
        secure: true, 
        httpOnly: false,
    });
      return res.json(userData);
    }catch(e){
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
        const users = await userServiceContainer.resolve("userService").getAllUsers();
        return res.json(users);
    } catch (e) {
        next(e);
    }
}

async getUser(req, res, next) {
  try {
      const {email} = req.body
      const isUser = await userServiceContainer.resolve("userService").isUser(email);
      return res.json(isUser);
  } catch (e) {
      next(e);
  }
}

async getUsersPosts(req, res, next) {
  try {
      const user = req.params.id
      const posts = await userServiceContainer.resolve("userService").getUsersPosts(user);
      return res.json(posts);
  } catch (e) {
      next(e);
  }
}

}

//Class that extends UserController and adds logging functionality (decorator pattern)
export class UserControllerWithLogging extends UserController {

  async logout(req,res,next){
    try{
      const {refreshToken} = req.cookies
      const token = await userServiceContainer.resolve("userService").logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json(token)
    }catch(e){
      next(e);
    }
  }
}

const userController = new UserController()
const userControllerAuthed = new UserControllerWithLogging()

const userControllerContainer = createContainer()
//Registering the controllers in the containers for dependency injection
userControllerContainer.register({userController: asValue(userController)});
userControllerContainer.register({userControllerAuthed: asValue(userControllerAuthed)});

export default userControllerContainer

