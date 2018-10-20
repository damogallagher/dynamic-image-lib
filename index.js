const embedWatermarkLib = require('./watermark');
const resizeLib = require('./resize');

var embedWatermark = async (options) => {
    return embedWatermarkLib.performEmbedWatermark(options);
}
var resize = async (options) => {
    return resizeLib.performResize(options);
}

module.exports = {embedWatermark, resize}
