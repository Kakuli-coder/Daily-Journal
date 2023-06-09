require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const AppError = require("./AppError");

const homeStartingContent = `A journal is your inner unsullied voice. It is your best friend with whom you can share all your secrets and vulnerabilities that does not judge you and listens to every bit your heart patiently.
So what are you thinking? Start doodling emotions in your "safe haven"!`;
const aboutContent = `We are a group of passionate individuals dedicated to the practice of
journaling and its many benefits. Our team believes in the power of writing as a tool for self-reflection,
personal growth, and creativity.`;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully to Mongo!");
  } catch (err) {
    console.log("Mongo Connection error!", err);
  };
};
connectDB();

const Post = require("./models/post");
const Contact = require("./models/contact");

function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(e => next(e));
  };
};

app.get("/", wrapAsync(async (req, res) => {
  const posts = await Post.find({});
  res.render("home", { homeStartingContent, posts });
}));

app.get("/about", (req, res) => {
  res.render("about", { aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/contact", wrapAsync(async (req, res) => {
  const { name, email, message } = req.body;
  const contact = new Contact({
    name: name,
    email: email,
    message: message
  });
  await contact.save();
  // console.log(contact);
  res.redirect("/");
}));

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", wrapAsync(async (req, res) => {
  const { titleTxt, bodyTxt } = req.body;
  const post = new Post({
    title: titleTxt,
    body: bodyTxt
  });
  await post.save();
  // console.log(`${post}`);
  res.redirect("/");
}));


app.get("/posts/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  // console.log(post);
  res.render("post", { post });
}));

const handleValidationErr = err => {
  // console.log(err);
  return new AppError(`${err.message}`, 400);
};

app.use((err, req, res, next) => {
  // console.log(err.name);
  if (err.name === "ValidationError") {
    err = handleValidationErr(err);
  };
  next(err);
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went Wrong!" } = err;
  res.status(status).send(message);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is runnig on port ${process.env.PORT}`);
});
