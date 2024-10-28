const multer = require('multer');
const moment = require("moment");

const storage = multer.diskStorage({
  destination: './public/uploads/images',
  filename: function (req, file, cb) {
    const uniqueSuffix = moment().unix().toString() + '-' + Math.round(Math.random() * 1E9) + "." + file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })
module.exports = upload;