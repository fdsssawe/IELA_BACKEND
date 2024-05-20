import dotenv from "dotenv"
import { v2 as cloudinary } from "cloudinary"
import User from "../model/User.js"
import Post from "../model/Post.js"
import { createContainer , asValue } from "awilix"
import Canvas from 'canvas';
import fetch from 'node-fetch';
import axios from "axios"
import { analyzeImage, analyzeImageExtra, buildHistogram, getMean } from "../lib/ImageFunctions.js"

dotenv.config()

class PostService {

    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }

    async createPost(req, res) {
        let imageData;
        let photo;
        if (req.body.imageUrl) {
          const response = await fetch(req.body.imageUrl);
          const buffer = await response.buffer();
          imageData = await Canvas.loadImage(buffer);
          photo = req.body.imageUrl;
        } else if (req.body.base64) {
          const base64Data = req.body.base64.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          imageData = await Canvas.loadImage(buffer);
          photo = req.body.base64;
        } else {
          return res.status(400).json({ error: 'Image URL or base64 encoded image data is required.' });
        }
      
        const canvas = Canvas.createCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext('2d');
      
        ctx.drawImage(imageData, 0, 0);
      
        // Analyze the image
        const analysis = analyzeImageExtra(ctx, imageData);
        const histogramData = analyzeImage(ctx, imageData);
        buildHistogram(ctx, histogramData);
      
        const histogramImage = canvas.toDataURL();
      
        const originalURL = await cloudinary.uploader.upload(photo);
        const resultURL = await cloudinary.uploader.upload(histogramImage);
      
        const newPost = await Post.create({
          original: originalURL.url,
          result: resultURL.url,
          author: req.body.author,
          ...analysis, // Spread analysis object to include additional data
        });
      
        res.json({
          original: originalURL.url,
          result: resultURL.url,
          ...analysis, // Send image analysis data to user
        });
      }

    async getPosts(preferences) {
        try {
            const posts = await Post.find({})
            const sortedPosts = posts.sort((a, b) => {
                if (a.prompt.includes(preferences) && !b.prompt.includes(preferences)) {
                  return -1; 
                } else if (!a.prompt.includes(preferences) && b.prompt.includes(preferences)) {
                  return 1; 
                } else if (posts.length % 2 === 1 && !a.prompt.includes(preferences) && !b.prompt.includes(preferences)) {
                  return -1; 
                } else {
                  return 0; 
                }
              })
            if (preferences || preferences!="None"){
                return { success: true, data: sortedPosts }
            } 
            return { success: true, data: posts }
        }
        catch (error) {
            console.log(error)
            return { success: false, message: error }
        }
    }

    async getPostById(id) {
        try {
            const post = await Post.findById(id)
            return post
        }
        catch (error) {
            console.log(error)
        }
    }

    async savePost(postId , userId){
        try{
            const post = await Post.findById(postId)
            const user = await User.findById(userId)
            if (user?.postsSaved.includes(post._id)) {
                const index = user?.postsSaved.indexOf(post._id);
                if (index > -1) {
                    user?.postsSaved.splice(index, 1);
                    user.save()
                }
                return { ans: "Post already saved" }
            }
            user.postsSaved.push(post)
            user.save()
            return user.postsSaved
        }
        catch (error) {
            console.log(error)
        }
    }
}

const postServiceContainer = createContainer()

const postService = new PostService()

postServiceContainer.register({postService: asValue(postService)});



export default postServiceContainer