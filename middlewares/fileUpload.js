const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3.js');
const path = require('path');
const moment = require('moment');

// Configure multer to use S3 storage
const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: process.env.S3_BUCKET_NAME,
        key: function(req, file, cb){
            const uniqueSuffix = moment().unix().toString() + '-' + Math.round(Math.random() * 1E9);
            const fileExtension = path.extname(file.originalname).toLowerCase();  // Get the file extension
            cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`) // Include the extension in the key
        },
        contentType: function (req, file, cb) {
            cb(null, file.mimetype)
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png|gif|jfif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('File type not supported!'));
        }
    }
});

module.exports = upload;
