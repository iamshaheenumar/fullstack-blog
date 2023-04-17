const { createPost, deletePost, updatePost, getAPost, getFeaturedPost, getLatestPosts, getRelatedPosts } = require("../controllers/post");
const multer = require("./middlewares/multer");
const { parseData } = require("./middlewares/parseData");
const { postValidator, validate } = require("./middlewares/postValidator");
const router = require("express").Router();

router.post(
  "/create",
  multer.single("thumbnail"),
  parseData,
  postValidator,
  validate,
  createPost
);
router.put(
  "/:id",
  multer.single("thumbnail"),
  parseData,
  postValidator,
  validate,
  updatePost,
  getAPost
);
router.delete("/:id",deletePost)
router.get("/single/:slug",getAPost)
router.get("/featured",getFeaturedPost)
router.get("/all",getLatestPosts)
router.get("/related-posts/:id",getRelatedPosts)

module.exports = router;
