import express from "express";
import dotenv from "dotenv";
dotenv.config();
import JWT from "jsonwebtoken";
import { User } from "./models.js";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { hash } from "node:crypto";

function hashPass(pass) {
  const sha256d = hash("sha256", pass);
  const bcryptd = bcrypt.hashSync(sha256d);
  return bcryptd;
}

function comparePass(pass, userPass) {
  const sha256d = hash("sha256", pass);
  return bcrypt.compareSync(sha256d, userPass);
}

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

app.use(async (req, res, next) => {
  if (!req.cookies.user) {
    res.locals.user = null;
    next();
  } else {
    try {
      const jwt = JWT.verify(req.cookies.user, process.env["SECRET"]);
      const user = await User.findByPk(jwt.id);
      if (user) {
        res.locals.user = user;
        next();
      } else {
        res.locals.user = null;
        res.clearCookie("user");
        next();
      }
    } catch (e) {
      res.clearCookie("user");
      res.redirect("/");
    }
  }
});

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
    if (comparePass(req.body.password, existingUser.password)) {
      const token = JWT.sign({ id: existingUser.id }, process.env["SECRET"]);
      res.cookie("user", token, {
        maxAge: new Date(Number.MAX_SAFE_INTEGER / 2),
      });
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
      password: hashPass(req.body.password),
    });
    const token = JWT.sign({ id: newUser.id }, process.env["SECRET"]);
    res.cookie("user", token, {
      maxAge: new Date(Number.MAX_SAFE_INTEGER / 2),
    });
    res.redirect("/");
  }
});

app.get("/logout", async (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

const port = process.env["PORT"] || 8080;
app.listen(port, () => console.log(`Listening on :${port}`));
