const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const { fetchJson, formatGame } = require('./utils');

const app = express();

const { Op } = db.Sequelize;
const ANDROID_GAMES_URL = "https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json";
const IOS_GAMES_URL = "https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json";

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

app.get('/api/games', (req, res) => db.Game.findAll()
  .then(games => res.send(games))
  .catch((err) => {
    console.log('There was an error querying games', JSON.stringify(err));
    return res.send(err);
  }));

app.post('/api/games', (req, res) => {
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  return db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    .then(game => res.send(game))
    .catch((err) => {
      console.log('***There was an error creating a game', JSON.stringify(err));
      return res.status(400).send(err);
    });
});

app.delete('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then(game => game.destroy({ force: true }))
    .then(() => res.send({ id }))
    .catch((err) => {
      console.log('***Error deleting game', JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.put('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => {
      const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
      return game.update({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
        .then(() => res.send(game))
        .catch((err) => {
          console.log('***Error updating game', JSON.stringify(err));
          res.status(400).send(err);
        });
    });
});


app.post('/api/games/search', async (req, res) => {
  try {
    const { name, platform } = req.body;

    const filterBy = {};

    if (name) filterBy.name = { [Op.like]: `%${name}%` };

    if (platform) filterBy.platform = { [Op.like]: `%${platform}%` };

    const games = await db.Game.findAll({ where: filterBy });

    res.status(200).json(games);
  } catch (err) {
    console.error('***Error searching games', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});


/**
 * Populate database with the top 100 apps
 */
app.post('/api/games/populate', async (req, res) => {
  try {
    const [androidGames, iosGames] = await Promise.all([
        fetchJson(ANDROID_GAMES_URL),
        fetchJson(IOS_GAMES_URL)
    ]);

    // Rule should be clarify with the product owner, Top 100 games of both ios and android or per platform? I'll choose top 100 per platform for the test
    const games = [
        ...androidGames.flat().slice(0, 100).map(game => formatGame(game)),
        ...iosGames.flat().slice(0, 100).map(game => formatGame(game))
    ];
    
    await db.Game.bulkCreate(games, { ignoreDuplicates: true }); // ignoreDuplicates with effect as Primary id key is auto increment

    return res.status(200).json({ message: "Successfully insert games to database", count: games.length });
  } catch (error) {
      console.error("***Error populating database:", error);
      return res.status(500).json({ message: "Internal server error", error: error.toString() });
  }
});
  
app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
