const Joi = require('joi');

const registerSchema = Joi.object({
    full_name: Joi.string().trim().min(2).max(100).required().messages({
        'any.required': 'Full name is required',
        'string.empty': 'Full name cannot be empty'
    }),
    username: Joi.string().trim().pattern(/^[a-zA-Z0-9_]+$/).min(3).max(30).required().messages({
        'any.required': 'Username is required',
        'string.empty': 'Username cannot be empty',
        'string.pattern.base': 'Username must only contain letters, numbers, and underscores'
    }),
    email: Joi.string().trim().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().min(6).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 6 characters long'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
});

module.exports = {
    registerSchema,
    loginSchema
};
