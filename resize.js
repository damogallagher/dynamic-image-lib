var gm = require('gm');
const {getExtension} = require('./utils');
const _ = require('lodash')

var performResize = async function (options) {

    if (_.isUndefined(options.source)) {
        return resizeFromFileUpload(options);
    } else {
        return resizeFromFileStr(options);
    }
};

function resizeFromFileStr(options) {
    var source = options.source; // Source file path

    var ext = getExtension(source);
    var destination = options.destination; // Destination file path

    var outputToBuffer = false;
    var width = 500;
    var height = 500;

    return resizeImage(source, destination, ext, outputToBuffer, width, height);
};

function resizeFromFileUpload(options) {
    var source = options.sourceUpload; // Source file
    var sourceData = source.data;

    var ext = getExtension(source.name);

    var destination = options.destination; // Destination file path

    var outputToBuffer = true;
    var width = 500;
    var height = 500;

    return resizeImage(sourceData, destination, ext, outputToBuffer, width, height);
};

async function resizeImage(source, destination, ext, outputToBuffer, width, height) {
    return new Promise(function (resolve, reject) {
        console.log('in resize');

        if (!outputToBuffer) {
            gm(source)
                .resize(width, height)
                .write(destination, function (e) {
                    //console.log(e || 'Text Watermark Done. Path : ' + destination); // What would you like to do here?
                    if (!e) {
                        console.log('Resize status 1');
                        resolve({ status: 1 });
                    } else {
                        console.log('Resize status 2');
                        reject({ status: 0 });
                    }
                });
        } else {
            gm(source)
                .resize(width, height)
                .toBuffer(ext, function (err, buffer) {
                    if (!err) {
                        console.log('Resize status 3');
                        resolve(buffer);
                    } else {
                        //console.log('done!');
                        console.log('Resize status 4');
                        reject(err);
                    }
                });
        }


    });
}

module.exports = { performResize }
