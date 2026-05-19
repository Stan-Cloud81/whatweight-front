# Guide de Contribution

Merci de votre intérêt pour contribuer à WhatWeight ! 🎉

## Comment Contribuer

### Signaler un Bug 🐛

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/Stan-Cloud81/whatweight-frontend/issues)
2. Ouvrez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Captures d'écran si pertinent
   - Informations système (navigateur, OS, version)

### Proposer une Fonctionnalité 💡

1. Ouvrez une issue avec le template "Feature Request"
2. Décrivez clairement la fonctionnalité proposée
3. Expliquez pourquoi elle serait utile
4. Proposez une implémentation si possible

### Soumettre une Pull Request 🔧

1. **Fork** le projet
2. **Clone** votre fork localement
   ```bash
   git clone https://github.com/Stan-Cloud81/whatweight-frontend.git
   ```

3. **Créez une branche** pour votre fonctionnalité
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```

4. **Développez** votre fonctionnalité
   - Suivez les conventions de code existantes
   - Ajoutez des commentaires si nécessaire
   - Testez votre code

5. **Committez** vos changements
   ```bash
   git commit -m "feat: ajout de ma nouvelle fonctionnalité"
   ```
   
   Utilisez les préfixes de commit conventionnels :
   - `feat:` nouvelle fonctionnalité
   - `fix:` correction de bug
   - `docs:` documentation
   - `style:` formatage, style
   - `refactor:` refactorisation
   - `test:` ajout de tests
   - `chore:` tâches de maintenance

6. **Push** vers votre fork
   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```

7. **Ouvrez une Pull Request** sur le repository principal

## Standards de Code

### TypeScript
- Utilisez TypeScript pour tout nouveau code
- Définissez des types explicites
- Évitez `any` autant que possible

### React
- Utilisez des composants fonctionnels avec Hooks
- Nommez les composants en PascalCase
- Utilisez des noms descriptifs pour les props

### CSS
- Suivez la convention de nommage BEM
- Utilisez les variables CSS existantes
- Assurez-vous que le design est responsive

### Structure des Fichiers
```
src/
├── components/     # Composants réutilisables
├── pages/         # Pages principales
├── hooks/         # Hooks personnalisés
├── utils/         # Fonctions utilitaires
└── types.ts       # Types TypeScript
```

## Tests

Avant de soumettre une PR :
1. Vérifiez que le build fonctionne : `npm run build`
2. Testez manuellement toutes les fonctionnalités impactées
3. Vérifiez que l'application fonctionne sur mobile

## Questions ?

N'hésitez pas à poser des questions dans les Issues ou Discussions GitHub.

Merci pour votre contribution ! 🙏
