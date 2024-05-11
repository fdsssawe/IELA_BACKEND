import jwt from "jsonwebtoken"
import * as dotenv from "dotenv"
import Token from "../model/Token.js"
import { createContainer , asValue } from "awilix"
import LogObserver from "../middlewares/LogObserver.js"

dotenv.config()

//Observer pattern implemented here in order to notify all the observers about the changes in the token or its state
export class TokenService{

    constructor() {
        //initialize the observers array
        this.observers = [];
    }
    //attach the observer to the class instance
    attach(observer) {
        this.observers.push(observer);
    }
    //notify observers about the changes in the token
    notify(token) {
        for (const observer of this.observers) {
            observer.update(token);
        }
    }
    //functions to generate tokens
    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET,{expiresIn:'30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET,{expiresIn:"30d"})
        this.notify(refreshToken);
        return{
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            this.notify(token);
            return userData
        }
        catch(e){
            return null
        }   
    }


    validateRefreshToken(token) {
        let userData = null;
        try {
            userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            this.notify(token);
        } catch (e) {
            this.notify("Invalid token");
            return null;
        } finally {
            this.notify(token);
        }
        return userData;
    }
    
    async saveToken(userId,refreshToken){
        const tokenData = await Token.findOne({user : userId})
        if (tokenData){
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        const token = await Token.create({user : userId, refreshToken})
        return token
    }
    
    async removeToken(refreshToken){
        const tokenData = await Token.deleteOne({refreshToken})
        return tokenData
    }

    async findToken(refreshToken){
        const tokenData = await Token.findOne({refreshToken})
        return tokenData
    }
}

const tokenService = new TokenService()
tokenService.attach(new LogObserver());
const tokenServiceContainer = createContainer()


tokenServiceContainer.register({tokenService: asValue(tokenService)});

export default tokenServiceContainer