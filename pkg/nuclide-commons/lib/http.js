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

/** Entity body for PATCH, POST and PUT requests. */

/** Use this for application/x-www-form-urlencoded (URL-Encoded Forms). */

/** Use this for multipart/form-data (Multipart Form Uploads). */

/** Type of HTTP method: 'GET', 'POST', 'PUT', etc. */

/** See docs. */

/** See docs. */

/** See docs. */

/** See docs. */
//# sourceMappingURL=data:application/json;base64,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QUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixjQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6QixjQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRTttQkFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztXQUFBLENBQUMsQ0FBQztTQUM5QztPQUNGLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCLENBQUMsQ0FBQztHQUNKO0NBQ0YsQ0FBQzs7Ozs7O0FBTUYsU0FBUyxXQUFXLENBQ2xCLEdBQVcsRUFDWCxPQUF1QixFQUN2QixNQUFjLEVBQzJDO0FBQ3pELE1BQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7QUFDN0IsV0FBTyxnQkFBTyxPQUFPLENBQUMsQ0FBQztBQUN2QixXQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztHQUN6QjtBQUNELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxXQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFLO0FBQy9DLFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixjQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDZixNQUFNO0FBQ0wsZUFBTyxDQUFDLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFDLENBQUMsQ0FBQztPQUMzQjtLQUNGLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6Imh0dHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuXG4vKipcbiAqIFRoaXMgaXMgbm90IGNvbXBsZXRlOiBzZWUgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcmVxdWVzdCBmb3IgZGV0YWlscy5cbiAqL1xudHlwZSBSZXF1ZXN0T3B0aW9ucyA9IHtcbiAgYXV0aD86IHtcbiAgICB1c2VyOiBzdHJpbmc7XG4gICAgcGFzczogc3RyaW5nO1xuICAgIHNlbmRJbW1lZGlhdGVseT86IGJvb2xlYW47XG4gICAgYmVhcmVyPzogc3RyaW5nO1xuICB9O1xuXG4gIGhlYWRlcnM/OiB7W25hbWU6IHN0cmluZ106IHN0cmluZ307XG5cbiAgLyoqIEVudGl0eSBib2R5IGZvciBQQVRDSCwgUE9TVCBhbmQgUFVUIHJlcXVlc3RzLiAqL1xuICBib2R5Pzogc3RyaW5nO1xuXG4gIC8qKiBVc2UgdGhpcyBmb3IgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkIChVUkwtRW5jb2RlZCBGb3JtcykuICovXG4gIGZvcm0/OiBPYmplY3Q7XG5cbiAgLyoqIFVzZSB0aGlzIGZvciBtdWx0aXBhcnQvZm9ybS1kYXRhIChNdWx0aXBhcnQgRm9ybSBVcGxvYWRzKS4gKi9cbiAgZm9ybURhdGE/OiBPYmplY3Q7XG5cbiAgLyoqIFR5cGUgb2YgSFRUUCBtZXRob2Q6ICdHRVQnLCAnUE9TVCcsICdQVVQnLCBldGMuICovXG4gIG1ldGhvZD86IHN0cmluZztcblxuICAvKiogU2VlIGRvY3MuICovXG4gIG11bHRpcGFydD86IG1peGVkO1xuXG4gIC8qKiBTZWUgZG9jcy4gKi9cbiAgb2F1dGg/OiBtaXhlZDtcblxuICAvKiogU2VlIGRvY3MuICovXG4gIHByZWFtYmxlQ1JMRj86IGJvb2xlYW47XG5cbiAgLyoqIFNlZSBkb2NzLiAqL1xuICBwb3N0YW1ibGVDUkxGPzogYm9vbGVhbjtcbn07XG5cbi8vIEFsdGhvdWdoIHJmYyBmb3JiaWRzIHRoZSB1c2FnZSBvZiB3aGl0ZSBzcGFjZSBpbiBjb250ZW50IHR5cGVcbi8vIChodHRwOi8vd3d3LnczLm9yZy9Qcm90b2NvbHMvcmZjMjYxNi9yZmMyNjE2LXNlYzMuaHRtbCNzZWMzLjcpLCBpdCdzIHN0aWxsXG4vLyBhIGNvbW1vbiBwcmFjdGljZSB0byB1c2UgdGhhdCBzbyB3ZSBuZWVkIHRvIGRlYWwgd2l0aCBpdCBpbiByZWdleC5cbmNvbnN0IGNvbnRlbnRUeXBlUmUgPSAvXFxzKlxcdytcXC9cXHcrXFxzKjtcXHMqY2hhcnNldFxccyo9XFxzKihbXlxcc10rKVxccyovO1xuXG5mdW5jdGlvbiBnZXRQcm90b2NvbE1vZHVsZSh1cmxTdHJpbmc6IHN0cmluZyk6IGFueSB7XG4gIGNvbnN0IHtwcm90b2NvbH0gPSB1cmwucGFyc2UodXJsU3RyaW5nKTtcbiAgaWYgKHByb3RvY29sID09PSAnaHR0cDonKSB7XG4gICAgcmV0dXJuIGh0dHA7XG4gIH0gZWxzZSBpZiAocHJvdG9jb2wgPT09ICdodHRwczonKSB7XG4gICAgcmV0dXJuIGh0dHBzO1xuICB9IGVsc2Uge1xuICAgIHRocm93IEVycm9yKGBQcm90b2NvbCAke3Byb3RvY29sfSBub3Qgc3VwcG9ydGVkYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmVzcG9uc2VCb2R5Q2hhcnNldChyZXNwb25zZTogYW55KTogP3N0cmluZyB7XG4gIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVyc1snY29udGVudC10eXBlJ107XG4gIGlmICghY29udGVudFR5cGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBtYXRjaCA9IGNvbnRlbnRUeXBlUmUuZXhlYyhjb250ZW50VHlwZSk7XG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLyoqXG4gICAqIFNlbmQgSHR0cChzKSBHRVQgcmVxdWVzdCB0byBnaXZlbiB1cmwgYW5kIHJldHVybiB0aGUgYm9keSBhcyBzdHJpbmcuXG4gICAqL1xuICBnZXQodXJsU3RyaW5nOiBzdHJpbmcsIGhlYWRlcnM6ID9PYmplY3QsIHJlamVjdFVuYXV0aG9yaXplZDogYm9vbCA9IHRydWUpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgY29uc3Qgb3B0aW9uczogT2JqZWN0ID0gdXJsLnBhcnNlKHVybFN0cmluZyk7XG4gICAgICBpZiAoIW9wdGlvbnMuaG9zdG5hbWUpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgVW5hYmxlIHRvIGRldGVybWluZSB0aGUgZG9tYWluIG5hbWUgb2YgJHt1cmxTdHJpbmd9YCkpO1xuICAgICAgfVxuICAgICAgaWYgKGhlYWRlcnMpIHtcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzID0gaGVhZGVycztcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMucmVqZWN0VW5hdXRob3JpemVkID0gcmVqZWN0VW5hdXRob3JpemVkO1xuICAgICAgZ2V0UHJvdG9jb2xNb2R1bGUodXJsU3RyaW5nKS5nZXQob3B0aW9ucywgcmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICAgIHJlamVjdChgQmFkIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgY2hhcnNldCA9IGdldFJlc3BvbnNlQm9keUNoYXJzZXQocmVzcG9uc2UpO1xuICAgICAgICAgIGlmIChjaGFyc2V0KSB7XG4gICAgICAgICAgICByZXNwb25zZS5zZXRFbmNvZGluZyhjaGFyc2V0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCBkYXRhID0+IGJvZHkgKz0gZGF0YSk7XG4gICAgICAgICAgcmVzcG9uc2Uub24oJ2VuZCcsICgpID0+IHJlc29sdmUoYm9keSkpO1xuICAgICAgICB9XG4gICAgICB9KS5vbignZXJyb3InLCByZWplY3QpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGxpbWl0ZWQgdmVyc2lvbiBvZiBgcmVxdWlyZSgncmVxdWVzdCcpLmRlbCgpYCBzbyB3ZSBoYXZlIGEgYmFzaWMgUHJvbWlzZS1iYXNlZCBBUElcbiAgICogZm9yIG1ha2luZyBERUxFVEUgcmVxdWVzdHMuXG4gICAqL1xuICBkZWxldGUoXG4gICAgdXJpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMsXG4gICk6IFByb21pc2U8e3Jlc3BvbnNlOiBodHRwJEluY29taW5nTWVzc2FnZTsgYm9keTogc3RyaW5nfT4ge1xuICAgIHJldHVybiBtYWtlUmVxdWVzdCh1cmksIG9wdGlvbnMsICdERUxFVEUnKTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvdmlkZXMgYSBsaW1pdGVkIHZlcnNpb24gb2YgYHJlcXVpcmUoJ3JlcXVlc3QnKS5nZXQoKWAgc28gd2UgaGF2ZSBhIGJhc2ljIFByb21pc2UtYmFzZWQgQVBJXG4gICAqIGZvciBtYWtpbmcgR0VUIHJlcXVlc3RzLlxuICAgKlxuICAgKiBDdXJyZW50bHkgbmFtZWQgXCJkb0dldFwiIGJlY2F1c2UgXCJnZXRcIiB3YXMgY3JlYXRlZCBmaXJzdC4gV2UgcHJvYmFibHkgd2FudCB0byByZXBsYWNlIGFsbFxuICAgKiBleGlzdGluZyB1c2VzIG9mIFwiZ2V0XCIsIHJlcGxhY2UgdGhlbSB3aXRoIFwiZG9HZXQoKVwiLCBhbmQgdGhlbiByZW5hbWUgXCJkb0dldCgpXCIgdG8gXCJnZXQoKVwiLlxuICAgKiBUaGUgaW1wbGVtZW50YXRpb24gb2YgXCJkb0dldFwiIGlzIHNpbXBsZXIsIGZvbGxvd3MgcmVkaXJlY3RzLCBhbmQgaGFzIG1vcmUgZmVhdHVyZXMgdGhhbiBcImdldFwiLlxuICAgKlxuICAgKiBUaGUgbWFqb3IgZG93bnNpZGUgb2YgdXNpbmcgcmVxdWVzdCBpbnN0ZWFkIG9mIG91ciBoYW5kLXJvbGxlZCBpbXBsZW1lbnRhdGlvbiBpcyB0aGF0IGl0IGhhc1xuICAgKiBhIGxvdCBvZiBkZXBlbmRlbmNpZXMgb2YgaXRzIG93bi5cbiAgICovXG4gIGRvR2V0KFxuICAgIHVyaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zLFxuICApOiBQcm9taXNlPHtyZXNwb25zZTogaHR0cCRJbmNvbWluZ01lc3NhZ2U7IGJvZHk6IHN0cmluZ30+IHtcbiAgICByZXR1cm4gbWFrZVJlcXVlc3QodXJpLCBvcHRpb25zLCAnR0VUJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgbGltaXRlZCB2ZXJzaW9uIG9mIGByZXF1aXJlKCdyZXF1ZXN0JykuaGVhZCgpYCBzbyB3ZSBoYXZlIGEgYmFzaWMgUHJvbWlzZS1iYXNlZCBBUElcbiAgICogZm9yIG1ha2luZyBIRUFEIHJlcXVlc3RzLlxuICAgKi9cbiAgaGVhZChcbiAgICB1cmk6IHN0cmluZyxcbiAgICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyxcbiAgKTogUHJvbWlzZTx7cmVzcG9uc2U6IGh0dHAkSW5jb21pbmdNZXNzYWdlOyBib2R5OiBzdHJpbmd9PiB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KHVyaSwgb3B0aW9ucywgJ0hFQUQnKTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvdmlkZXMgYSBsaW1pdGVkIHZlcnNpb24gb2YgYHJlcXVpcmUoJ3JlcXVlc3QnKS5wYXRjaCgpYCBzbyB3ZSBoYXZlIGEgYmFzaWMgUHJvbWlzZS1iYXNlZCBBUElcbiAgICogZm9yIG1ha2luZyBQQVRDSCByZXF1ZXN0cy5cbiAgICovXG4gIHBhdGNoKFxuICAgIHVyaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zLFxuICApOiBQcm9taXNlPHtyZXNwb25zZTogaHR0cCRJbmNvbWluZ01lc3NhZ2U7IGJvZHk6IHN0cmluZ30+IHtcbiAgICByZXR1cm4gbWFrZVJlcXVlc3QodXJpLCBvcHRpb25zLCAnUEFUQ0gnKTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvdmlkZXMgYSBsaW1pdGVkIHZlcnNpb24gb2YgYHJlcXVpcmUoJ3JlcXVlc3QnKS5wb3N0KClgIHNvIHdlIGhhdmUgYSBiYXNpYyBQcm9taXNlLWJhc2VkIEFQSVxuICAgKiBmb3IgbWFraW5nIFBPU1QgcmVxdWVzdHMuXG4gICAqL1xuICBwb3N0KFxuICAgIHVyaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zLFxuICApOiBQcm9taXNlPHtyZXNwb25zZTogaHR0cCRJbmNvbWluZ01lc3NhZ2U7IGJvZHk6IHN0cmluZ30+IHtcbiAgICByZXR1cm4gbWFrZVJlcXVlc3QodXJpLCBvcHRpb25zLCAnUE9TVCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGxpbWl0ZWQgdmVyc2lvbiBvZiBgcmVxdWlyZSgncmVxdWVzdCcpLnB1dCgpYCBzbyB3ZSBoYXZlIGEgYmFzaWMgUHJvbWlzZS1iYXNlZCBBUElcbiAgICogZm9yIG1ha2luZyBQVVQgcmVxdWVzdHMuXG4gICAqL1xuICBwdXQoXG4gICAgdXJpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMsXG4gICk6IFByb21pc2U8e3Jlc3BvbnNlOiBodHRwJEluY29taW5nTWVzc2FnZTsgYm9keTogc3RyaW5nfT4ge1xuICAgIHJldHVybiBtYWtlUmVxdWVzdCh1cmksIG9wdGlvbnMsICdQVVQnKTtcbiAgfSxcblxuICAvKipcbiAgICogU2VuZCBIdHRwKHMpIEdFVCByZXF1ZXN0IHRvIGdpdmVuIHVybCBhbmQgc2F2ZSB0aGUgYm9keSB0byBkZXN0IGZpbGUuXG4gICAqL1xuICBkb3dubG9hZCh1cmxTdHJpbmc6IHN0cmluZywgZGVzdDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0KTtcbiAgICAgIGdldFByb3RvY29sTW9kdWxlKHVybFN0cmluZykuZ2V0KHVybFN0cmluZywgcmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICAgIHJlamVjdChgQmFkIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzcG9uc2Uub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICByZXNwb25zZS5waXBlKGZpbGUpO1xuICAgICAgICAgIGZpbGUub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICBmaWxlLm9uKCdmaW5pc2gnLCAoKSA9PiBmaWxlLmNsb3NlKHJlc29sdmUpKTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfSxcbn07XG5cbi8qKlxuICogTWFrZXMgYSByZXF1ZXN0IHVzaW5nIHRoZSBbYHJlcXVlc3RgXShodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9yZXF1ZXN0KSBtb2R1bGUsXG4gKiB3aGljaCBmb2xsb3dzIHJlZGlyZWN0cyBhbmQgdGFrZXMgY2FyZSBvZiBodHRwIHZzLiBodHRwcyBieSBkZWZhdWx0LlxuICovXG5mdW5jdGlvbiBtYWtlUmVxdWVzdChcbiAgdXJpOiBzdHJpbmcsXG4gIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zLFxuICBtZXRob2Q6IHN0cmluZyxcbik6IFByb21pc2U8e3Jlc3BvbnNlOiBodHRwJEluY29taW5nTWVzc2FnZTsgYm9keTogc3RyaW5nfT4ge1xuICBpZiAob3B0aW9ucy5tZXRob2QgIT09IG1ldGhvZCkge1xuICAgIG9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG4gICAgb3B0aW9ucy5tZXRob2QgPSBtZXRob2Q7XG4gIH1cbiAgY29uc3QgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXF1ZXN0KHVyaSwgb3B0aW9ucywgKGVycm9yLCByZXNwb25zZSwgYm9keSkgPT4ge1xuICAgICAgaWYgKGVycm9yICE9IG51bGwpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoe3Jlc3BvbnNlLCBib2R5fSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuIl19