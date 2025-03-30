# CringeMeter 🍑

CringeMeter est une application web qui permet aux utilisateurs de simuler une conversation de drague avec un bot IA (Isa), puis d'analyser cette conversation pour évaluer son niveau de "cringe" (malaise).

## Fonctionnalités

- Chat en temps réel avec un personnage IA au caractère bien défini
- Analyse de la conversation avec un score de "cringe" et des conseils
- Interface utilisateur réactive et animée
- Sécurité des clés API grâce à un backend serverless

## Technologies utilisées

- React + Vite
- Tailwind CSS
- Framer Motion pour les animations
- API OpenAI (GPT-4)
- Vercel Serverless Functions

## Installation locale

1. Clonez le dépôt
   ```bash
   git clone https://github.com/votre-nom/cringemeter.git
   cd cringemeter
   ```

2. Installez les dépendances
   ```bash
   npm install
   ```

3. Créez un fichier `.env.local` à partir du modèle
   ```bash
   cp .env.local.example .env.local
   ```

4. Ajoutez votre clé API OpenAI dans le fichier `.env.local`
   ```
   OPENAI_API_KEY="votre-clé-api-ici"
   ```

5. Lancez le serveur de développement
   ```bash
   npm run dev
   ```

## Déploiement sur Vercel

### Prérequis

- Un compte [GitHub](https://github.com/)
- Un compte [Vercel](https://vercel.com/)
- Une clé API [OpenAI](https://platform.openai.com/)

### Étapes de déploiement

1. Poussez votre code sur GitHub
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. Connectez-vous à votre compte Vercel

3. Importez votre dépôt GitHub dans Vercel
   - Cliquez sur "Add New..." puis "Project"
   - Sélectionnez votre dépôt GitHub
   - Configurez le projet:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

4. Ajoutez la variable d'environnement
   - Dans les paramètres du projet, allez dans "Environment Variables"
   - Ajoutez `OPENAI_API_KEY` avec votre clé API OpenAI

5. Déployez le projet
   - Cliquez sur "Deploy"

6. Votre application est maintenant en ligne!

## Structure du projet

- `/api` - Fonctions serverless pour sécuriser les appels à l'API OpenAI
- `/src` - Code source de l'application React
- `/public` - Ressources statiques

## Sécurité

Cette application utilise des fonctions serverless pour protéger votre clé API OpenAI. Les appels à l'API sont effectués côté serveur, ce qui empêche l'exposition de votre clé dans le code client.

## Licence

MIT
