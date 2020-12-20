npm install --arch=x64 --platform=linux --target=12.13.0 sharp
zip -r function.zip . && aws lambda update-function-code --function-name findFace --zip-file fileb://./function.zip
