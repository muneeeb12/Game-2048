const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt  = require('bcrypt');
const User = require('../models/userModel');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
})

// Deserialize user for session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    }
    catch(err){
        done(err, null);
    }
})

passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try {
        const user = await User.findOne({email});
        if(!user){
            return done(null, false, {message: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return done(null, false, {message: 'Incorrect password!'});
        }

        return done(null, user);

    }
    catch(err){
        return done(err);
    }
}))

module.exports = passport;