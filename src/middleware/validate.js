const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const message = error.details.map(detail => detail.message.replace(/['"]/g, '')).join('; ');
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message
                }
            });
        }

        req[property] = value;
        next();
    };
};

module.exports = {
    validate
};
