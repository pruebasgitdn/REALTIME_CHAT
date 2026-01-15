import { connectionDB } from "../lib/db.js";
import User from "../models/user.model.js";
import { config } from "dotenv";
config();

const usersSeed = [
  {
    email: "mf@gmail.com",
    fullName: "Michel Benitez",
    password: "danilo11",
    profilePic: {
      url: "https://i.pinimg.com/736x/59/37/5f/59375f2046d3b594d59039e8ffbf485a.jpg",
    },
  },

  {
    email: "coco@gmail.com",
    fullName: "Conrado OtraVez",
    password: "danilo11",
    profilePic: {
      url: "https://i.pinimg.com/736x/59/37/5f/59375f2046d3b594d59039e8ffbf485a.jpg",
    },
  },
  {
    email: "uribe@gmail.com",
    fullName: "Alvaro Uribe",
    password: "danilo11",
    profilePic: {
      url: "https://i.pinimg.com/736x/59/37/5f/59375f2046d3b594d59039e8ffbf485a.jpg",
    },
  },
  {
    email: "dahaian@gmail.com",
    fullName: "ahiana Echeverri",
    password: "danilo11",
    profilePic: {
      url: "https://i.pinimg.com/736x/59/37/5f/59375f2046d3b594d59039e8ffbf485a.jpg",
    },
  },
  {
    email: "juliana@gmail.com",
    fullName: "Juliana Juarez",
    password: "danilo11",
    profilePic: {
      url: "https://i.pinimg.com/736x/59/37/5f/59375f2046d3b594d59039e8ffbf485a.jpg",
    },
  },
];

const seedUsers = async () => {
  try {
    await connectionDB();

    await User.insertMany(usersSeed);
    console.log("Base de datos llenada exitosamente");
  } catch (error) {
    console.log("Error llenando base:", error);
  }
};

seedUsers();
