var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

/**
 * This is not complete: see https://www.npmjs.com/package/request for details.
 */

// Although rfc forbids the usage of white space in content type
// (http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7), it's still
// a common practice to use that so we need to deal with it in regex.
var contentTypeRe = /\s*\w+\/\w+\s*;\s*charset\s*=\s*([^\s]+)\s*/;

function getProtocolModule(urlString) {
  var _url$parse = _url2['default'].parse(urlString);

  var protocol = _url$parse.protocol;

  if (protocol === 'http:') {
    return _http2['default'];
  } else if (protocol === 'https:') {
    return _https2['default'];
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
      var options = _url2['default'].parse(urlString);
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
            return body += data;
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
      var file = _fs2['default'].createWriteStream(dest);
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

/** Use this for application/x-www-form-urlencoded (URL-Encoded Forms). */

/** Use this for multipart/form-data (Multipart Form Uploads). */

/** Type of HTTP method: 'GET', 'POST', 'PUT', etc. */

/** See docs. */

/** See docs. */

/** See docs. */

/** See docs. */
//# sourceMappingURL=data:application/json;base64,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QUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixjQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6QixjQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRTttQkFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztXQUFBLENBQUMsQ0FBQztTQUM5QztPQUNGLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCLENBQUMsQ0FBQztHQUNKO0NBQ0YsQ0FBQzs7Ozs7O0FBTUYsU0FBUyxXQUFXLENBQ2xCLEdBQVcsRUFDWCxPQUF1QixFQUN2QixNQUFjLEVBQzJDO0FBQ3pELE1BQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7QUFDN0IsV0FBTyxnQkFBTyxPQUFPLENBQUMsQ0FBQztBQUN2QixXQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztHQUN6QjtBQUNELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxXQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFLO0FBQy9DLFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixjQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDZixNQUFNO0FBQ0wsZUFBTyxDQUFDLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFDLENBQUMsQ0FBQztPQUMzQjtLQUNGLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6Imh0dHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuXG4vKipcbiAqIFRoaXMgaXMgbm90IGNvbXBsZXRlOiBzZWUgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcmVxdWVzdCBmb3IgZGV0YWlscy5cbiAqL1xudHlwZSBSZXF1ZXN0T3B0aW9ucyA9IHtcbiAgYXV0aD86IHtcbiAgICB1c2VyOiBzdHJpbmc7XG4gICAgcGFzczogc3RyaW5nO1xuICAgIHNlbmRJbW1lZGlhdGVseT86IGJvb2xlYW47XG4gICAgYmVhcmVyPzogc3RyaW5nO1xuICB9O1xuXG4gIGhlYWRlcnM/OiB7W25hbWU6IHN0cmluZ106IHN0cmluZ307XG5cbiAgLyoqIFVzZSB0aGlzIGZvciBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQgKFVSTC1FbmNvZGVkIEZvcm1zKS4gKi9cbiAgZm9ybT86IE9iamVjdDtcblxuICAvKiogVXNlIHRoaXMgZm9yIG11bHRpcGFydC9mb3JtLWRhdGEgKE11bHRpcGFydCBGb3JtIFVwbG9hZHMpLiAqL1xuICBmb3JtRGF0YT86IE9iamVjdDtcblxuICAvKiogVHlwZSBvZiBIVFRQIG1ldGhvZDogJ0dFVCcsICdQT1NUJywgJ1BVVCcsIGV0Yy4gKi9cbiAgbWV0aG9kPzogc3RyaW5nO1xuXG4gIC8qKiBTZWUgZG9jcy4gKi9cbiAgbXVsdGlwYXJ0PzogbWl4ZWQ7XG5cbiAgLyoqIFNlZSBkb2NzLiAqL1xuICBvYXV0aD86IG1peGVkO1xuXG4gIC8qKiBTZWUgZG9jcy4gKi9cbiAgcHJlYW1ibGVDUkxGPzogYm9vbGVhbjtcblxuICAvKiogU2VlIGRvY3MuICovXG4gIHBvc3RhbWJsZUNSTEY/OiBib29sZWFuO1xufTtcblxuLy8gQWx0aG91Z2ggcmZjIGZvcmJpZHMgdGhlIHVzYWdlIG9mIHdoaXRlIHNwYWNlIGluIGNvbnRlbnQgdHlwZVxuLy8gKGh0dHA6Ly93d3cudzMub3JnL1Byb3RvY29scy9yZmMyNjE2L3JmYzI2MTYtc2VjMy5odG1sI3NlYzMuNyksIGl0J3Mgc3RpbGxcbi8vIGEgY29tbW9uIHByYWN0aWNlIHRvIHVzZSB0aGF0IHNvIHdlIG5lZWQgdG8gZGVhbCB3aXRoIGl0IGluIHJlZ2V4LlxuY29uc3QgY29udGVudFR5cGVSZSA9IC9cXHMqXFx3K1xcL1xcdytcXHMqO1xccypjaGFyc2V0XFxzKj1cXHMqKFteXFxzXSspXFxzKi87XG5cbmZ1bmN0aW9uIGdldFByb3RvY29sTW9kdWxlKHVybFN0cmluZzogc3RyaW5nKTogYW55IHtcbiAgY29uc3Qge3Byb3RvY29sfSA9IHVybC5wYXJzZSh1cmxTdHJpbmcpO1xuICBpZiAocHJvdG9jb2wgPT09ICdodHRwOicpIHtcbiAgICByZXR1cm4gaHR0cDtcbiAgfSBlbHNlIGlmIChwcm90b2NvbCA9PT0gJ2h0dHBzOicpIHtcbiAgICByZXR1cm4gaHR0cHM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgRXJyb3IoYFByb3RvY29sICR7cHJvdG9jb2x9IG5vdCBzdXBwb3J0ZWRgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRSZXNwb25zZUJvZHlDaGFyc2V0KHJlc3BvbnNlOiBhbnkpOiA/c3RyaW5nIHtcbiAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzWydjb250ZW50LXR5cGUnXTtcbiAgaWYgKCFjb250ZW50VHlwZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IG1hdGNoID0gY29udGVudFR5cGVSZS5leGVjKGNvbnRlbnRUeXBlKTtcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogU2VuZCBIdHRwKHMpIEdFVCByZXF1ZXN0IHRvIGdpdmVuIHVybCBhbmQgcmV0dXJuIHRoZSBib2R5IGFzIHN0cmluZy5cbiAgICovXG4gIGdldCh1cmxTdHJpbmc6IHN0cmluZywgaGVhZGVyczogP09iamVjdCwgcmVqZWN0VW5hdXRob3JpemVkOiBib29sID0gdHJ1ZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBib2R5ID0gJyc7XG4gICAgICBjb25zdCBvcHRpb25zOiBPYmplY3QgPSB1cmwucGFyc2UodXJsU3RyaW5nKTtcbiAgICAgIGlmICghb3B0aW9ucy5ob3N0bmFtZSkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBVbmFibGUgdG8gZGV0ZXJtaW5lIHRoZSBkb21haW4gbmFtZSBvZiAke3VybFN0cmluZ31gKSk7XG4gICAgICB9XG4gICAgICBpZiAoaGVhZGVycykge1xuICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5yZWplY3RVbmF1dGhvcml6ZWQgPSByZWplY3RVbmF1dGhvcml6ZWQ7XG4gICAgICBnZXRQcm90b2NvbE1vZHVsZSh1cmxTdHJpbmcpLmdldChvcHRpb25zLCByZXNwb25zZSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMzAwKSB7XG4gICAgICAgICAgcmVqZWN0KGBCYWQgc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjaGFyc2V0ID0gZ2V0UmVzcG9uc2VCb2R5Q2hhcnNldChyZXNwb25zZSk7XG4gICAgICAgICAgaWYgKGNoYXJzZXQpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLnNldEVuY29kaW5nKGNoYXJzZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNwb25zZS5vbignZGF0YScsIGRhdGEgPT4gYm9keSArPSBkYXRhKTtcbiAgICAgICAgICByZXNwb25zZS5vbignZW5kJywgKCkgPT4gcmVzb2x2ZShib2R5KSk7XG4gICAgICAgIH1cbiAgICAgIH0pLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgbGltaXRlZCB2ZXJzaW9uIG9mIGByZXF1aXJlKCdyZXF1ZXN0JykuZGVsKClgIHNvIHdlIGhhdmUgYSBiYXNpYyBQcm9taXNlLWJhc2VkIEFQSVxuICAgKiBmb3IgbWFraW5nIERFTEVURSByZXF1ZXN0cy5cbiAgICovXG4gIGRlbGV0ZShcbiAgICB1cmk6IHN0cmluZyxcbiAgICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyxcbiAgKTogUHJvbWlzZTx7cmVzcG9uc2U6IGh0dHAkSW5jb21pbmdNZXNzYWdlOyBib2R5OiBzdHJpbmd9PiB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KHVyaSwgb3B0aW9ucywgJ0RFTEVURScpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGxpbWl0ZWQgdmVyc2lvbiBvZiBgcmVxdWlyZSgncmVxdWVzdCcpLmdldCgpYCBzbyB3ZSBoYXZlIGEgYmFzaWMgUHJvbWlzZS1iYXNlZCBBUElcbiAgICogZm9yIG1ha2luZyBHRVQgcmVxdWVzdHMuXG4gICAqXG4gICAqIEN1cnJlbnRseSBuYW1lZCBcImRvR2V0XCIgYmVjYXVzZSBcImdldFwiIHdhcyBjcmVhdGVkIGZpcnN0LiBXZSBwcm9iYWJseSB3YW50IHRvIHJlcGxhY2UgYWxsXG4gICAqIGV4aXN0aW5nIHVzZXMgb2YgXCJnZXRcIiwgcmVwbGFjZSB0aGVtIHdpdGggXCJkb0dldCgpXCIsIGFuZCB0aGVuIHJlbmFtZSBcImRvR2V0KClcIiB0byBcImdldCgpXCIuXG4gICAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiBcImRvR2V0XCIgaXMgc2ltcGxlciwgZm9sbG93cyByZWRpcmVjdHMsIGFuZCBoYXMgbW9yZSBmZWF0dXJlcyB0aGFuIFwiZ2V0XCIuXG4gICAqXG4gICAqIFRoZSBtYWpvciBkb3duc2lkZSBvZiB1c2luZyByZXF1ZXN0IGluc3RlYWQgb2Ygb3VyIGhhbmQtcm9sbGVkIGltcGxlbWVudGF0aW9uIGlzIHRoYXQgaXQgaGFzXG4gICAqIGEgbG90IG9mIGRlcGVuZGVuY2llcyBvZiBpdHMgb3duLlxuICAgKi9cbiAgZG9HZXQoXG4gICAgdXJpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMsXG4gICk6IFByb21pc2U8e3Jlc3BvbnNlOiBodHRwJEluY29taW5nTWVzc2FnZTsgYm9keTogc3RyaW5nfT4ge1xuICAgIHJldHVybiBtYWtlUmVxdWVzdCh1cmksIG9wdGlvbnMsICdHRVQnKTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvdmlkZXMgYSBsaW1pdGVkIHZlcnNpb24gb2YgYHJlcXVpcmUoJ3JlcXVlc3QnKS5oZWFkKClgIHNvIHdlIGhhdmUgYSBiYXNpYyBQcm9taXNlLWJhc2VkIEFQSVxuICAgKiBmb3IgbWFraW5nIEhFQUQgcmVxdWVzdHMuXG4gICAqL1xuICBoZWFkKFxuICAgIHVyaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zLFxuICApOiBQcm9taXNlPHtyZXNwb25zZTogaHR0cCRJbmNvbWluZ01lc3NhZ2U7IGJvZHk6IHN0cmluZ30+IHtcbiAgICByZXR1cm4gbWFrZVJlcXVlc3QodXJpLCBvcHRpb25zLCAnSEVBRCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGxpbWl0ZWQgdmVyc2lvbiBvZiBgcmVxdWlyZSgncmVxdWVzdCcpLnBhdGNoKClgIHNvIHdlIGhhdmUgYSBiYXNpYyBQcm9taXNlLWJhc2VkIEFQSVxuICAgKiBmb3IgbWFraW5nIFBBVENIIHJlcXVlc3RzLlxuICAgKi9cbiAgcGF0Y2goXG4gICAgdXJpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMsXG4gICk6IFByb21pc2U8e3Jlc3BvbnNlOiBodHRwJEluY29taW5nTWVzc2FnZTsgYm9keTogc3RyaW5nfT4ge1xuICAgIHJldHVybiBtYWtlUmVxdWVzdCh1cmksIG9wdGlvbnMsICdQQVRDSCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGxpbWl0ZWQgdmVyc2lvbiBvZiBgcmVxdWlyZSgncmVxdWVzdCcpLnBvc3QoKWAgc28gd2UgaGF2ZSBhIGJhc2ljIFByb21pc2UtYmFzZWQgQVBJXG4gICAqIGZvciBtYWtpbmcgUE9TVCByZXF1ZXN0cy5cbiAgICovXG4gIHBvc3QoXG4gICAgdXJpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMsXG4gICk6IFByb21pc2U8e3Jlc3BvbnNlOiBodHRwJEluY29taW5nTWVzc2FnZTsgYm9keTogc3RyaW5nfT4ge1xuICAgIHJldHVybiBtYWtlUmVxdWVzdCh1cmksIG9wdGlvbnMsICdQT1NUJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgbGltaXRlZCB2ZXJzaW9uIG9mIGByZXF1aXJlKCdyZXF1ZXN0JykucHV0KClgIHNvIHdlIGhhdmUgYSBiYXNpYyBQcm9taXNlLWJhc2VkIEFQSVxuICAgKiBmb3IgbWFraW5nIFBVVCByZXF1ZXN0cy5cbiAgICovXG4gIHB1dChcbiAgICB1cmk6IHN0cmluZyxcbiAgICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyxcbiAgKTogUHJvbWlzZTx7cmVzcG9uc2U6IGh0dHAkSW5jb21pbmdNZXNzYWdlOyBib2R5OiBzdHJpbmd9PiB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KHVyaSwgb3B0aW9ucywgJ1BVVCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZW5kIEh0dHAocykgR0VUIHJlcXVlc3QgdG8gZ2l2ZW4gdXJsIGFuZCBzYXZlIHRoZSBib2R5IHRvIGRlc3QgZmlsZS5cbiAgICovXG4gIGRvd25sb2FkKHVybFN0cmluZzogc3RyaW5nLCBkZXN0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QpO1xuICAgICAgZ2V0UHJvdG9jb2xNb2R1bGUodXJsU3RyaW5nKS5nZXQodXJsU3RyaW5nLCByZXNwb25zZSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMzAwKSB7XG4gICAgICAgICAgcmVqZWN0KGBCYWQgc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNwb25zZS5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICAgIHJlc3BvbnNlLnBpcGUoZmlsZSk7XG4gICAgICAgICAgZmlsZS5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgICAgIGZpbGUub24oJ2ZpbmlzaCcsICgpID0+IGZpbGUuY2xvc2UocmVzb2x2ZSkpO1xuICAgICAgICB9XG4gICAgICB9KS5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICB9LFxufTtcblxuLyoqXG4gKiBNYWtlcyBhIHJlcXVlc3QgdXNpbmcgdGhlIFtgcmVxdWVzdGBdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3JlcXVlc3QpIG1vZHVsZSxcbiAqIHdoaWNoIGZvbGxvd3MgcmVkaXJlY3RzIGFuZCB0YWtlcyBjYXJlIG9mIGh0dHAgdnMuIGh0dHBzIGJ5IGRlZmF1bHQuXG4gKi9cbmZ1bmN0aW9uIG1ha2VSZXF1ZXN0KFxuICB1cmk6IHN0cmluZyxcbiAgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMsXG4gIG1ldGhvZDogc3RyaW5nLFxuKTogUHJvbWlzZTx7cmVzcG9uc2U6IGh0dHAkSW5jb21pbmdNZXNzYWdlOyBib2R5OiBzdHJpbmd9PiB7XG4gIGlmIChvcHRpb25zLm1ldGhvZCAhPT0gbWV0aG9kKSB7XG4gICAgb3B0aW9ucyA9IHsuLi5vcHRpb25zfTtcbiAgICBvcHRpb25zLm1ldGhvZCA9IG1ldGhvZDtcbiAgfVxuICBjb25zdCByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcXVlc3QodXJpLCBvcHRpb25zLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSh7cmVzcG9uc2UsIGJvZHl9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=