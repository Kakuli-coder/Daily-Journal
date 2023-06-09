const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title cannot be blank!"]
    },
    author: {
        type: String
    },
    body: {
        type: String,
        required: [true, "Body cannot be blank!"]
    }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
