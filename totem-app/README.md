# 🌿 Totem — Guide de déploiement

Suivez ces étapes dans l'ordre. Comptez environ **15 minutes** au total.

---

## ÉTAPE 1 — Créer une base de données Firebase (gratuit)

1. Allez sur **https://console.firebase.google.com**
2. Connectez-vous avec un compte Google
3. Cliquez **"Créer un projet"**
   - Nom du projet : `totem-jeu` (ou ce que vous voulez)
   - Désactivez Google Analytics (pas nécessaire)
   - Cliquez **"Créer le projet"**

4. Dans le menu de gauche, cliquez **"Realtime Database"**
5. Cliquez **"Créer une base de données"**
   - Choisissez la région **Europe (europe-west1)**
   - Mode : **"Démarrer en mode test"** ✅ (permet la lecture/écriture libre)
   - Cliquez **"Activer"**

6. Dans le menu de gauche, cliquez l'icône ⚙️ **"Paramètres du projet"**
7. Descendez jusqu'à **"Vos applications"**, cliquez l'icône **`</>`** (Web)
   - Nom de l'app : `totem`
   - Ne cochez PAS Firebase Hosting
   - Cliquez **"Enregistrer l'application"**
8. Copiez le bloc `firebaseConfig` qui apparaît — il ressemble à ça :
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "totem-jeu.firebaseapp.com",
     databaseURL: "https://totem-jeu-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "totem-jeu",
     storageBucket: "totem-jeu.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

---

## ÉTAPE 2 — Remplir le fichier firebase.js

Ouvrez le fichier **`src/firebase.js`** et remplacez les valeurs `VOTRE_...` par celles copiées à l'étape précédente.

Exemple après modification :
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "totem-jeu.firebaseapp.com",
  databaseURL: "https://totem-jeu-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "totem-jeu",
  storageBucket: "totem-jeu.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## ÉTAPE 3 — Déployer sur Vercel (gratuit, sans carte bancaire)

### Option A — Via l'interface web (recommandée, aucun terminal)

1. Allez sur **https://github.com** et créez un compte gratuit si vous n'en avez pas
2. Créez un nouveau dépôt public : cliquez **"New repository"**
   - Nom : `totem-jeu`
   - Cochez **"Public"**
   - Cliquez **"Create repository"**
3. Uploadez tous les fichiers de ce dossier dans le dépôt GitHub
   (glissez-déposez le dossier entier via l'interface web de GitHub)

4. Allez sur **https://vercel.com** et connectez-vous avec votre compte GitHub
5. Cliquez **"New Project"**, puis **"Import"** sur votre dépôt `totem-jeu`
6. Vercel détecte automatiquement que c'est une app React → cliquez **"Deploy"**
7. En 2 minutes, votre app est en ligne à une adresse du type :
   `https://totem-jeu.vercel.app`

### Option B — Via terminal (si vous êtes à l'aise)

```bash
# Dans ce dossier :
npm install
npm install -g vercel
vercel
```

---

## ÉTAPE 4 — Partager le lien

Envoyez l'URL Vercel à toutes les joueuses. C'est tout ! 🎉

Chaque joueuse ouvre le lien dans son navigateur (téléphone ou ordinateur),
clique sur son prénom, et le jeu démarre.

---

## Modifier la liste des joueuses

Ouvrez `src/App.js` et modifiez la ligne :
```js
const PLAYERS = ['Anne','Clémence','Laurène','Laurine','Léa','Manon','Marion','Virginie','Wendy'];
```

Puis redéployez (sur Vercel, chaque push GitHub redéploie automatiquement).

---

## Réinitialiser une partie

Dans le jeu, un bouton **"⚙ Réinitialiser la partie"** est disponible sur l'écran d'accueil.

---

## Questions fréquentes

**Les données sont-elles sécurisées ?**
La base Firebase est en "mode test" (lecture/écriture ouverte). Pour un usage privé entre amies, c'est largement suffisant. Si vous voulez sécuriser, contactez-moi.

**La synchronisation est-elle vraiment en temps réel ?**
Oui ! Firebase Realtime Database pousse les mises à jour instantanément sur tous les appareils connectés.

**C'est gratuit jusqu'à quand ?**
Firebase offre un plan gratuit généreux (Spark) : 1 Go de stockage, 10 Go de transfert/mois. Largement suffisant pour ce jeu.
