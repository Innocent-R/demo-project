const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const borrowedBookSchema = new mongoose.Schema({
    openLibraryId: String,
    title: String,
    author: String,
    cover: String,
    year: String,
    borrowedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    borrowedBooks: { type: [borrowedBookSchema], default: [] }
});


// hash password
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// validate password
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
