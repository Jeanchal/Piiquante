README

*Pour faire fonctionner l'application:

- Créer une base de données Mongodb, nommée test-newApi
- Se placer dans le dossier backend et créer un dossier "images", puis créer un fichier .env, copier le contenu du fichier .env-dist et coller dans le fichier .env

Dans le fichier .env:
- remplacer "url de mongodb" par une url valide vers Mongodb (pour se connecter à la base de données test-newApi).
- remplacer "clé de sécurité pour token jwt" par un Token de sécurité (pour sécuriser l'accés à l'API).
- remplacer "chemin dossier images" par "images".
ATTENTION: sur chaque ligne, il ne doit y avoir aucun espace

*Pour lancer le serveur backend, depuis le repertoire de travail :

Ouvrir un nouveau terminal, entrer la commande "cd backend", puis "npm install" (pour installer les fichiers nécessaires), 
puis entrer la commande "nodemon server".

*Pour lancer l'appli frontend, depuis le reprtoire de travail :

Ouvrir un nouveau terminal, entrer la commande "cd frontend", puis "npm install" (pour installer les fichiers nécessaires), 
puis entrer la commande "npm start".
