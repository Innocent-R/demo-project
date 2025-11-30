const LocalStrategy = require('passport-local').Strategy;
const User = require('../app/models/user');

module.exports = function (passport) {

    // Serialize user
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    });

    // local signup
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email', 
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, email, password, done) => {
        try {
            email = email.toLowerCase();

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return done(null, false, req.flash('signupMessage', 'User already exists. Please login.'));
            }

    // new user creting the account
            const newUser = new User();
            newUser.name = req.body.name;
            newUser.email = email.toLowerCase();
            newUser.password = newUser.generateHash(password);
            await newUser.save();

            return done(null, newUser);

        } catch (err) {
            return done(err);
        }
    }));

   
    // local login
    
    passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            async (req, email, password, done) => {
                try {
                    email = email.toLowerCase();
                    const user = await User.findOne({ email });

                    if (!user) {
                        return done(null, false, req.flash('loginMessage', 'No user found. Please sign up first'));
                    }

                    if (!user.validPassword(password)) {
                        return done(null, false, req.flash('loginMessage', 'Wrong password. Try again'));
                    }

                    return done(null, user);

                } catch (err) {
                    return done(err);
                }
            }
        )
    );
};
