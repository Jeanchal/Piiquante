process.env.IMAGEDIR = "tests/images";
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const fs = require("fs");
const path = require("path");
let auth;
let idSauce;
let mongoServer;
let app;

function emptyDir(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.DB_URL = mongoServer.getUri();
  app = require("../app");
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
  });
  test("route loginUser", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "jean@jean",
      password: "jean@jean",
    });
    expect(response.statusCode).toBe(200);
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
    // suppFile(response.body.sauce);
    response = await request(app)
      .get("/api/sauces")
      .auth(auth.token, { type: "bearer" });
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toEqual("Sauce Bechamel");
    expect(response.body[1].name).toEqual("Sauce Tomate");
  });
  test("route getOneSauce", async () => {
    const response = await request(app)
      .get("/api/sauces/" + idSauce)
      .auth(auth.token, { type: "bearer" });
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
      })
      .auth(auth.token, { type: "bearer" });
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toBe("Sauce likée !");
    expect(response.body.sauce.likes).toBe(1);
    response = await request(app)
      .post("/api/sauces/" + idSauce + "/like")
      .send({
        userId: auth.userId,
        like: 0,
      })
      .auth(auth.token, { type: "bearer" });
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toBe("Like annulé !");
    expect(response.body.sauce.likes).toBe(0);
    response = await request(app)
      .post("/api/sauces/" + idSauce + "/like")
      .send({
        userId: auth.userId,
        like: -1,
      })
      .auth(auth.token, { type: "bearer" });
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toBe("Sauce Dislikée !");
    expect(response.body.sauce.dislikes).toBe(1);
    response = await request(app)
      .post("/api/sauces/" + idSauce + "/like")
      .send({
        userId: auth.userId,
        like: 0,
      })
      .auth(auth.token, { type: "bearer" });
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
  await require("mongoose").disconnect();
  await mongoServer.stop();
  emptyDir("tests/images");
});
