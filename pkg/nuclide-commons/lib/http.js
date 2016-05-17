var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _http2;

function _http() {
  return _http2 = _interopRequireDefault(require('http'));
}

var _https2;

function _https() {
  return _https2 = _interopRequireDefault(require('https'));
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

/**
 * This is not complete: see https://www.npmjs.com/package/request for details.
 */

// Although rfc forbids the usage of white space in content type
// (http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7), it's still
// a common practice to use that so we need to deal with it in regex.
var contentTypeRe = /\s*\w+\/\w+\s*;\s*charset\s*=\s*([^\s]+)\s*/;

function getProtocolModule(urlString) {
  var _default$parse = (_url2 || _url()).default.parse(urlString);

  var protocol = _default$parse.protocol;

  if (protocol === 'http:') {
    return (_http2 || _http()).default;
  } else if (protocol === 'https:') {
    return (_https2 || _https()).default;
  } else {
    throw Error('Protocol ' + protocol + ' not supported');
  }
}

function getResponseBodyCharset(response) {
  var contentType = response.headers['content-type'];
  if (!contentType) {
    return null;
  }
  var match = contentTypeRe.exec(contentType);
  return match ? match[1] : null;
}

module.exports = {

  /**
   * Send Http(s) GET request to given url and return the body as string.
   */
  get: function get(urlString, headers) {
    var rejectUnauthorized = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    return new Promise(function (resolve, reject) {
      var body = '';
      var options = (_url2 || _url()).default.parse(urlString);
      if (!options.hostname) {
        reject(new Error('Unable to determine the domain name of ' + urlString));
      }
      if (headers) {
        options.headers = headers;
      }
      options.rejectUnauthorized = rejectUnauthorized;
      getProtocolModule(urlString).get(options, function (response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject('Bad status ' + response.statusCode);
        } else {
          var charset = getResponseBodyCharset(response);
          if (charset) {
            response.setEncoding(charset);
          }
          response.on('data', function (data) {
            body += data;
          });
          response.on('end', function () {
            return resolve(body);
          });
        }
      }).on('error', reject);
    });
  },

  /**
   * Provides a limited version of `require('request').del()` so we have a basic Promise-based API
   * for making DELETE requests.
   */
  'delete': function _delete(uri, options) {
    return makeRequest(uri, options, 'DELETE');
  },

  /**
   * Provides a limited version of `require('request').get()` so we have a basic Promise-based API
   * for making GET requests.
   *
   * Currently named "doGet" because "get" was created first. We probably want to replace all
   * existing uses of "get", replace them with "doGet()", and then rename "doGet()" to "get()".
   * The implementation of "doGet" is simpler, follows redirects, and has more features than "get".
   *
   * The major downside of using request instead of our hand-rolled implementation is that it has
   * a lot of dependencies of its own.
   */
  doGet: function doGet(uri, options) {
    return makeRequest(uri, options, 'GET');
  },

  /**
   * Provides a limited version of `require('request').head()` so we have a basic Promise-based API
   * for making HEAD requests.
   */
  head: function head(uri, options) {
    return makeRequest(uri, options, 'HEAD');
  },

  /**
   * Provides a limited version of `require('request').patch()` so we have a basic Promise-based API
   * for making PATCH requests.
   */
  patch: function patch(uri, options) {
    return makeRequest(uri, options, 'PATCH');
  },

  /**
   * Provides a limited version of `require('request').post()` so we have a basic Promise-based API
   * for making POST requests.
   */
  post: function post(uri, options) {
    return makeRequest(uri, options, 'POST');
  },

  /**
   * Provides a limited version of `require('request').put()` so we have a basic Promise-based API
   * for making PUT requests.
   */
  put: function put(uri, options) {
    return makeRequest(uri, options, 'PUT');
  },

  /**
   * Send Http(s) GET request to given url and save the body to dest file.
   */
  download: function download(urlString, dest) {
    return new Promise(function (resolve, reject) {
      var file = (_fs2 || _fs()).default.createWriteStream(dest);
      getProtocolModule(urlString).get(urlString, function (response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject('Bad status ' + response.statusCode);
        } else {
          response.on('error', reject);
          response.pipe(file);
          file.on('error', reject);
          file.on('finish', function () {
            return file.close(resolve);
          });
        }
      }).on('error', reject);
    });
  }
};

/**
 * Makes a request using the [`request`](https://www.npmjs.com/package/request) module,
 * which follows redirects and takes care of http vs. https by default.
 */
function makeRequest(uri, options, method) {
  if (options.method !== method) {
    options = _extends({}, options);
    options.method = method;
  }
  var request = require('request');
  return new Promise(function (resolve, reject) {
    request(uri, options, function (error, response, body) {
      if (error != null) {
        reject(error);
      } else {
        resolve({ response: response, body: body });
      }
    });
  });
}

/** Entity body for PATCH, POST and PUT requests. */

/** Use this for application/x-www-form-urlencoded (URL-Encoded Forms). */

/** Use this for multipart/form-data (Multipart Form Uploads). */

/** Type of HTTP method: 'GET', 'POST', 'PUT', etc. */

/** See docs. */

/** See docs. */

/** See docs. */

/** See docs. */