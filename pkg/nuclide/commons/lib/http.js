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

/**
 * This is not complete: see https://www.npmjs.com/package/request for details.
 */

// Although rfc forbids the usage of white space in content type
// (http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7), it's still
// a common practice to use that so we need to deal with it in regex.
var contentTypeRe = /\s*\w+\/\w+\s*;\s*charset\s*=\s*([^\s]+)\s*/;

function getProtocolModule(url) {
  var _require$parse = require('url').parse(url);

  var protocol = _require$parse.protocol;

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
  get: function get(url, headers) {
    var rejectUnauthorized = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    return new Promise(function (resolve, reject) {
      var body = '';
      var options = require('url').parse(url);
      if (!options.hostname) {
        reject(new Error('Unable to determine the domain name of ' + url));
      }
      if (headers) {
        options.headers = headers;
      }
      options.rejectUnauthorized = rejectUnauthorized;
      getProtocolModule(url).get(options, function (response) {
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
  download: function download(url, dest) {
    return new Promise(function (resolve, reject) {
      var file = _fs2['default'].createWriteStream(dest);
      getProtocolModule(url).get(url, function (response) {
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
//# sourceMappingURL=data:application/json;base64,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QUFDLENBQUM7QUFDN0Isa0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsY0FBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDekIsY0FBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7bUJBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7V0FBQSxDQUFDLENBQUM7U0FDOUM7T0FDRixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN4QixDQUFDLENBQUM7R0FDSjtDQUNGLENBQUM7Ozs7OztBQU1GLFNBQVMsV0FBVyxDQUNsQixHQUFXLEVBQ1gsT0FBdUIsRUFDdkIsTUFBYyxFQUMyQztBQUN6RCxNQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO0FBQzdCLFdBQU8sZ0JBQU8sT0FBTyxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7R0FDekI7QUFDRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsV0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBSztBQUMvQyxVQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsY0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2YsTUFBTTtBQUNMLGVBQU8sQ0FBQyxFQUFDLFFBQVEsRUFBUixRQUFRLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBQyxDQUFDLENBQUM7T0FDM0I7S0FDRixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJodHRwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0IGh0dHBzIGZyb20gJ2h0dHBzJztcblxuLyoqXG4gKiBUaGlzIGlzIG5vdCBjb21wbGV0ZTogc2VlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3JlcXVlc3QgZm9yIGRldGFpbHMuXG4gKi9cbnR5cGUgUmVxdWVzdE9wdGlvbnMgPSB7XG4gIGF1dGg/OiB7XG4gICAgdXNlcjogc3RyaW5nO1xuICAgIHBhc3M6IHN0cmluZztcbiAgICBzZW5kSW1tZWRpYXRlbHk/OiBib29sZWFuO1xuICAgIGJlYXJlcj86IHN0cmluZztcbiAgfTtcblxuICBoZWFkZXJzPzoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9O1xuXG4gIC8qKiBVc2UgdGhpcyBmb3IgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkIChVUkwtRW5jb2RlZCBGb3JtcykuICovXG4gIGZvcm0/OiBPYmplY3Q7XG5cbiAgLyoqIFVzZSB0aGlzIGZvciBtdWx0aXBhcnQvZm9ybS1kYXRhIChNdWx0aXBhcnQgRm9ybSBVcGxvYWRzKS4gKi9cbiAgZm9ybURhdGE/OiBPYmplY3Q7XG5cbiAgLyoqIFR5cGUgb2YgSFRUUCBtZXRob2Q6ICdHRVQnLCAnUE9TVCcsICdQVVQnLCBldGMuICovXG4gIG1ldGhvZD86IHN0cmluZztcblxuICAvKiogU2VlIGRvY3MuICovXG4gIG11bHRpcGFydD86IG1peGVkO1xuXG4gIC8qKiBTZWUgZG9jcy4gKi9cbiAgb2F1dGg/OiBtaXhlZDtcblxuICAvKiogU2VlIGRvY3MuICovXG4gIHByZWFtYmxlQ1JMRj86IGJvb2xlYW47XG5cbiAgLyoqIFNlZSBkb2NzLiAqL1xuICBwb3N0YW1ibGVDUkxGPzogYm9vbGVhbjtcbn07XG5cbi8vIEFsdGhvdWdoIHJmYyBmb3JiaWRzIHRoZSB1c2FnZSBvZiB3aGl0ZSBzcGFjZSBpbiBjb250ZW50IHR5cGVcbi8vIChodHRwOi8vd3d3LnczLm9yZy9Qcm90b2NvbHMvcmZjMjYxNi9yZmMyNjE2LXNlYzMuaHRtbCNzZWMzLjcpLCBpdCdzIHN0aWxsXG4vLyBhIGNvbW1vbiBwcmFjdGljZSB0byB1c2UgdGhhdCBzbyB3ZSBuZWVkIHRvIGRlYWwgd2l0aCBpdCBpbiByZWdleC5cbmNvbnN0IGNvbnRlbnRUeXBlUmUgPSAvXFxzKlxcdytcXC9cXHcrXFxzKjtcXHMqY2hhcnNldFxccyo9XFxzKihbXlxcc10rKVxccyovO1xuXG5mdW5jdGlvbiBnZXRQcm90b2NvbE1vZHVsZSh1cmw6IHN0cmluZyk6IGFueSB7XG4gIGNvbnN0IHtwcm90b2NvbH0gPSByZXF1aXJlKCd1cmwnKS5wYXJzZSh1cmwpO1xuICBpZiAocHJvdG9jb2wgPT09ICdodHRwOicpIHtcbiAgICByZXR1cm4gaHR0cDtcbiAgfSBlbHNlIGlmIChwcm90b2NvbCA9PT0gJ2h0dHBzOicpIHtcbiAgICByZXR1cm4gaHR0cHM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgRXJyb3IoYFByb3RvY29sICR7cHJvdG9jb2x9IG5vdCBzdXBwb3J0ZWRgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRSZXNwb25zZUJvZHlDaGFyc2V0KHJlc3BvbnNlOiBhbnkpOiA/c3RyaW5nIHtcbiAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzWydjb250ZW50LXR5cGUnXTtcbiAgaWYgKCFjb250ZW50VHlwZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IG1hdGNoID0gY29udGVudFR5cGVSZS5leGVjKGNvbnRlbnRUeXBlKTtcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogU2VuZCBIdHRwKHMpIEdFVCByZXF1ZXN0IHRvIGdpdmVuIHVybCBhbmQgcmV0dXJuIHRoZSBib2R5IGFzIHN0cmluZy5cbiAgICovXG4gIGdldCh1cmw6IHN0cmluZywgaGVhZGVyczogP09iamVjdCwgcmVqZWN0VW5hdXRob3JpemVkOiBib29sID0gdHJ1ZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBib2R5ID0gJyc7XG4gICAgICBjb25zdCBvcHRpb25zOiBPYmplY3QgPSByZXF1aXJlKCd1cmwnKS5wYXJzZSh1cmwpO1xuICAgICAgaWYgKCFvcHRpb25zLmhvc3RuYW1lKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIGRvbWFpbiBuYW1lIG9mICR7dXJsfWApKTtcbiAgICAgIH1cbiAgICAgIGlmIChoZWFkZXJzKSB7XG4gICAgICAgIG9wdGlvbnMuaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgICB9XG4gICAgICBvcHRpb25zLnJlamVjdFVuYXV0aG9yaXplZCA9IHJlamVjdFVuYXV0aG9yaXplZDtcbiAgICAgIGdldFByb3RvY29sTW9kdWxlKHVybCkuZ2V0KG9wdGlvbnMsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAzMDApIHtcbiAgICAgICAgICByZWplY3QoYEJhZCBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXNDb2RlfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGNoYXJzZXQgPSBnZXRSZXNwb25zZUJvZHlDaGFyc2V0KHJlc3BvbnNlKTtcbiAgICAgICAgICBpZiAoY2hhcnNldCkge1xuICAgICAgICAgICAgcmVzcG9uc2Uuc2V0RW5jb2RpbmcoY2hhcnNldCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3BvbnNlLm9uKCdkYXRhJywgZGF0YSA9PiBib2R5ICs9IGRhdGEpO1xuICAgICAgICAgIHJlc3BvbnNlLm9uKCdlbmQnLCAoKSA9PiByZXNvbHZlKGJvZHkpKTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvdmlkZXMgYSBsaW1pdGVkIHZlcnNpb24gb2YgYHJlcXVpcmUoJ3JlcXVlc3QnKS5kZWwoKWAgc28gd2UgaGF2ZSBhIGJhc2ljIFByb21pc2UtYmFzZWQgQVBJXG4gICAqIGZvciBtYWtpbmcgREVMRVRFIHJlcXVlc3RzLlxuICAgKi9cbiAgZGVsZXRlKFxuICAgIHVyaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zLFxuICApOiBQcm9taXNlPHtyZXNwb25zZTogaHR0cCRJbmNvbWluZ01lc3NhZ2U7IGJvZHk6IHN0cmluZ30+IHtcbiAgICByZXR1cm4gbWFrZVJlcXVlc3QodXJpLCBvcHRpb25zLCAnREVMRVRFJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgbGltaXRlZCB2ZXJzaW9uIG9mIGByZXF1aXJlKCdyZXF1ZXN0JykuZ2V0KClgIHNvIHdlIGhhdmUgYSBiYXNpYyBQcm9taXNlLWJhc2VkIEFQSVxuICAgKiBmb3IgbWFraW5nIEdFVCByZXF1ZXN0cy5cbiAgICpcbiAgICogQ3VycmVudGx5IG5hbWVkIFwiZG9HZXRcIiBiZWNhdXNlIFwiZ2V0XCIgd2FzIGNyZWF0ZWQgZmlyc3QuIFdlIHByb2JhYmx5IHdhbnQgdG8gcmVwbGFjZSBhbGxcbiAgICogZXhpc3RpbmcgdXNlcyBvZiBcImdldFwiLCByZXBsYWNlIHRoZW0gd2l0aCBcImRvR2V0KClcIiwgYW5kIHRoZW4gcmVuYW1lIFwiZG9HZXQoKVwiIHRvIFwiZ2V0KClcIi5cbiAgICogVGhlIGltcGxlbWVudGF0aW9uIG9mIFwiZG9HZXRcIiBpcyBzaW1wbGVyLCBmb2xsb3dzIHJlZGlyZWN0cywgYW5kIGhhcyBtb3JlIGZlYXR1cmVzIHRoYW4gXCJnZXRcIi5cbiAgICpcbiAgICogVGhlIG1ham9yIGRvd25zaWRlIG9mIHVzaW5nIHJlcXVlc3QgaW5zdGVhZCBvZiBvdXIgaGFuZC1yb2xsZWQgaW1wbGVtZW50YXRpb24gaXMgdGhhdCBpdCBoYXNcbiAgICogYSBsb3Qgb2YgZGVwZW5kZW5jaWVzIG9mIGl0cyBvd24uXG4gICAqL1xuICBkb0dldChcbiAgICB1cmk6IHN0cmluZyxcbiAgICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyxcbiAgKTogUHJvbWlzZTx7cmVzcG9uc2U6IGh0dHAkSW5jb21pbmdNZXNzYWdlOyBib2R5OiBzdHJpbmd9PiB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KHVyaSwgb3B0aW9ucywgJ0dFVCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIGxpbWl0ZWQgdmVyc2lvbiBvZiBgcmVxdWlyZSgncmVxdWVzdCcpLmhlYWQoKWAgc28gd2UgaGF2ZSBhIGJhc2ljIFByb21pc2UtYmFzZWQgQVBJXG4gICAqIGZvciBtYWtpbmcgSEVBRCByZXF1ZXN0cy5cbiAgICovXG4gIGhlYWQoXG4gICAgdXJpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMsXG4gICk6IFByb21pc2U8e3Jlc3BvbnNlOiBodHRwJEluY29taW5nTWVzc2FnZTsgYm9keTogc3RyaW5nfT4ge1xuICAgIHJldHVybiBtYWtlUmVxdWVzdCh1cmksIG9wdGlvbnMsICdIRUFEJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgbGltaXRlZCB2ZXJzaW9uIG9mIGByZXF1aXJlKCdyZXF1ZXN0JykucGF0Y2goKWAgc28gd2UgaGF2ZSBhIGJhc2ljIFByb21pc2UtYmFzZWQgQVBJXG4gICAqIGZvciBtYWtpbmcgUEFUQ0ggcmVxdWVzdHMuXG4gICAqL1xuICBwYXRjaChcbiAgICB1cmk6IHN0cmluZyxcbiAgICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyxcbiAgKTogUHJvbWlzZTx7cmVzcG9uc2U6IGh0dHAkSW5jb21pbmdNZXNzYWdlOyBib2R5OiBzdHJpbmd9PiB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KHVyaSwgb3B0aW9ucywgJ1BBVENIJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgbGltaXRlZCB2ZXJzaW9uIG9mIGByZXF1aXJlKCdyZXF1ZXN0JykucG9zdCgpYCBzbyB3ZSBoYXZlIGEgYmFzaWMgUHJvbWlzZS1iYXNlZCBBUElcbiAgICogZm9yIG1ha2luZyBQT1NUIHJlcXVlc3RzLlxuICAgKi9cbiAgcG9zdChcbiAgICB1cmk6IHN0cmluZyxcbiAgICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyxcbiAgKTogUHJvbWlzZTx7cmVzcG9uc2U6IGh0dHAkSW5jb21pbmdNZXNzYWdlOyBib2R5OiBzdHJpbmd9PiB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KHVyaSwgb3B0aW9ucywgJ1BPU1QnKTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvdmlkZXMgYSBsaW1pdGVkIHZlcnNpb24gb2YgYHJlcXVpcmUoJ3JlcXVlc3QnKS5wdXQoKWAgc28gd2UgaGF2ZSBhIGJhc2ljIFByb21pc2UtYmFzZWQgQVBJXG4gICAqIGZvciBtYWtpbmcgUFVUIHJlcXVlc3RzLlxuICAgKi9cbiAgcHV0KFxuICAgIHVyaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zLFxuICApOiBQcm9taXNlPHtyZXNwb25zZTogaHR0cCRJbmNvbWluZ01lc3NhZ2U7IGJvZHk6IHN0cmluZ30+IHtcbiAgICByZXR1cm4gbWFrZVJlcXVlc3QodXJpLCBvcHRpb25zLCAnUFVUJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNlbmQgSHR0cChzKSBHRVQgcmVxdWVzdCB0byBnaXZlbiB1cmwgYW5kIHNhdmUgdGhlIGJvZHkgdG8gZGVzdCBmaWxlLlxuICAgKi9cbiAgZG93bmxvYWQodXJsOiBzdHJpbmcsIGRlc3Q6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCk7XG4gICAgICBnZXRQcm90b2NvbE1vZHVsZSh1cmwpLmdldCh1cmwsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAzMDApIHtcbiAgICAgICAgICByZWplY3QoYEJhZCBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXNDb2RlfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3BvbnNlLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICAgICAgcmVzcG9uc2UucGlwZShmaWxlKTtcbiAgICAgICAgICBmaWxlLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICAgICAgZmlsZS5vbignZmluaXNoJywgKCkgPT4gZmlsZS5jbG9zZShyZXNvbHZlKSk7XG4gICAgICAgIH1cbiAgICAgIH0pLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSk7XG4gIH0sXG59O1xuXG4vKipcbiAqIE1ha2VzIGEgcmVxdWVzdCB1c2luZyB0aGUgW2ByZXF1ZXN0YF0oaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcmVxdWVzdCkgbW9kdWxlLFxuICogd2hpY2ggZm9sbG93cyByZWRpcmVjdHMgYW5kIHRha2VzIGNhcmUgb2YgaHR0cCB2cy4gaHR0cHMgYnkgZGVmYXVsdC5cbiAqL1xuZnVuY3Rpb24gbWFrZVJlcXVlc3QoXG4gIHVyaTogc3RyaW5nLFxuICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyxcbiAgbWV0aG9kOiBzdHJpbmcsXG4pOiBQcm9taXNlPHtyZXNwb25zZTogaHR0cCRJbmNvbWluZ01lc3NhZ2U7IGJvZHk6IHN0cmluZ30+IHtcbiAgaWYgKG9wdGlvbnMubWV0aG9kICE9PSBtZXRob2QpIHtcbiAgICBvcHRpb25zID0gey4uLm9wdGlvbnN9O1xuICAgIG9wdGlvbnMubWV0aG9kID0gbWV0aG9kO1xuICB9XG4gIGNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmVxdWVzdCh1cmksIG9wdGlvbnMsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcbiAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKHtyZXNwb25zZSwgYm9keX0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cbiJdfQ==