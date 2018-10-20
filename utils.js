const _ = require('lodash')

var getExtension = function (fileName) {

    if (_.isEmpty(fileName)) {
        return null;
    }

    return fileName.split('.').pop();
}


module.exports = { getExtension }
