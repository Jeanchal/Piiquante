const request = require("supertest");
const app = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const fs = require("fs");
let auth;
let idSauce;
let idUser;
let mongoServer;

function suppFile(target) {
  const filename = target.imageUrl.split("/images/")[1];
  fs.unlink(`images/${filename}`, () => {});
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));
});

describe("Tests API", function () {
  test("route signupUser", async () => {
    const user = {
      email: "jean@jean",
      password: "jean@jean",
    };
    const response = await request(app).post("/api/auth/signup").send(user);
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Utilisateur créé !");
    expect(response.body.user.email).toBe(user.email);
    expect(response.body.user.password).not.toBe(user.password);
    idUser = response.body.user._id;
  });
  test("route loginUser", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "jean@jean",
      password: "jean@jean",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toEqual(idUser);
    expect(response.body.message).toBe("Utilisateur connecté !");
    auth = {
      userId: response.body.userId,
      token: response.body.token,
    };
  });
  test("route postSauce", async () => {
    const sauce = {
      name: "Sauce Bechamel",
      manufacturer: "les Sauces du chef",
      description: "sauce Bechamel",
      mainPepper: "oeufs",
      heat: 7,
      userId: auth.userId,
    };
    const response = await request(app)
      .post("/api/sauces")
      .field("sauce", JSON.stringify(sauce))
      .attach("image", __dirname + "/test-image.jpg")
      .auth(auth.token, { type: "bearer" });
    expect(response.statusCode).toBe(201);
    expect(response.body.sauce.name).toBe(sauce.name);
    expect(response.body.sauce.manufacturer).toBe(sauce.manufacturer);
    expect(response.body.sauce.description).toBe(sauce.description);
    expect(response.body.sauce.mainPepper).toBe(sauce.mainPepper);
    expect(response.body.sauce.heat).toBe(sauce.heat);
    idSauce = response.body.sauce._id;
    suppFile(response.body.sauce);
  });
  test("route getAllSauces", async () => {
    const sauce = {
      name: "Sauce Tomate",
      manufacturer: "les Sauces du chef",
      description: "sauce tomate",
      mainPepper: "tomates",
      heat: 3,
      userId: auth.userId,
    };
    let response = await request(app)
      .post("/api/sauces")
      .field("sauce", JSON.stringify(sauce))
      .attach("image", __dirname + "/test-image.jpg")
      .auth(auth.token, { type: "bearer" });
    suppFile(response.body.sauce);
    response = await request(app).get("/api/sauces");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toEqual("Sauce Bechamel");
    expect(response.body[1].name).toEqual("Sauce Tomate");
  });
  test("route getOneSauce", async () => {
    const response = await request(app).get("/api/sauces/" + idSauce);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toEqual("Sauce Bechamel");
    expect(response.body._id).toEqual(idSauce);
  });
  test("route putSauce", async () => {
    const sauce = {
      name: "Sauce Citron",
      manufacturer: "les Sauces du chef",
      description: "sauce Citron",
      mainPepper: "citrons",
      heat: 4,
      userId: auth.userId,
    };
    const response = await request(app)
      .put("/api/sauces/" + idSauce)
      .field("sauce", JSON.stringify(sauce))
      .attach("image", __dirname + "/test-image.jpg")
      .auth(auth.token, { type: "bearer" });
    expect(response.statusCode).toBe(200);
    expect(response.body.sauceObject.name).toBe(sauce.name);
    expect(response.body.sauceObject.manufacturer).toBe(sauce.manufacturer);
    expect(response.body.sauceObject.description).toBe(sauce.description);
    expect(response.body.sauceObject.mainPepper).toBe(sauce.mainPepper);
    expect(response.body.sauceObject.heat).toBe(sauce.heat);
  });
  test("route postLikeSauce", async () => {
    let response = await request(app)
      .post("/api/sauces/" + idSauce + "/like")
      .send({
        userId: auth.userId,
        like: 1,
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toBe("Sauce likée !");
    expect(response.body.sauce.likes).toBe(1);
    response = await request(app)
      .post("/api/sauces/" + idSauce + "/like")
      .send({
        userId: auth.userId,
        like: 0,
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toBe("Like annulé !");
    expect(response.body.sauce.likes).toBe(0);
    response = await request(app)
      .post("/api/sauces/" + idSauce + "/like")
      .send({
        userId: auth.userId,
        like: -1,
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toBe("Sauce Dislikée !");
    expect(response.body.sauce.dislikes).toBe(1);
    response = await request(app)
      .post("/api/sauces/" + idSauce + "/like")
      .send({
        userId: auth.userId,
        like: 0,
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toBe("Dislike annulé !");
    expect(response.body.sauce.likes).toBe(0);
  });
  test("route deleteSauce", async () => {
    const response = await request(app)
      .delete("/api/sauces/" + idSauce)
      .auth(auth.token, { type: "bearer" });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("Sauce supprimée !");
    expect(response.body.sauce._id).toBe(idSauce);
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
