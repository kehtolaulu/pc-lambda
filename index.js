const AWS = require('aws-sdk');
const util = require('util');
const sharp = require('sharp');

const {
  facesCoords, toAbsolute
} = require('./facesCoords.js');

// get reference to S3 client
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const dstBucket = srcBucket + "-faces";

  // Infer the image type from the file suffix.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return;
  }

  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != "jpg" && imageType != "jpeg") {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  // Download the image from the S3 source bucket.

  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey
    };
    var origimage = await s3.getObject(params).promise();

  } catch (error) {
    console.log(error);
    return;
  }

  // Use the Sharp module to crop the image and save in a buffer.
  // PROCESSING
  let image = sharp(origimage.Body);

  let meta = await image.metadata();
  let width = meta.width;
  let height = meta.height;

  let faces = await facesCoords({ bucket: srcBucket, objectKey: srcKey });
  let absoluteFaces = faces.map(details => toAbsolute(width, height, details));

  if (absoluteFaces.length == 0) {
    console.log(`No faces found. Response: ${faces}`);
  }
  absoluteFaces.forEach(async (face, idx) => {
    let buffer = await image.extract(face).toBuffer();
    let dstKey = `${srcKey}/${idx}.${imageType}`;

    try {
      const destparams = {
        Bucket: dstBucket,
        Key: dstKey,
        Body: buffer,
        ContentType: "image"
      };

      await s3.putObject(destparams).promise();
    } catch (error) {
      console.log(error);
      return;
    }

    console.log(`Successfully processed ${srcBucket}/${srcKey} and uploaded to ${dstBucket}/${dstKey}/*`);
  });
};
