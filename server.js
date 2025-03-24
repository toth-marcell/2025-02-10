import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { User } from "./models.js";
import cookieParser from "cookie-parser";
import { Login, Register, ObtainToken, ValidateToken } from "./auth.js";
import apiApp from "./api.js";

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", apiApp);
app.set("view engine", "ejs");

app.use(async (req, res, next) => {
  try {
    if (req.cookies.user) {
      res.locals.user = await ValidateToken(req.cookies.user);
    } else throw new Error("");
  } catch {
    res.locals.user = null;
  }
  next();
});

app.locals.siteName = "Users";

app.get("/", async (req, res) => {
  res.render("index", { users: await User.findAll() });
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  const result = await Login(name, password);
  if (typeof result == "string") {
    res.render("login", { msg: result });
  } else {
    res.cookie("user", ObtainToken(result), {
      maxAge: new Date(Number.MAX_SAFE_INTEGER / 2),
    });
    res.redirect("/");
  }
});

app.post("/register", async (req, res) => {
  const { name, password } = req.body;
  const result = await Register(name, password);
  if (typeof result == "string") {
    res.render("login", { msg: result });
  } else {
    res.cookie("user", ObtainToken(result), {
      maxAge: new Date(Number.MAX_SAFE_INTEGER / 2),
    });
    res.redirect("/");
  }
});

app.get("/logout", async (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

app.get("/profile", async (req, res) => {
  res.render("profile", { profile: await User.findByPk(req.query.id) });
});

const port = process.env["PORT"] || 8080;
app.listen(port, () => console.log(`Listening on :${port}`));
