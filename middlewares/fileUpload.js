const multer = require('multer');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../public/uploads/photos'); // Adjust path as necessary
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, cb) {
        const uniqueSuffix = moment().unix().toString() + '-' + Math.round(Math.random() * 1E9) + '.' + file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
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

// // Wrapper function
// upload.safeUpload = (fields) => {
//     return async (req, res, next) => {
//         const uploads = upload.fields(fields);

//         try {
//             await new Promise((resolve, reject) => {
//                 uploads(req, res, (err) => {
//                     if (err instanceof multer.MulterError) {
//                         // Handle Multer-specific errors
//                         if (err.code === 'LIMIT_FILE_SIZE') {
//                             return res.status(400).send({ error: 'File size is too large!' });
//                         } else if (err.code === 'LIMIT_FIELD_COUNT') {
//                             return res.status(400).send({ error: 'Too many files uploaded!' });
//                         } else {
//                           console.log("here")
//                             return res.status(400).send({ error: err.message });
//                         }
//                     } else if (err) {
//                         // Handle custom file validation errors
//                         return res.status(400).send({ error: err.message });
//                     }
//                     // No error, file uploaded successfully
//                     resolve(req.files);
//                 });
//             });

//             next();
//         } catch (error) {
//             res.status(error.status || 500).json({ error: error.message });
//         }
//     };
// };


module.exports = upload;
