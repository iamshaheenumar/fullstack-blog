const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    meta: {
        type: String,
        required: true,
        trim: true,
    },
    tags: [String],
    author: {
        type: String,
        default: "Admin",
    },
    thumbnail: {
        type: Object,
        url: {
            type: URL,
        },
        public_id: {
            type: URL,
        },
    },
    slug: { type: String, slug: "title", unique: true }
},
{
    timestamps:true
});

postSchema.index({ title: 'text', content: 'text', tags: 'text' })

module.exports = mongoose.model("Post", postSchema);
