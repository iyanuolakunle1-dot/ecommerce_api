const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');

class AuthService {
    async register({ full_name, username, email, password }) {
        const existingEmail = await authRepository.findByEmail(email);
        if (existingEmail) {
            const error = new Error('An account with this email already exists.');
            error.statusCode = 409;
            error.code = 'DUPLICATE_EMAIL';
            throw error;
        }

        const existingUsername = await authRepository.findByUsername(username);
        if (existingUsername) {
            const error = new Error('This username is already taken.');
            error.statusCode = 409;
            error.code = 'DUPLICATE_USERNAME';
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await authRepository.createUser({
            full_name,
            username,
            email,
            password: hashedPassword
        });

        const token = this.generateToken(newUser);

        return {
            user: newUser,
            token
        };
    }

    async login({ email, password }) {
        const user = await authRepository.findByEmail(email);
        if (!user) {
            const error = new Error('Invalid email or password.');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Invalid email or password.');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        const token = this.generateToken(user);

        return {
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            },
            token
        };
    }

    async getProfile(userId) {
        const user = await authRepository.findById(userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }
        return user;
    }

    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }
}

module.exports = new AuthService();
