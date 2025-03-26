import express from "express";
import { User, Person } from "./models.js";
import { Login, Register, ObtainToken, ValidateToken } from "./auth.js";

const app = express();
export default app;
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    if (req.body.token) {
      res.locals.user = await ValidateToken(req.body.token);
    } else throw new Error("");
  } catch {
    res.locals.user = null;
  }
  next();
});

function APIError(req, res, msg) {
  res.status(400);
  res.json({ msg: msg });
}

app.post("/login", async (req, res) => {
  const result = await Login(req.body.name, req.body.password);
  if (typeof result == "string") {
    APIError(req, res, result);
  } else {
    res.json({
      token: ObtainToken(result),
      name: result.name,
    });
  }
});

app.post("/register", async (req, res) => {
  const result = await Register(req.body.name, req.body.password);
  if (typeof result == "string") {
    APIError(req, res, result);
  } else {
    res.json({
      token: ObtainToken(result),
      name: result.name,
    });
  }
});

app.get("/profiles", async (req, res) => {
  res.json(await User.findAll({ attributes: ["name", "createdAt"] }));
});

app.get("/person", async (req, res) => {
  res.json(await Person.findAll());
});

app.post("/person", async (req, res) => {
  const { name, age } = req.body;
  const newPerson = await Person.create({ name: name, age: age });
  res.json(newPerson);
});

app.delete("/person", async (req, res) => {
  const { id } = req.query;
  const person = await Person.findByPk(id);
  await person.destroy();
  res.end();
});

app.delete("/deleteall", async (req, res) => {
  await Person.destroy({ where: {} });
  res.end();
});

app.put("/person", async (req, res) => {
  const { id, name, age } = req.body;
  const person = await Person.findByPk(id);
  await person.update({ name: name, age: age });
  res.json(person);
});
