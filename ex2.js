const express = require('express')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')

const app = express()
const port = 3000

app.use(express.json());

const MYSECRETJWTKEY = 'secret'

const jwtValidation = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: MYSECRETJWTKEY
}

passport.use(new JwtStrategy(jwtValidation, function(payload, done){
  console.log(payload);
  done(null, true);
}))

app.use(passport.initialize());

app.post('/signin',
    (req, res) => {
      const token = jwt.sign({ foo: 'bar'}, MYSECRETJWTKEY);
      res.json({
        token: token
      });
})

app.get('/posts',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const posts = ['early bird catches the worm']
    res.json(posts)
  })

app.listen(port, () => {
    console.log(`app listenting on port ${port}`)
})