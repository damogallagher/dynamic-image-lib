//See http://aheckmann.github.io/gm/docs.html for gm documentation
var gm  = require('gm');
const {getExtension} = require('./utils');
const _ = require('lodash')
const tempWrite = require('temp-write');
var fs = require('fs');

var performEmbedWatermark = async function(options) {

    //console.log('options.source:"'+options.source+'"')
    if (_.isUndefined(options.source)) {
        return embedWatermarkFromFileUpload(options);        
    } else {
        return embedWatermarkFromFileStr(options);
    }
};


function embedWatermarkFromFileStr (options) {
    var source = options.source; // Source file path  
    options.ext = getExtension(source);
    var destination = options.destination; // Destination file path
    var outputToBuffer = false;
    options.outputToBuffer = outputToBuffer;

    return generateWatermark(source, destination, options);
};

function embedWatermarkFromFileUpload (options) {
    var source = options.sourceUpload; // Source file
    var sourceData = source.data;
    options.ext = getExtension(source.name);

    var destination = options.destination; // Destination file path
    var outputToBuffer = true;
    options.outputToBuffer = outputToBuffer;

    return generateWatermark(sourceData, destination, options);
};
/**
 * Method to get the watermark details
 * @param {*} options 
 */
function getWatermarkPathDetails(options) {
    var watermark = options.watermark; // Logo file path
    var watermarkUpload = options.watermarkUpload;
    var watermarkPath = watermark;
    
    if (watermarkUpload != null && watermarkUpload.data != null) {
        watermarkPath = tempWrite.sync(watermarkUpload.data);
    }
    console.log('watermarkPath:'+watermarkPath);
    return watermarkPath;
}

function removeWatermark(options, watermarkPath) {
    var watermarkUpload = options.watermarkUpload;
    if (watermarkUpload != null && watermarkUpload.data != null) {
        fs.unlink(watermarkPath,() => {
            console.log('Deleting file ' + watermarkPath)
        })
    }

}
async function generateWatermark(source, destination, options) {
    return new Promise(function (resolve, reject) {    
    /**
     * Left bottom: X = 10, Y = watermarkTextY
     * Right bottom: X = watermarkTextX, Y = watermarkTextYlback) {
    /**
     * Left bottom: X = 10, Y = watermarkTextY
     * Right bottom: X = watermarkTextX, Y = watermarkTextY
     * Left Top: X = 10, Y = 10
     * Right Top: X = watermarkTextX, Y = 10
     */
    var position = options.position; //'right-bottom';
    var type = options.type; //'text';
    var text = options.text ? options.text : '';
    var watermarkPath = getWatermarkPathDetails(options);

    gm(source)
        .size(function(err, size) {

            if (!err) {
                var watermarkTextWidth = (size.width / 3);
                var watermarkTextHeight = (size.height / 3);
                var watermarkTextX = size.width - (size.width / 8);
                var watermarkTextY = size.height - (size.height / 8);

                switch (position) {
                    case 'left-top':
                        var watermarkTextX = 10;
                        var watermarkTextY = 10;
                        break;

                    case 'left-bottom':
                        var watermarkTextX = 10;
                        var watermarkTextY = size.height - (size.height / 8);
                        break;

                    case 'right-top':
                        var watermarkTextX = size.width - (size.width / 8);
                        var watermarkTextY = 10;
                        break;

                    case 'right-bottom':
                        var watermarkTextX = size.width - (size.width / 8);
                        var watermarkTextY = size.height - (size.height / 8) ;
                        break;  
                    case 'center':
                        var watermarkTextX = size.width / 2;
                        var watermarkTextY = size.height / 2 ;
                        break;                                               
                    default:
                        if (typeof position == 'object') {
                            var watermarkTextWidth = position.watermarkTextWidth;
                            var watermarkTextHeight = position.watermarkTextHeight;
                            var watermarkTextX = position.watermarkTextX;
                            var watermarkTextY = position.watermarkTextY;
                        }
                        break;
                }

                if (type === 'text') {

                    var textColor = options.textOption ? options.textOption.color : '#000000';
                    var fontSize = options.textOption ? options.textOption.fontSize : 20;

                    if (!options.outputToBuffer) {
                        gm(source)
                        .fill(textColor)
                        .drawText(watermarkTextX, watermarkTextY, text)
                        .fontSize(fontSize + 'px')
                        .write(destination, function (e) {
                            //console.log(e || 'Text Watermark Done. Path : ' + destination); // What would you like to do here?
                            if (!e) {
                                resolve({ status: 1 });
                            } else {
                                reject({ status: 0 });
                            }
                        });
                    } else {
                        gm(source)
                        .fill(textColor)
                        .drawText(watermarkTextX, watermarkTextY, text)
                        .fontSize(fontSize + 'px')
                        .toBuffer(options.ext, function (err, buffer) {
                            if (!err) {
                                resolve(buffer);
                            } else {
                                //console.log('done!');
                                reject(err);
                            }                            
                        });
                    }

                } else {
                    if (!options.outputToBuffer) {
                            gm(source)
                            .draw(['image over ' + watermarkTextX + ',' + watermarkTextY + ' ' + watermarkTextWidth + ',' + watermarkTextHeight + ' "' + watermarkPath + '"'])
                            .write(destination, function (e) {
                                //console.log(e || 'Image Watermark Done. Path : ' + destination); // What would you like to do here?
                                if (!e) {
                                    resolve({ status: 1 });
                                } else {
                                    reject({ status: 0 });
                                }
                                removeWatermark(options, watermarkPath);
                            });
                    } else {
                        //See https://github.com/aheckmann/gm
                        gm(source)
                            .draw(['image over ' + watermarkTextX + ',' + watermarkTextY + ' ' + watermarkTextWidth + ',' + watermarkTextHeight + ' "' + watermarkPath + '"'])
                            .toBuffer(options.ext, function (err, buffer) {
                                if (!err) {
                                    resolve(buffer);
                                } else {
                                    //console.log('done!');
                                    reject(err);
                                }     
                                removeWatermark(options, watermarkPath);                           
                            });                        
                    }
                }
            } else {
                console.error(err);
                reject(err); 
            }
        });
    });
}

module.exports = {performEmbedWatermark};
