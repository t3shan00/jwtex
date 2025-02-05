/*
Exercise 4: Refresh Tokens & Token Expiry Handling


Improve security by implementing refresh tokens to extend session validity without requiring frequent logins. Refresh token is given along access token during sign in.


Key Features:

· Access tokens have a short expiration time (e.g., 15 minutes).

· A separate refresh token (longer lifespan) allows users to request a new access token.

· Logout functionality to invalidate refresh tokens.
*/

const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(express.json());

const ACCESS_SECRET_KEY = 'SECRETKEY_ACCESS';
const REFRESH_SECRET_KEY = 'SECRETKEY_REFRESH';
let refreshTokens = [];

const posts = ['Howdy!!!'];

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, ACCESS_SECRET_KEY, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET_KEY, { expiresIn: '1d' });
  refreshTokens.push(refreshToken);
  return refreshToken;
};

const jwtValidation = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_SECRET_KEY,
};

passport.use(
  new JwtStrategy(jwtValidation, (payload, done) => {
    if (payload.id) return done(null, payload);
    return done(null, false);
  })
);

app.use(passport.initialize());

app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  if (username !== 'admin' || password !== 'admin') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const userId = 1;
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  res.json({ accessToken, refreshToken });
  console.log("Access Token:", accessToken)
  console.log("Refresh Token:", refreshToken)
});

app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const accessToken = generateAccessToken(payload.id);
    res.json({ accessToken });
    console.log("New Access token", accessToken)
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});

app.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  }
  res.status(200).json({ message: 'Logged out successfully' });
});

app.get(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json(posts);
  }
);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
