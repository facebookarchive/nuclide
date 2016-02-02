

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
    return new Promise(function (resolve, reject) {
      var body = '';
      var options = require('url').parse(url);
      if (!options.hostname) {
        reject(new Error('Unable to determine the domain name of ' + url));
      }
      if (headers) {
        options.headers = headers;
      }
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
//# sourceMappingURL=data:application/json;base64,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QyxVQUFNLElBQUksR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsdUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFDLFFBQVEsRUFBSztBQUM1QyxZQUFJLFFBQVEsQ0FBQyxVQUFVLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxVQUFVLElBQUksR0FBRyxFQUFFO0FBQzNELGdCQUFNLGlCQUFlLFFBQVEsQ0FBQyxVQUFVLENBQUcsQ0FBQztTQUM3QyxNQUFNO0FBQ0wsa0JBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLGtCQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BCLGNBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3pCLGNBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO21CQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1dBQUEsQ0FBQyxDQUFDO1NBQzlDO09BQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDeEIsQ0FBQyxDQUFDO0dBQ0o7Q0FDRixDQUFDIiwiZmlsZSI6Imh0dHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xuY29uc3QgaHR0cHMgPSByZXF1aXJlKCdodHRwcycpO1xuXG4vLyBBbHRob3VnaCByZmMgZm9yYmlkcyB0aGUgdXNhZ2Ugb2Ygd2hpdGUgc3BhY2UgaW4gY29udGVudCB0eXBlXG4vLyAoaHR0cDovL3d3dy53My5vcmcvUHJvdG9jb2xzL3JmYzI2MTYvcmZjMjYxNi1zZWMzLmh0bWwjc2VjMy43KSwgaXQncyBzdGlsbFxuLy8gYSBjb21tb24gcHJhY3RpY2UgdG8gdXNlIHRoYXQgc28gd2UgbmVlZCB0byBkZWFsIHdpdGggaXQgaW4gcmVnZXguXG5jb25zdCBjb250ZW50VHlwZVJlID0gL1xccypcXHcrXFwvXFx3K1xccyo7XFxzKmNoYXJzZXRcXHMqPVxccyooW15cXHNdKylcXHMqLztcblxuZnVuY3Rpb24gZ2V0UHJvdG9jb2xNb2R1bGUodXJsOiBzdHJpbmcpOiBhbnkge1xuICBjb25zdCB7cHJvdG9jb2x9ID0gcmVxdWlyZSgndXJsJykucGFyc2UodXJsKTtcbiAgaWYgKHByb3RvY29sID09PSAnaHR0cDonKSB7XG4gICAgcmV0dXJuIGh0dHA7XG4gIH0gZWxzZSBpZiAocHJvdG9jb2wgPT09ICdodHRwczonKSB7XG4gICAgcmV0dXJuIGh0dHBzO1xuICB9IGVsc2Uge1xuICAgIHRocm93IEVycm9yKGBQcm90b2NvbCAke3Byb3RvY29sfSBub3Qgc3VwcG9ydGVkYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmVzcG9uc2VCb2R5Q2hhcnNldChyZXNwb25zZTogYW55KTogP3N0cmluZyB7XG4gIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVyc1snY29udGVudC10eXBlJ107XG4gIGlmICghY29udGVudFR5cGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBtYXRjaCA9IGNvbnRlbnRUeXBlUmUuZXhlYyhjb250ZW50VHlwZSk7XG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLyoqXG4gICAqIFNlbmQgSHR0cChzKSBHRVQgcmVxdWVzdCB0byBnaXZlbiB1cmwgYW5kIHJldHVybiB0aGUgYm9keSBhcyBzdHJpbmcuXG4gICAqL1xuICBnZXQodXJsOiBzdHJpbmcsIGhlYWRlcnM6ID9PYmplY3QpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgY29uc3Qgb3B0aW9uczogT2JqZWN0ID0gcmVxdWlyZSgndXJsJykucGFyc2UodXJsKTtcbiAgICAgIGlmICghb3B0aW9ucy5ob3N0bmFtZSkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGBVbmFibGUgdG8gZGV0ZXJtaW5lIHRoZSBkb21haW4gbmFtZSBvZiAke3VybH1gKSk7XG4gICAgICB9XG4gICAgICBpZiAoaGVhZGVycykge1xuICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgICAgfVxuICAgICAgZ2V0UHJvdG9jb2xNb2R1bGUodXJsKS5nZXQob3B0aW9ucywgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMzAwKSB7XG4gICAgICAgICAgcmVqZWN0KGBCYWQgc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjaGFyc2V0ID0gZ2V0UmVzcG9uc2VCb2R5Q2hhcnNldChyZXNwb25zZSk7XG4gICAgICAgICAgaWYgKGNoYXJzZXQpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLnNldEVuY29kaW5nKGNoYXJzZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNwb25zZS5vbignZGF0YScsIGRhdGEgPT4gYm9keSArPSBkYXRhKTtcbiAgICAgICAgICByZXNwb25zZS5vbignZW5kJywgKCkgPT4gcmVzb2x2ZShib2R5KSk7XG4gICAgICAgIH1cbiAgICAgIH0pLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNlbmQgSHR0cChzKSBHRVQgcmVxdWVzdCB0byBnaXZlbiB1cmwgYW5kIHNhdmUgdGhlIGJvZHkgdG8gZGVzdCBmaWxlLlxuICAgKi9cbiAgZG93bmxvYWQodXJsOiBzdHJpbmcsIGRlc3Q6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCk7XG4gICAgICBnZXRQcm90b2NvbE1vZHVsZSh1cmwpLmdldCh1cmwsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICAgIHJlamVjdChgQmFkIHN0YXR1cyAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzcG9uc2Uub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICByZXNwb25zZS5waXBlKGZpbGUpO1xuICAgICAgICAgIGZpbGUub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgICBmaWxlLm9uKCdmaW5pc2gnLCAoKSA9PiBmaWxlLmNsb3NlKHJlc29sdmUpKTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB9KTtcbiAgfSxcbn07XG4iXX0=