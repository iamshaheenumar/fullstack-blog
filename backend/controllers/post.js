const Post = require("../models/post");
const FeaturedPost = require("../models/featuredPost");
const { isValidObjectId } = require("mongoose");
const cloudinary = require("../cloudinary");

const FEATURED_POST_COUNT = 4;

const addToFeaturedPost = async (postId) => {
  const featuredPost = new FeaturedPost({
    post: postId,
  });

  await featuredPost.save();

  const featuredPosts = await FeaturedPost.find({}).sort({ createdAt: -1 });
  featuredPosts.forEach(async (post, index) => {
    if (index >= FEATURED_POST_COUNT)
      await FeaturedPost.findByIdAndDelete(post._id);
  });
};

const removeFromfeaturedPost = async (postId) => {
  await FeaturedPost.findOneAndDelete({ post: postId });
};

const isPostfeatured = async (postId) => {
  const post = await FeaturedPost.findOne({ post: postId });

  return post ? true : false;
};

exports.createPost = async (req, res) => {
  const { title, meta, content, tags, author, featured } = req.body;
  const { file } = req;

  const newPost = new Post({ title, meta, content, tags, author });

  if (file) {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    newPost.thumbnail = { url, public_id };
  }

  await newPost.save();

  if (featured) await addToFeaturedPost(newPost._id);

  res.json({ message: "Succesfully created new post." });
};

exports.updatePost = async (req, res) => {
  const { title, meta, content, tags, author, featured } = req.body;
  const { id } = req.params;

  if (!isValidObjectId(id))
    return res.status(400).json({ error: "Invalid request." });

  const post = await Post.findById(id);
  if (!post) res.status(400).json({ error: "Post not found." });

  post.title = title;
  post.meta = meta;
  post.content = content;
  post.tags = tags;
  post.author = author;

  if (featured) await addToFeaturedPost(post._id);
  else await removeFromfeaturedPost(post._id);

  await post.save();

  res.json({ post, featured });
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id))
    return res.status(400).json({ error: "Invalid request." });

  const post = await Post.findById(id);
  if (!post) res.status(400).json({ error: "Post not found." });

  const featured = await isPostfeatured(id);
  if (featured) await removeFromfeaturedPost(id);

  await Post.findByIdAndDelete(id);
  res.json({ message: "Succefully deleted the post." });
};

exports.getAPost = async (req, res) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ error: "Invalid request." });
  const post = await Post.findOne({ slug });
  if (!post) res.status(400).json({ error: "Post not found." });

  const { _id, title, meta, content, tags, author, createdAt, thumbnail } =
    post;
  const featured = await isPostfeatured(post._id);

  res.json({
    id: _id,
    title,
    slug,
    meta,
    content,
    tags,
    author,
    thumbnail: thumbnail?.url,
    featured,
    createdAt,
  });
};

exports.getFeaturedPost = async (req, res) => {
  const featuredPosts = await FeaturedPost.find({})
    .sort({ createdAt: -1 })
    .limit(4)
    .populate("post");

  res.json(
    featuredPosts.map(({ post }) => ({
      id: post._id,
      title: post.title,
      slug: post.slug,
      meta: post.meta,
      content: post.content,
      tags: post.tags,
      author: post.author,
      thumbnail: post.thumbnail?.url,
      createdAt: post.createdAt,
    }))
  );
};

exports.getLatestPosts = async (req, res) => {
  const { page = 1, limit = 10, q = "" } = req.query;

  let posts = [],
    totalCount = 0;

  if (q) {
    posts = await Post.find({ $text: { $search: q } })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    totalCount = await Post.countDocuments({ $text: { $search: q } });
  } else {
    posts = await Post.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    totalCount = await Post.countDocuments();
  }

  if (totalCount < (page - 1) * limit || page < 1) {
    res.json({
      error: `Page ${page} not available.`,
    });
  }

  res.json({
    posts: posts.map((post) => ({
      id: post._id,
      title: post.title,
      slug: post.slug,
      meta: post.meta,
      content: post.content,
      tags: post.tags,
      author: post.author,
      thumbnail: post.thumbnail?.url,
      createdAt: post.createdAt,
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: +page,
  });
};

exports.getRelatedPosts = async (req, res) => {
  const { id } = req.params;
  if(!isValidObjectId(id)){
    return res.status(400).json({
      error:"Invalid request."
    })
  }
  const post = await Post.findById(id);

  if(!post){
    return res.status(400).json({
      error: "Post not found"
    })
  }

  const relatedPosts = await Post.find({
    tags: { $in: [...post.tags] },
    _id: { $ne: post._id },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(
    relatedPosts.map(( post ) => ({
      id: post._id,
      title: post.title,
      slug: post.slug,
      meta: post.meta,
      content: post.content,
      tags: post.tags,
      author: post.author,
      thumbnail: post.thumbnail?.url,
      createdAt: post.createdAt,
    }))
  );
};
