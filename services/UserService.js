import User from "../model/User.js"
import bcrypt from "bcrypt"
import { v4 } from "uuid"
import tokenServiceContainer from "./TokenService.js"
import UserDto from "../dtos/userDTO.js"
import * as dotenv from "dotenv"
import { ApiError } from "../exceptions/apiError.js"
import Post from "../model/Post.js"
import mongoose from "mongoose"
import { createContainer , asValue } from "awilix"

dotenv.config()



class UserService{
    async registration (email, password){
        const candidate = await User.findOne({email})
        if (candidate){
            throw ApiError.BadRequests(`There is account with such email : ${email}`)
        }
        const hashPassword = await bcrypt.hash(password,3);
        const activationLink = v4()
        const user = await User.create({email,password : hashPassword , activationLink})
        // await mailServiceContainer.resolve("mailService").sendActivisionMail(email,`${process.env.API_URL}/api/activate/${activationLink}`)
        const userDTO = new UserDto(user)
        const tokens = tokenServiceContainer.resolve("tokenService").generateTokens({...userDTO})
        await tokenServiceContainer.resolve("tokenService").saveToken(userDTO.id, tokens.refreshToken)

        return{...tokens, user : userDTO}
    }

    async activate(activationLink){
        const user = await User.findOne({activationLink})
        if(!user){
            throw ApiError.BadRequests("Incorrect activation link")
        }
        user.isActivated = true
        await user.save()
    }

    async login(email , password){ 
        const user = await User.findOne({email})
        if(!user){
            throw ApiError.BadRequests('User not found')
        }
        const isPassEquels = await bcrypt.compare(password , user.password)
        if (!isPassEquels){
            throw ApiError.BadRequests('Wrong password or email')
        }
        const userDTO = new UserDto(user);
        const tokens = tokenServiceContainer.resolve("tokenService").generateTokens({...userDTO})
        await tokenServiceContainer.resolve("tokenService").saveToken(userDTO.id, tokens.refreshToken)

        return{...tokens, user : userDTO}
    }

    async logout(refreshToken){
        const token = await tokenServiceContainer.resolve("tokenService").removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken){
        if (!refreshToken){
            throw ApiError.UnathorizedError()
        }
        const userData = tokenServiceContainer.resolve("tokenService").validateRefreshToken(refreshToken)
        const tokeFromDb = await tokenServiceContainer.resolve("tokenService").findToken(refreshToken)
        if (!userData || !tokeFromDb){
            throw ApiError.UnathorizedError()
        }

        const user = await User.findById(userData.id)
        const userDTO = new UserDto(user);
        const tokens = tokenServiceContainer.resolve("tokenService").generateTokens({...userDTO})
        await tokenServiceContainer.resolve("tokenService").saveToken(userDTO.id, tokens.refreshToken)

        return{...tokens, user : userDTO}
    }

    async getUsersPosts(user){
        const posts = await Post.find({author : user})
        const profileOwner = await User.findById(user)
        const profileData = {
            posts,
            profileOwner,
        }
        return profileData;
    }

    async getAllUsers() {
        const users = await User.find();
        return users;
    }

    async isUser(email) {
        const user = await User.find({email : email});
        if(user.length>0){
            return true
        }
        else{
            return false
        }
    }
}

const userService = new UserService()


const userServiceContainer = createContainer()

userServiceContainer.register({userService: asValue(userService)});

export default userServiceContainer