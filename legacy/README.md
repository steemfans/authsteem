[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/steemfans/authsteem/master/LICENSE)

# AuthSteem

> Signer app for Steem

## Usage

``` bash
# Install dependencies
npm install

# Serve on localhost:8080
npm run serve

# Build for production
npm run build

# Build desktop apps
npm run build-electron
```

## Deploy Web Server by Docker

``` bash
# clone
git clone https://github.com/steemfans/authsteem.git

cd authsteem

# build docker image
docker build --build-arg TAG=master -t authsteem .

# deploy image
docker run -itd \
  --name authsteem \
  --restart always \
  -p 8080:80 \
  authsteem

##############

# or you can use image which I build.
docker pull steemfans/authsteem:latest

# deploy image
docker run -itd \
  --name authsteem \
  --restart always \
  -p 8080:80 \
  steemfans/authsteem:latest

```
