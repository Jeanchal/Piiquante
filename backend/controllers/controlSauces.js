const Sauce = require("../models/modelsSauces");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !", sauce }))
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() =>
      res.status(200).json({ message: "Sauce modifiée !", sauceObject })
    )
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = async (req, res, next) => {
  const sauce = await Sauce.findOne({ _id: req.params.id });
  const sauceLikes = sauce.usersLiked;
  const sauceDislikes = sauce.usersDisliked;
  let message;
  try {
    if (req.body.like === 0) {
      if (sauceLikes.includes(req.userId)) {
        let indexUser = sauceLikes.indexOf(req.userId);
        sauceLikes.splice(indexUser, 1);
        sauce.likes--;
        message = "Like annulé !";
      } else {
        if (sauceDislikes.includes(req.userId)) {
          let indexUser = sauceDislikes.indexOf(req.userId);
          sauceDislikes.splice(indexUser, 1);
          sauce.dislikes--;
          message = "Dislike annulé !";
        } else {
          res.status(400).json({
            error: "Erreur, aucun like ou dislike a annuler !",
          });
        }
      }
    }
    if (req.body.like === 1) {
      if (!sauceLikes.includes(req.userId)) {
        if (!sauceDislikes.includes(req.userId)) {
          sauceLikes.push(req.userId);
          sauce.likes++;
          message = "Sauce likée !";
        } else {
          res.status(400).json({
            error: "impossible de liker la sauce !",
          });
        }
      } else {
        res.status(400).json({ error: "Erreur, sauce déja likée !" });
      }
    }
    if (req.body.like === -1) {
      if (!sauceDislikes.includes(req.userId)) {
        if (!sauceLikes.includes(req.userId)) {
          sauceDislikes.push(req.userId);
          sauce.dislikes++;
          message = "Sauce Dislikée !";
        } else {
          res.status(400).json({
            error: "impossible de disliker la sauce !",
          });
        }
      } else {
        res.status(400).json({ error: "Erreur, sauce déja dislikée !" });
      }
    }
    sauce.save();
    res.status(200).json({ message: message, sauce });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() =>
            res.status(200).json({ message: "Sauce supprimée !", sauce })
          )
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error: error }));
};
