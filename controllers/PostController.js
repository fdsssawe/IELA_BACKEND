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

}
const postController = new PostController();


export default postController;
