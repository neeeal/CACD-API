const fileUploadHelper = require("../helpers/uploadHelper.js");



/**
 * Middleware to handle multiple Base64 file uploads
 */
const handleBase64Upload = async (req, res, next) => {
    try {
        const files = req.body.files;

        if (!files || !Array.isArray(files) || files.length === 0) {
            req.files = [];
        } else {
            req.files = await fileUploadHelper(files);
        }

        next();
    } catch (err) {
        console.error('Error in Base64 upload middleware:', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = handleBase64Upload;
