const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt  = require('bcrypt');
const User = require('../models/userModel');


passport.serializeUser((user, done) => {
    done(null, { id: user.id, email: user.email }); // Store both id and email in the session
});

// Deserialize user for session
passport.deserializeUser(async (obj, done) => {
    try {
        const user = await User.findById(obj.id); // Find user by id
        user.email = obj.email; // Add email to the user object
        done(null, user); // Pass the user object with email to the session
    } catch (err) {
        done(err, null);
    }
});

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