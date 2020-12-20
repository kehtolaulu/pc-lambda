# pc-lamda

Extract faces form photos.

## Preparations

Create a lambda in AWS.
Choose `node.js 12.x` runtime for it.

Create 2 S3 buckets:
    - example
    - example-faces

If you call one bucket `example` then call the other `example-faces`.

Create IAM policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "logs:CreateLogStream",
                "logs:CreateLogGroup",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR_BUCKET_NAME/*",
                "arn:aws:logs:*:*:*"
            ]
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": "rekognition:DetectFaces",
            "Resource": "*"
        },
        {
            "Sid": "VisualEditor2",
            "Effect": "Allow",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME-faces/*"
        }
    ]
}
```

Replace YOUR_BUCKET_NAME with your bucket name.

Find your lambda role and attach new policy to it.

## Deployment

Install sharp to `node_modules` directory for AWS Lambda target OS.

```bash
npm install --arch=x64 --platform=linux --target=12.13.0 sharp
```

Pack the code to archive and push it to lambda.

```bash
zip -r function.zip .
aws lambda update-function-code --function-name findFace --zip-file fileb://./function.zip
```
Replace `findFace` with your function name.

## Usage

Once `YOUR_BUCKET_NAME` receives a photo, it will find faces on it.
The faces found uploaded to `YOUR_BUCKET_NAME-faces` bucket.
They have keys the same as original photo but with some number at the end.
E. g. if you uploaded a photo named `summer-2020-river.jpeg`, then all the
faces on it will be stored as `summer-2020-river.jpeg/0.jpeg`, `summer-2020-river.jpeg/1.jpeg`, etc.
