const fs = require('fs');
const path = require('path');
const s3 = require('../config/s3.js');
const moment = require('moment');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

/**
 * Extracts the MIME type from a Base64 string
 * @param {string} base64String - The Base64 string containing metadata.
 * @returns {string} - The MIME type (e.g., 'image/jpeg').
 */
function extractFileType(base64String) {
    const matches = base64String.match(/^data:(.*?);base64,/);
    if (!matches || matches.length < 2) {
        throw new Error('Invalid Base64 string or no file type found');
    }
    return matches[1]; // MIME type
}

/**
 * Decodes a Base64 string to a file and uploads it to Amazon S3.
 * @param {string} base64String - The Base64 string of the file.
 * @param {string} fileName - The original file name.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {Promise<object>} - The S3 upload result containing the file URL.
 */
async function uploadBase64ToS3(base64String, fileName, mimeType) {
    const bucketName = process.env.S3_BUCKET_NAME;

    // Generate unique filename
    const uniqueSuffix = moment().unix() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(fileName).toLowerCase();
    const key = `${fileName}-${uniqueSuffix}${fileExtension}`;
    const tempFilePath = path.join(__dirname, `temp-${uniqueSuffix}${fileExtension}`);

    try {
        // Decode the Base64 string to a file
        const buffer = Buffer.from(base64String.replace(/^data:.*?;base64,/, ''), 'base64');
        fs.writeFileSync(tempFilePath, buffer);

        // Upload the file to S3
        const s3Params = {
            Bucket: bucketName,
            Key: key,
            Body: fs.createReadStream(tempFilePath),
            ContentType: mimeType,
            ACL: 'public-read',
        };

        const command = new PutObjectCommand(s3Params);
        await s3.send(command);

        // Construct the file URL
        const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        return { Location: fileUrl };
    } catch (err) {
        console.error('Error uploading to S3:', err);
        throw err;
    } finally {
        // Clean up temporary file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

/**
 * Middleware to handle multiple Base64 file uploads
 */
const handleBase64Upload = async (req, res, next) => {
    try {
        const files = req.body.files;

        console.log('files')
        console.log(files)
        console.log('files')

        if (!files || !Array.isArray(files) || files.length === 0) {
            console.log('No files provided for upload' );
            req.files = []
        } else{

          const results = [];

          for (const file of files) {
              const { base64String, originalname } = file;
  
              if (!base64String || !originalname) {
                  continue; // Skip invalid files
              }
  
              // Extract MIME type from Base64 string
              const mimeType = extractFileType(base64String);
  
              // Upload the file to S3
              const result = await uploadBase64ToS3(base64String, originalname, mimeType);
              results.push({
                ...result,
                originalname,
                mimeType
              });
          }
  
          req.files = results;
  
          console.log('results')
          console.log(results)
          console.log('results')
  
          console.log('All files uploaded successfully');
          delete req.body.files;
        }

        next();
    } catch (err) {
        console.error('Error in Base64 upload middleware:', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = handleBase64Upload;
