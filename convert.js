const fs = require('fs');
const request = require('request');
const async = require('async');
const now = require('performance-now');

const t0 = now();
const imgurClientId = process.env.IMGUR_CLIENT_ID;

if (!imgurClientId) {
    console.log('Please rerun with your IMGUR_CLIENT_ID environment variable set. E.g. IMGUR_CLIENT_ID=1234abcd node convert.js');
    process.exit(9);
}

const re = /http:\/\/i\w+\.photobucket\.com\/(user|albums\/\w+)\/(\w+)\/((?!.html)[^\['\]])+/gi;
const posts = fs.readFileSync('posts.txt');
const photoBucketImages = [];
const uploadedImages = [];

while (result = re.exec(posts)) {
    photoBucketImages.push({
        url: result[0],
        username: result[2]
    });
}

async.eachLimit(photoBucketImages, 10, (photoBucketImage, callback) => {
    request({
        method: 'GET',
        url: photoBucketImage.url,
        headers: { Referer: `http://photobucket.com/gallery/user/${photoBucketImage.username}/media/` }
    }).pipe(request({
        method: 'POST',
        url: 'https://api.imgur.com/3/image',
        headers: { Authorization: `Client-ID ${imgurClientId}` },
    }, (err, res, body) => {
        const data = JSON.parse(body).data;
        const id = data.id;
        const deletehash = data.deletehash;
        const urlMapping = { id, deletehash, url: photoBucketImage.url }
        uploadedImages.push(urlMapping);
        console.log(urlMapping);
        callback();
    }));
}, () => {
    fs.writeFileSync('uploaded-images.json', JSON.stringify(uploadedImages, null, 2));
    const t1 = now();
    console.log("Done in " + ((t1 - t0) / 1000).toFixed(1) + " seconds.");
});