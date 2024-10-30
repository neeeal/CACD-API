const multer = require('multer');
const moment = require("moment");
const fs = require('fs');
const path = require('path');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads/photos'); // Adjust path as necessary
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: function (req, file, cb) {
    const uniqueSuffix = moment().unix().toString() + '-' + Math.round(Math.random() * 1E9) + '.' + file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

// Optional: Limit the file size and add file type validation
const upload = multer({
  storage: storage,
  // limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif|jfif/; // Allowed file types
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Error: File type not supported!'));
    }
  }
});

module.exports = upload;
