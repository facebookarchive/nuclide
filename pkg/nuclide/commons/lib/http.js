

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var http = require('http');
var https = require('https');

// Although rfc forbids the usage of white space in content type
// (http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7), it's still
// a common practice to use that so we need to deal with it in regex.
var contentTypeRe = /\s*\w+\/\w+\s*;\s*charset\s*=\s*([^\s]+)\s*/;

function getProtocolModule(url) {
  var _require$parse = require('url').parse(url);

  var protocol = _require$parse.protocol;

  if (protocol === 'http:') {
    return http;
  } else if (protocol === 'https:') {
    return https;
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
   * Send Http(s) GET request to given url and save the body to dest file.
   */
  download: function download(url, dest) {
    return new Promise(function (resolve, reject) {
      var file = fs.createWriteStream(dest);
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
//# sourceMappingURL=data:application/json;base64,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QUFZLEVBQWlCO0FBQ2pELFdBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLFVBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4Qyx1QkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQUEsUUFBUSxFQUFJO0FBQzFDLFlBQUksUUFBUSxDQUFDLFVBQVUsR0FBRyxHQUFHLElBQUksUUFBUSxDQUFDLFVBQVUsSUFBSSxHQUFHLEVBQUU7QUFDM0QsZ0JBQU0saUJBQWUsUUFBUSxDQUFDLFVBQVUsQ0FBRyxDQUFDO1NBQzdDLE1BQU07QUFDTCxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0Isa0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsY0FBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDekIsY0FBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7bUJBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7V0FBQSxDQUFDLENBQUM7U0FDOUM7T0FDRixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN4QixDQUFDLENBQUM7R0FDSjtDQUNGLENBQUMiLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG5jb25zdCBodHRwcyA9IHJlcXVpcmUoJ2h0dHBzJyk7XG5cbi8vIEFsdGhvdWdoIHJmYyBmb3JiaWRzIHRoZSB1c2FnZSBvZiB3aGl0ZSBzcGFjZSBpbiBjb250ZW50IHR5cGVcbi8vIChodHRwOi8vd3d3LnczLm9yZy9Qcm90b2NvbHMvcmZjMjYxNi9yZmMyNjE2LXNlYzMuaHRtbCNzZWMzLjcpLCBpdCdzIHN0aWxsXG4vLyBhIGNvbW1vbiBwcmFjdGljZSB0byB1c2UgdGhhdCBzbyB3ZSBuZWVkIHRvIGRlYWwgd2l0aCBpdCBpbiByZWdleC5cbmNvbnN0IGNvbnRlbnRUeXBlUmUgPSAvXFxzKlxcdytcXC9cXHcrXFxzKjtcXHMqY2hhcnNldFxccyo9XFxzKihbXlxcc10rKVxccyovO1xuXG5mdW5jdGlvbiBnZXRQcm90b2NvbE1vZHVsZSh1cmw6IHN0cmluZyk6IGFueSB7XG4gIGNvbnN0IHtwcm90b2NvbH0gPSByZXF1aXJlKCd1cmwnKS5wYXJzZSh1cmwpO1xuICBpZiAocHJvdG9jb2wgPT09ICdodHRwOicpIHtcbiAgICByZXR1cm4gaHR0cDtcbiAgfSBlbHNlIGlmIChwcm90b2NvbCA9PT0gJ2h0dHBzOicpIHtcbiAgICByZXR1cm4gaHR0cHM7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgRXJyb3IoYFByb3RvY29sICR7cHJvdG9jb2x9IG5vdCBzdXBwb3J0ZWRgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRSZXNwb25zZUJvZHlDaGFyc2V0KHJlc3BvbnNlOiBhbnkpOiA/c3RyaW5nIHtcbiAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzWydjb250ZW50LXR5cGUnXTtcbiAgaWYgKCFjb250ZW50VHlwZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IG1hdGNoID0gY29udGVudFR5cGVSZS5leGVjKGNvbnRlbnRUeXBlKTtcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogU2VuZCBIdHRwKHMpIEdFVCByZXF1ZXN0IHRvIGdpdmVuIHVybCBhbmQgcmV0dXJuIHRoZSBib2R5IGFzIHN0cmluZy5cbiAgICovXG4gIGdldCh1cmw6IHN0cmluZywgaGVhZGVyczogP09iamVjdCwgcmVqZWN0VW5hdXRob3JpemVkOiBib29sID0gdHJ1ZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBib2R5ID0gJyc7XG4gICAgICBjb25zdCBvcHRpb25zOiBPYmplY3QgPSByZXF1aXJlKCd1cmwnKS5wYXJzZSh1cmwpO1xuICAgICAgaWYgKCFvcHRpb25zLmhvc3RuYW1lKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIGRvbWFpbiBuYW1lIG9mICR7dXJsfWApKTtcbiAgICAgIH1cbiAgICAgIGlmIChoZWFkZXJzKSB7XG4gICAgICAgIG9wdGlvbnMuaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgICB9XG4gICAgICBvcHRpb25zLnJlamVjdFVuYXV0aG9yaXplZCA9IHJlamVjdFVuYXV0aG9yaXplZDtcbiAgICAgIGdldFByb3RvY29sTW9kdWxlKHVybCkuZ2V0KG9wdGlvbnMsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAzMDApIHtcbiAgICAgICAgICByZWplY3QoYEJhZCBzdGF0dXMgJHtyZXNwb25zZS5zdGF0dXNDb2RlfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGNoYXJzZXQgPSBnZXRSZXNwb25zZUJvZHlDaGFyc2V0KHJlc3BvbnNlKTtcbiAgICAgICAgICBpZiAoY2hhcnNldCkge1xuICAgICAgICAgICAgcmVzcG9uc2Uuc2V0RW5jb2RpbmcoY2hhcnNldCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3BvbnNlLm9uKCdkYXRhJywgZGF0YSA9PiBib2R5ICs9IGRhdGEpO1xuICAgICAgICAgIHJlc3BvbnNlLm9uKCdlbmQnLCAoKSA9PiByZXNvbHZlKGJvZHkpKTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogU2VuZCBIdHRwKHMpIEdFVCByZXF1ZXN0IHRvIGdpdmVuIHVybCBhbmQgc2F2ZSB0aGUgYm9keSB0byBkZXN0IGZpbGUuXG4gICAqL1xuICBkb3dubG9hZCh1cmw6IHN0cmluZywgZGVzdDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0KTtcbiAgICAgIGdldFByb3RvY29sTW9kdWxlKHVybCkuZ2V0KHVybCwgcmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICAgIHJlamVjdChgQmFkIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzcG9uc2Uub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICByZXNwb25zZS5waXBlKGZpbGUpO1xuICAgICAgICAgIGZpbGUub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICBmaWxlLm9uKCdmaW5pc2gnLCAoKSA9PiBmaWxlLmNsb3NlKHJlc29sdmUpKTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfSxcbn07XG4iXX0=