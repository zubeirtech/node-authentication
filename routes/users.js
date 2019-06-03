const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

// User model
const User = require('../models/User');

// Login Route
router.get('/login', (req, res) => res.render('login'));

// Register Route
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
    // eslint-disable-next-line object-curly-newline
    const { name, email, password, password2 } = req.body;
    const errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
        });
    } else {
        // Validation passed
        User.findOne({ email })
            .then((user) => {
                if (user) {
                    // User exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (error, hash) => {
                            if (error) throw error;
                            // Set password to hashed
                            newUser.password = hash;
                            // Save user
                            newUser.save()
                                .then((user) => {
                                    res.redirect('/users/login');
                                })
                                .catch(e => console.log(e));
                        });
                    });
                }
            })
            .catch(err => console.log(err));
    }
});

module.exports = router;
