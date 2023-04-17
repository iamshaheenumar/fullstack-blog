const { check, validationResult } = require("express-validator");
const Post = require("../../models/post");

exports.postValidator = [
    check("title").trim().not().isEmpty().withMessage("Title is required"),
    check("content").trim().not().isEmpty().withMessage("Content is required"),
    check("meta").trim().not().isEmpty().withMessage("Meta description is required"),
    // check("slug").trim().not().isEmpty().withMessage("Slug is required").custom((value, { req }) => {
    //     return Post.findOne({ slug: value })
    //         .then((post) => {
    //             if (post && req.method === "POST") return Promise.reject('Slug already taken.')
    //         })
    // }),
    check("tags").isArray().withMessage("Tags must be list.")
]

exports.validate = (req, res, next) => {
    let errors = validationResult(req).array();

    if (errors.length) {
        errors = Object.assign(...errors.map(({ param, msg }) => ({ [param]: msg })))
        return res.status(400).json({ errors })
    }

    next();
}