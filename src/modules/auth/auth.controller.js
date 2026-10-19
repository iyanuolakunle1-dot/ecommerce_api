const authService = require('./auth.service');

class AuthController {
    async register(req, res, next) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                message: 'User registered successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const result = await authService.login(req.body);
            res.status(200).json({
                message: 'Login successful',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async getMe(req, res, next) {
        try {
            const user = await authService.getProfile(req.user.id);
            res.status(200).json({
                data: user
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
