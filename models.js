import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("sqlite:data/db.sqlite");

export const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const Person = sequelize.define("Person", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

await sequelize.sync();
