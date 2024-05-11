import * as dotenv from "dotenv";
import { ApiError } from "../exceptions/apiError.js";
import User from "../model/User.js";
import postServiceContainer from "../services/PostsService.js";

dotenv.config();

class PostController {


  async getPosts(req, res, next) {
    try {
      const { preference } = req.body;
      const posts = await postServiceContainer.resolve("postService").getPosts(preference);
      return res.json(posts);
    } catch (e) {
      next(e);
    }
  }

  async getPostById(req, res, next) {
    try {
      const id = req.params.id;
      const posts = await postServiceContainer.resolve("postService").getPostById(id);
      return res.json(posts);
    } catch (e) {
      next(e);
    }
  }

  async savePost(req, res, next) {
    try {
      const { user } = req.body;
      const id = req.params.id;
      const result = await postServiceContainer.resolve("postService").savePost(id, user);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async getSavedPosts(req, res, next) {
    try {
      const id = req.params.id;
      const user = await User.findById(id);
      if (user.postsSaved) {
        const result = await postServiceContainer.resolve("postService").getSavedPosts(user);
        return res.json(result);
      }
      return res.json([]);
    } catch (e) {
      next(e);
    }
  }
}

// Resolve the postService instance from the container
// const postService = postServiceContainer.resolve("postService");

// Create a new instance of PostController with the resolved postService
const postController = new PostController();


export default postController;
