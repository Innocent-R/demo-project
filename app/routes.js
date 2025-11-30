module.exports = function(app, passport) {

    // The home page
    app.get('/', (req, res) => {
        res.redirect('/signup');
    });

    // The sign up page
    app.get('/signup', (req, res) => {
        res.render('signup', { message: req.flash('signupMessage') });
    });

    // Redirecting sign up page
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/login',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    // login page
    app.get('/login', (req, res) => {
        res.render('login', { message: req.flash('loginMessage') });
    });

    // Handle login
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));
   
    
    // Protected profile route (login required)
    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile', { user: req.user });
    });


    //books page
app.get('/books', isLoggedIn, async (req, res) => {
    // showing user's borrowed books from the Database
    const borrowedBooks = req.user.borrowedBooks || [];
    res.render('books', { user: req.user, borrowedBooks });
});

      // Logout
  app.get('/logout', (req, res) => {
    req.logout(() => {}); 
    res.redirect('/signup');
});


};

// Middleware: making sure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}
