require("dotenv").config();
const jsonWebToken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/modelsUsers");

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() =>
          res.status(201).json({ message: "Utilisateur créé !", user })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jsonWebToken.sign(
              { userId: user._id },
              process.env.SECURITY_TOKEN,
              {
                expiresIn: "24h",
              }
            ),
            message: "Utilisateur connecté !",
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// exports.modifyUser = (req, res, next) => {
//   const user = new User({
//     _id: req.params.id,
//     email: req.body.email,
//     password: req.body.password,
//   });
//   User.updateOne({ _id: req.params.id }, user)
//     .then(() =>
//       res.status(201).json({ user, message: "Utilisateur mis à jour !" })
//     )
//     .catch((error) => res.status(400).json({ error: error }));
// };

// exports.deleteUser = (req, res, next) => {
//   User.deleteOne({ _id: req.params.id })
//     .then(() =>
//       res.status(200).json({ user, message: "Utilisateur supprimé !" })
//     )
//     .catch((error) => res.status(400).json({ error: error }));
// };

// exports.getOneUser = (req, res, next) => {
//   User.findOne({ _id: req.params.id })
//     .then((users) => res.status(200).json(users))
//     .catch((error) => res.status(400).json({ error: error }));
// };

// exports.getAllUsers = (req, res, next) => {
//   User.find()
//     .then((users) => res.status(200).json(users))
//     .catch((error) => res.status(400).json({ error: error }));
// };
