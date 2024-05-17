import jwt from "jsonwebtoken"
import * as dotenv from "dotenv"
import Token from "../model/Token.js"
import { createContainer , asValue } from "awilix"

dotenv.config()


export class TokenService{

    
    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET,{expiresIn:'30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET,{expiresIn:"30d"})
        
        return{
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET) 
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
        } catch (e) {
            return null;
        } finally {
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
const tokenServiceContainer = createContainer()


tokenServiceContainer.register({tokenService: asValue(tokenService)});

export default tokenServiceContainer