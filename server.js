import express from "express";
import dotenv from "dotenv";
dotenv.config();
import JWT from "jsonwebtoken";
import { User } from "./models.js";

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.locals.siteName = "Users";

app.get("/", async (req, res) => {
  res.render("index", { users: await User.findAll() });
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const existingUser = await User.findOne({ where: { name: req.body.name } });
  if (existingUser) {
    if (req.body.password == existingUser.password) {
      const token = JWT.sign(
        { name: existingUser.name },
        process.env["SECRET"],
      );
      res.cookie("user", token);
      res.redirect("/");
    } else {
      res.render("login", {
        msg: `Wrong password!`,
      });
    }
  } else {
    res.render("login", {
      msg: `User with name ${existingUser.name} doesn't exits!`,
    });
  }
});

app.post("/register", async (req, res) => {
  const existingUser = await User.findOne({ where: { name: req.body.name } });
  if (existingUser) {
    res.render("login", {
      msg: `User with name ${existingUser.name} already exits!`,
    });
  } else {
    const newUser = await User.create({
      name: req.body.name,
      password: req.body.password,
    });
    const token = JWT.sign({ name: newUser.name }, process.env["SECRET"]);
    res.cookie("user", token);
    res.redirect("/");
  }
});

const port = process.env["PORT"] || 8080;
app.listen(port, () => console.log(`Listening on :${port}`));
