const express = require('express');
const User = require('./models/User');
var SHA256 = require('crypto-js/sha256');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const router = express.Router();
const app = express();

mongoose.connect(
  'mongodb+srv://trevorokwirri:tresh@database1.zm15qv1.mongodb.net/?retryWrites=true&w=majority'
);
app.use(cors);
app.use(express.json());
app.use('/', router);
app.listen(7000, () => {
  console.log(`Server listening on port 7000`);
});

app.get('/', (req, res) => {
  res.send('Server listening on port 7000');
});

router.post('/api/token', async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) {
    return res.sendStatus(401);
  }
  user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) {
    return res.sendStatus(403);
  } else {
    res.send({ token: generateAccessToken(user) });
    return;
  }
});

router.delete('/api/logout', async (req, res) => {
  const refreshToken = req.body.token;
  user = await User.findOne({ refreshTokens: refreshToken });
  Tokens = user.refreshTokens;
  Tokens = Tokens.filter((token) => token !== req.body.token);
  await User.findOneAndUpdate({ email: user.email }, { refreshTokens: Tokens });
  res.send('Token succesfully deleted');
});

router.post('/api/login', async (req, res) => {
  res.send("It's working");
  users = await User.find();
  try {
    if (req.body.email != null) {
      User.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
          res.status(500).send({ msg: err.message });
        } else if (!user) {
          res.status(401).send({
            msg:
              'The email address ' +
              req.body.email +
              ' is not associated with any account. Please check and try again!',
          });
        } else if (SHA256(req.body.password) != user.password) {
          res.status(401).send({ msg: 'Wrong Password!' });
        } else if (!user.isVerified) {
          return res.status(401).send({
            msg: 'Your email has not yet been verified. Please click on resend to verify email.',
          });
        } else {
          const accessToken = generateAccessToken(user);
          const refreshToken = jwt.sign(user.email, 'trevorokwirri@1234');
          const refreshTokens = user.refreshTokens;
          refreshTokens.push(refreshToken);
          await User.findOneAndUpdate(
            { name: user.name },
            { refreshTokens: refreshTokens }
          );
          return res.status(200).send({
            username: user.name,
            email: user.email,
            token: accessToken,
            refreshToken: refreshToken,
          });
        }
      });
    } else if (req.body.name) {
      User.findOne({ name: req.body.name }, async (err, user) => {
        if (err) {
          res.status(500).send({ msg: err.message });
        } else if (!user) {
          res.status(401).send({
            msg:
              'The email address ' +
              req.body.email +
              ' is not associated with any account. Please check and try again!',
          });
        } else if (SHA256(req.body.password) != user.password) {
          res.status(401).send({ msg: 'Wrong Password!' });
        } else if (!user.isVerified) {
          return res.status(401).send({
            msg: 'Your email has not yet been verified. Please click on resend to verify email.',
          });
        } else {
          const accessToken = generateAccessToken(user);
          const refreshToken = jwt.sign(user.email, 'trevorokwirri@1234', {
            expiryIn: '7d',
          });
          const refreshTokens = user.refreshTokens;
          refreshTokens.push(refreshToken);
          await User.findOneAndUpdate(
            { name: user.name },
            { refreshTokens: refreshTokens }
          );
          return res.status(200).send({
            username: user.name,
            email: user.email,
            token: accessToken,
            refreshToken: refreshToken,
          });
        }
      });
    } else {
      res.send('Invalid credentials');
    }
  } catch (error) {
    res.send(req.body);
  }
});

generateAccessToken = (user) => {
  return jwt.sign({ user }, 'trevorokwirri@1234', {
    expiresIn: '30s',
  });
};

// index.js
module.exports = app;
