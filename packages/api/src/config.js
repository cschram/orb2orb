"use strict";
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

module.exports = function loadConfig(location) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(location), 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(yaml.safeLoad(data));
            }
        });
    });
}