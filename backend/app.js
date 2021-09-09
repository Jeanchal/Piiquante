const express = require("express");
const routesSauces = require("./routes/routesSauces");
const routesUsers = require("./routes/routesUsers");
const path = require("path");
require("./mongodb");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", routesSauces);
app.use("/api/auth", routesUsers);

module.exports = app;
