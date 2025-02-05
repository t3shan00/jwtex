const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const app = express();
app.use(express.json());

const SECRET_KEY = "MySecret";

const users = [
  { id: 1, username: "admin", password: "admin", role: "admin" },
  { id: 2, username: "user", password: "user", role: "user" }
];

const posts = [];

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    const user = users.find(u => u.id === jwt_payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  })
);

app.use(passport.initialize());

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
  console.log(token);
});

const authorizeRole = (role) => (req, res, next) => {
    console.log("User role:", req.user.role);
  if (req.user.role !== role) return res.status(403).json({ message: "Forbidden" });
  next();
};

app.get(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(posts);
  }
);

app.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  authorizeRole("admin"),
  (req, res) => {
    const { message } = req.body;
    posts.push({ id: posts.length + 1, message });
    res.status(201).json({ message: "Post Added - successful" });
  }
);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
