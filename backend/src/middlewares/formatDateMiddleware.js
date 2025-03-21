
export const formatDateMiddleware = (req, res, next) => {
    if (req.body.dateOfBirth) {
        console.log(req.body.dateOfBirth)
        const date = new Date(req.body.dateOfBirth);
        console.log(date)
        if (!isNaN(date.getTime())) {
            req.body.dateOfBirth = date.toISOString(); // Convert to ISO 8601 format
        }
    }
    next();
};  