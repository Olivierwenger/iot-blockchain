# iot-blockchain
truffle project with iot contract and test


## Exécution du test
Environnements utilisés:
* Ganache-cli version 6.0.3
* Truffle version 4.0.5
* Ubuntu 17.10 64-bit

Pour exécuter le test, allez dans la racine du projet *iot1* et ouvrer 2 terminaux.
  1. Dans le premier terminal, déployez la blockchain.
    `ganache-cli -l 300000000 -p 7545 -g 1 --db blockchain.`
  2. Dans le 2ième terminal, migrez les contrats sur la blockchain.
    `truffle migrate`
  3. Dans le 2ième terminal, lancez les tests.
    `truffle test`

## Problèmes connus
### Error: EMFILE: too many open files
Le système d'exploitation peut limiter le nombre de fichiers ouverts. Pour résoudre cela, il faut augmenter manuellement la limite des fichiers ouverts.\\
sous Ubuntu:
  `ulimit -u 10240`

sous Mac:
  `sudo launchctl limit maxfiles 1000000 1000000`

sous Windows:
  Il n'y a pas de moyen d'augmenter la limite du nombre de fichiers, mais mettre à jour Nodejs à la dernière version devrait régler le problème.

### Problèmes divers rencontrés lors des tests après modification du code
  Truffle a tendance à ne pas recompiler les fichiers si ceux-ci sont déjà dans build. Pour résoudre ce problème, supprimez le répertoire build et relancez la compilation.
### Trop de fichiers dans /blockchain pour pouvoir les supprimer
  Si la commande "remove all" ne fonctionne pas, essayez de faire un find avant. Par exemple:
    `find . -name "*" -type f -exec rm {} +`
