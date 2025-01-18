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

      // Upload the file to S3
      const s3Params = {
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          ACL: 'public-read',
      };

      const command = new PutObjectCommand(s3Params);
      await s3.send(command);

      // Construct the file URL
      const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return { location: fileUrl };
  } catch (err) {
      console.error('Error uploading to S3:', err);
      throw err;
  }
}

const  processBase64Files = async (files) => {
  const results = [];

  for (const file of files) {
      const { base64String, originalname, fieldname } = file;

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
          mimeType,
          fieldname,
      });
  }

  return results;
};

module.exports = processBase64Files;