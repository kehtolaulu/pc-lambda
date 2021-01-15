const AWS = require('aws-sdk');
const promisify = require('util').promisify;

const client = new AWS.Rekognition();

const detectFaces = promisify(client.detectFaces.bind(client));

const facesCoords = async ({ bucket, objectKey }) => {
  let response = await detectFaces({
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: objectKey
      }
    },
    Attributes: ['ALL']
  });

  return response['FaceDetails'].map(faceDetail => ({
    height: faceDetail['BoundingBox']['Height'],
    top: faceDetail['BoundingBox']['Top'],
    bottom: faceDetail['BoundingBox']['Top'] + faceDetail['BoundingBox']['Height'],

    width: faceDetail['BoundingBox']['Width'],
    left: faceDetail['BoundingBox']['Left'],
    right: faceDetail['BoundingBox']['Left'] + faceDetail['BoundingBox']['Width']
  }));
};

const toAbsolute = (width, height, faceDetail) => ({
  height: Math.floor(faceDetail.height * height),
  top: Math.floor(faceDetail.top * height),
  bottom: Math.floor(faceDetail.bottom * height),

  width: Math.floor(faceDetail.width * width),
  left: Math.floor(faceDetail.left * width),
  right: Math.floor(faceDetail.right * width)
});

exports.facesCoords = facesCoords;
exports.toAbsolute = toAbsolute;
