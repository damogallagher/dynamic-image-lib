/**
 * dynamic-watermark
 *
 *
 * Copyright (c) 2017 Navjot Dhanawat
 * Licensed under the MIT license.
 */

/**
 * Dynamic Watermark is npm watermark module to add watermark over image.
 * It can add image as well as text watermark on given positions.
 * @param  {options}
 * @return {callback}
 */


var gm = require('gm');

var embedWatermark = function(options, callback) {
    var source = options.source; // Source file path
    var logo = options.logo; // Logo file path
    var ext = source.split('.').pop();
    options.ext = ext;
    var destination = options.destination; // Destination file path
    var outputToBuffer = false;
    options.outputToBuffer = outputToBuffer;

    generateWatermark(source, logo, destination, options, callback);
};

var embedWatermarkFromFile = function(options, callback) {
    var source = options.source; // Source file
    var sourceData = source.data;
    var logo = options.logo; // Logo file path
    var ext = source.name.split('.').pop();
    options.ext = ext;
    var destination = options.destination; // Destination file path
    var outputToBuffer = true;
    options.outputToBuffer = outputToBuffer;

    generateWatermark(sourceData, logo, destination, options, callback);
};

function generateWatermark(source, logo, destination, options, callback) {
    /**
     * Left bottom: X = 10, Y = logoY
     * Right bottom: X = logoX, Y = logoYlback) {
    /**
     * Left bottom: X = 10, Y = logoY
     * Right bottom: X = logoX, Y = logoY
     * Left Top: X = 10, Y = 10
     * Right Top: X = logoX, Y = 10
     */
    var position = options.position; //'right-bottom';
    var type = options.type; //'text';
    var text = options.text ? options.text : '';

    gm(source)
        .size(function(err, size) {

            if (!err) {
                var logoWidth = (size.width / 10);
                var logoHeight = (size.height / 10);
                var logoX = size.width - (size.width / 8);
                var logoY = size.height - (size.height / 8);

                switch (position) {
                    case 'left-top':
                        var logoX = 10;
                        var logoY = 10;
                        break;

                    case 'left-bottom':
                        var logoX = 10;
                        var logoY = size.height - (size.height / 8);
                        break;

                    case 'right-top':
                        var logoX = size.width - (size.width / 8);
                        var logoY = 10;
                        break;
                    default:
                        if (typeof position == 'object') {
                            var logoWidth = position.logoWidth;
                            var logoHeight = position.logoHeight;
                            var logoX = position.logoX;
                            var logoY = position.logoY;
                        }
                        break;
                }

                if (type === 'text') {

                    var textColor = options.textOption ? options.textOption.color : '#000000';
                    var fontSize = options.textOption ? options.textOption.fontSize : 20;

                    if (!options.outputToBuffer) {
                        gm(source)
                        .fill(textColor)
                        .drawText(logoX, logoY, text)
                        .fontSize(fontSize + 'px')
                        .write(destination, callback);
                    } else {
                        gm(source)
                        .fill(textColor)
                        .drawText(logoX, logoY, text)
                        .fontSize(fontSize + 'px')
                        .toBuffer(options.ext, function (err, buffer) {
                            if (err) return handle(err);
                            console.log('done!');
                            callback(buffer);
                        });
                    }

                } else {
                    if (!options.outputToBuffer) {
                        gm(source)
                            .draw(['image over ' + logoX + ',' + logoY + ' ' + logoWidth + ',' + logoHeight + ' "' + logo + '"'])
                            .write(destination, callback);
                    } else {
                        //See https://github.com/aheckmann/gm
                        gm(source)
                            .draw(['image over ' + logoX + ',' + logoY + ' ' + logoWidth + ',' + logoHeight + ' "' + logo + '"'])
                            .toBuffer(options.ext, function (err, buffer) {
                                if (err) return handle(err);
                                console.log('done!');
                                callback(buffer);
                            });
                    }
                }
            } else {
                console.error(err);
                callback(err);
            }
        });
}


module.exports.embedWatermark = embedWatermark;
module.exports.embedWatermarkFromFile = embedWatermarkFromFile;
