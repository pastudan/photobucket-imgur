const mysql = require('mysql');
const async = require('async');
const now = require('performance-now');

const t0 = now();
const connection = mysql.createConnection({
    host: process.env.HOST || 'localhost',
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE,
});

const table = process.env.TABLE || 'xf_post';
const contentColumnName = process.env.CONTENT_COLUMN || 'message';
const idColumnName = process.env.ID_COLUMN || 'post_id';

const uploadedImages = require('./uploaded-images.json')

async.eachLimit(uploadedImages, 1, (image, callback) => {
    connection.query(`SELECT * FROM ${table} where ${contentColumnName} like ?`, [`%${image.url}%`], (error, results) => {
        if (error) throw error;

        // bail if we've already replaced this image
        if (results.length < 1) {
            callback();
            return;
        }

        const replacedMessage = results[0][contentColumnName].replace(image.url, `https://i.imgur.com/${image.id}.jpg`);

        connection.query(`UPDATE ${table} SET ${contentColumnName} = ? WHERE ${idColumnName} = ?`, [replacedMessage, results[0][idColumnName]], () => {
            if (error) throw error;

            console.log(`updated ${results[0][idColumnName]} - ${image.id}`);
            callback();
        })
    });
}, () => {
    const t1 = now();
    console.log("Done in " + ((t1 - t0) / 1000).toFixed(1) + " seconds.");
});
