Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var request = require('request');
var MAX_REQUEST_LENGTH = 1e6;

/**
 * Promisified version of the request function:
 * https://www.npmjs.com/package/request#requestoptions-callback
 * Defaults to using the node's querystring module to encode the url query parameters.
 * If you want to use the npm's qs module to encode the query parameters, explicitly provide
 * the option:
 * {useQuerystring: false}
 */
function asyncRequest(options) {
  return new Promise(function (resolve, reject) {
    if (options.useQuerystring === undefined) {
      options.useQuerystring = true;
    }
    // TODO(t8118670): This can cause an uncaught exception.
    // Likely requires a fix to 'request'.
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode >= 300) {
        var errorJson = body;
        if (typeof body !== 'object') {
          try {
            errorJson = JSON.parse(body);
          } catch (e) {
            // 404 responses aren't currently JSON.
            errorJson = { message: body };
          }
        }
        // Cast to Object for use of code field below...
        var err = new Error(errorJson.message);
        // Success http status codes range from 200 to 299.
        err.code = errorJson.code || response.statusCode;
        reject(err);
      } else {
        resolve({ body: body, response: response });
      }
    });
  });
}

/**
 * Write a text or convert to text response with an optional status code.
 */
function sendTextResponse(response, text, statusCode) {
  if (typeof statusCode === 'number') {
    response.statusCode = statusCode;
  }
  response.write(text || '');
  response.end();
}

/**
 * Write a json response text with an optional status code.
 */
function sendJsonResponse(response, json, statusCode) {
  response.setHeader('Content-Type', 'application/json');
  sendTextResponse(response, JSON.stringify(json), statusCode);
}

/**
  * Parses the request body in an anyc/promise way
  */
function parseRequestBody(httpRequest, isJson) {
  return new Promise(function (resolve, reject) {
    var body = '';
    httpRequest.on('data', function (data) {
      body += data;
      // too much POST data, kill the connection!
      if (body.length > MAX_REQUEST_LENGTH) {
        reject(new Error('body is too big'));
        httpRequest.connection.destroy();
      }
    });
    httpRequest.on('end', function () {
      return resolve(isJson ? JSON.parse(body) : body);
    });
  });
}

/**
 * Parses the url parameters ?abc=erf&lol=432c
 */
function getQueryParameters(requestUrl) {
  var components = _url2['default'].parse(requestUrl, true);
  (0, _assert2['default'])(components != null);
  var query = components.query;

  return query;
}

/**
 * Serializes the method arguments to args and argTypes arrays
 * to send the metadata about the argument types with the data
 * to help the server understand and parse it.
 */
function serializeArgs(args) {
  var argsOnHttp = [];
  var argTypes = [];
  args.forEach(function (arg) {
    // I do this because nulls are normally sent as empty strings
    if (arg === undefined) {
      argsOnHttp.push('');
      argTypes.push('undefined');
    } else if (typeof arg === 'string') {
      argsOnHttp.push(arg);
      argTypes.push('string');
    } else {
      // object, number, boolean null
      argsOnHttp.push(JSON.stringify(arg));
      argTypes.push('object');
    }
  });
  return {
    args: argsOnHttp,
    argTypes: argTypes
  };
}

/**
 * Deserializes a url with query parameters: args, argTypes to an array
 * of the original arguments of the same types the client called the function with.
 */
function deserializeArgs(requestUrl) {
  var _getQueryParameters = getQueryParameters(requestUrl);

  var args = _getQueryParameters.args;
  var argTypes = _getQueryParameters.argTypes;

  args = args || [];
  argTypes = argTypes || [];
  var argsArray = Array.isArray(args) ? args : [args];
  var argTypesArray = Array.isArray(argTypes) ? argTypes : [argTypes];
  return argsArray.map(function (arg, i) {
    // I do this because nulls are normally sent as empty strings.
    if (argTypesArray[i] === 'undefined') {
      return undefined;
    } else if (argTypesArray[i] === 'string') {
      return arg;
    } else {
      // some methods have options object arguments.
      return JSON.parse(arg);
    }
  });
}

module.exports = {
  asyncRequest: asyncRequest,
  deserializeArgs: deserializeArgs,
  getQueryParameters: getQueryParameters,
  parseRequestBody: parseRequestBody,
  sendJsonResponse: sendJsonResponse,
  sendTextResponse: sendTextResponse,
  serializeArgs: serializeArgs
};
//# sourceMappingURL=data:application/json;base64,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dXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XG5jb25zdCBNQVhfUkVRVUVTVF9MRU5HVEggPSAxZTY7XG5cbnR5cGUgSHR0cFJlc3BvbnNlID0ge1xuICBzdGF0dXNDb2RlOiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgUmVzcG9uc2VCb2R5ID0ge2JvZHk6IHN0cmluZzsgcmVzcG9uc2U6IEh0dHBSZXNwb25zZX07XG50eXBlIFF1ZXJ5UGFyYW1zID0ge1trZXk6c3RyaW5nXTogYW55fTtcbnR5cGUgU2VyaWFsaXplZEFyZ3VtZW50cyA9IHthcmdzOiBBcnJheTxzdHJpbmc+OyBhcmdUeXBlczogQXJyYXk8c3RyaW5nPn07XG5cbmV4cG9ydCB0eXBlIFJlcXVlc3RPcHRpb25zID0ge1xuICB1cmk6IHN0cmluZztcbiAgYWdlbnRPcHRpb25zPzoge1xuICAgIGNhOiBCdWZmZXI7XG4gICAga2V5OiBCdWZmZXI7XG4gICAgY2VydDogQnVmZmVyO1xuICB9O1xuICB1c2VRdWVyeXN0cmluZz86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIFByb21pc2lmaWVkIHZlcnNpb24gb2YgdGhlIHJlcXVlc3QgZnVuY3Rpb246XG4gKiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9yZXF1ZXN0I3JlcXVlc3RvcHRpb25zLWNhbGxiYWNrXG4gKiBEZWZhdWx0cyB0byB1c2luZyB0aGUgbm9kZSdzIHF1ZXJ5c3RyaW5nIG1vZHVsZSB0byBlbmNvZGUgdGhlIHVybCBxdWVyeSBwYXJhbWV0ZXJzLlxuICogSWYgeW91IHdhbnQgdG8gdXNlIHRoZSBucG0ncyBxcyBtb2R1bGUgdG8gZW5jb2RlIHRoZSBxdWVyeSBwYXJhbWV0ZXJzLCBleHBsaWNpdGx5IHByb3ZpZGVcbiAqIHRoZSBvcHRpb246XG4gKiB7dXNlUXVlcnlzdHJpbmc6IGZhbHNlfVxuICovXG5mdW5jdGlvbiBhc3luY1JlcXVlc3Qob3B0aW9uczogUmVxdWVzdE9wdGlvbnMpOiBQcm9taXNlPFJlc3BvbnNlQm9keT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmIChvcHRpb25zLnVzZVF1ZXJ5c3RyaW5nID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdGlvbnMudXNlUXVlcnlzdHJpbmcgPSB0cnVlO1xuICAgIH1cbiAgICAvLyBUT0RPKHQ4MTE4NjcwKTogVGhpcyBjYW4gY2F1c2UgYW4gdW5jYXVnaHQgZXhjZXB0aW9uLlxuICAgIC8vIExpa2VseSByZXF1aXJlcyBhIGZpeCB0byAncmVxdWVzdCcuXG4gICAgcmVxdWVzdChvcHRpb25zLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICBsZXQgZXJyb3JKc29uID0gYm9keTtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlcnJvckpzb24gPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIDQwNCByZXNwb25zZXMgYXJlbid0IGN1cnJlbnRseSBKU09OLlxuICAgICAgICAgICAgZXJyb3JKc29uID0ge21lc3NhZ2U6IGJvZHl9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDYXN0IHRvIE9iamVjdCBmb3IgdXNlIG9mIGNvZGUgZmllbGQgYmVsb3cuLi5cbiAgICAgICAgY29uc3QgZXJyOiBPYmplY3QgPSBuZXcgRXJyb3IoZXJyb3JKc29uLm1lc3NhZ2UpO1xuICAgICAgICAvLyBTdWNjZXNzIGh0dHAgc3RhdHVzIGNvZGVzIHJhbmdlIGZyb20gMjAwIHRvIDI5OS5cbiAgICAgICAgZXJyLmNvZGUgPSBlcnJvckpzb24uY29kZSB8fCByZXNwb25zZS5zdGF0dXNDb2RlO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoe2JvZHksIHJlc3BvbnNlfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFdyaXRlIGEgdGV4dCBvciBjb252ZXJ0IHRvIHRleHQgcmVzcG9uc2Ugd2l0aCBhbiBvcHRpb25hbCBzdGF0dXMgY29kZS5cbiAqL1xuZnVuY3Rpb24gc2VuZFRleHRSZXNwb25zZShyZXNwb25zZTogaHR0cCRmaXhlZCRTZXJ2ZXJSZXNwb25zZSwgdGV4dDogYW55LCBzdGF0dXNDb2RlOiA/bnVtYmVyKTpcbiAgICB2b2lkIHtcbiAgaWYgKHR5cGVvZiBzdGF0dXNDb2RlID09PSAnbnVtYmVyJykge1xuICAgIHJlc3BvbnNlLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICB9XG4gIHJlc3BvbnNlLndyaXRlKHRleHQgfHwgJycpO1xuICByZXNwb25zZS5lbmQoKTtcbn1cblxuLyoqXG4gKiBXcml0ZSBhIGpzb24gcmVzcG9uc2UgdGV4dCB3aXRoIGFuIG9wdGlvbmFsIHN0YXR1cyBjb2RlLlxuICovXG5mdW5jdGlvbiBzZW5kSnNvblJlc3BvbnNlKHJlc3BvbnNlOiBodHRwJGZpeGVkJFNlcnZlclJlc3BvbnNlLCBqc29uOiBhbnksIHN0YXR1c0NvZGU6ID9udW1iZXIpOlxuICAgIHZvaWQge1xuICByZXNwb25zZS5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIHNlbmRUZXh0UmVzcG9uc2UocmVzcG9uc2UsIEpTT04uc3RyaW5naWZ5KGpzb24pLCBzdGF0dXNDb2RlKTtcbn1cblxuLyoqXG4gICogUGFyc2VzIHRoZSByZXF1ZXN0IGJvZHkgaW4gYW4gYW55Yy9wcm9taXNlIHdheVxuICAqL1xuZnVuY3Rpb24gcGFyc2VSZXF1ZXN0Qm9keShodHRwUmVxdWVzdDogaHR0cCRmaXhlZCRJbmNvbWluZ01lc3NhZ2UsIGlzSnNvbjogP2Jvb2xlYW4pOlxuICAgIFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGJvZHkgPSAnJztcbiAgICBodHRwUmVxdWVzdC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgYm9keSArPSBkYXRhO1xuICAgICAgLy8gdG9vIG11Y2ggUE9TVCBkYXRhLCBraWxsIHRoZSBjb25uZWN0aW9uIVxuICAgICAgaWYgKGJvZHkubGVuZ3RoID4gTUFYX1JFUVVFU1RfTEVOR1RIKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2JvZHkgaXMgdG9vIGJpZycpKTtcbiAgICAgICAgaHR0cFJlcXVlc3QuY29ubmVjdGlvbi5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaHR0cFJlcXVlc3Qub24oJ2VuZCcsICgpID0+IHJlc29sdmUoaXNKc29uID8gSlNPTi5wYXJzZShib2R5KSA6IGJvZHkpKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSB1cmwgcGFyYW1ldGVycyA/YWJjPWVyZiZsb2w9NDMyY1xuICovXG5mdW5jdGlvbiBnZXRRdWVyeVBhcmFtZXRlcnMocmVxdWVzdFVybDogc3RyaW5nKTogUXVlcnlQYXJhbXMge1xuICBjb25zdCBjb21wb25lbnRzOiA/T2JqZWN0ID0gdXJsLnBhcnNlKHJlcXVlc3RVcmwsIHRydWUpO1xuICBpbnZhcmlhbnQoY29tcG9uZW50cyAhPSBudWxsKTtcbiAgY29uc3Qge3F1ZXJ5fSA9IGNvbXBvbmVudHM7XG4gIHJldHVybiBxdWVyeTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIHRoZSBtZXRob2QgYXJndW1lbnRzIHRvIGFyZ3MgYW5kIGFyZ1R5cGVzIGFycmF5c1xuICogdG8gc2VuZCB0aGUgbWV0YWRhdGEgYWJvdXQgdGhlIGFyZ3VtZW50IHR5cGVzIHdpdGggdGhlIGRhdGFcbiAqIHRvIGhlbHAgdGhlIHNlcnZlciB1bmRlcnN0YW5kIGFuZCBwYXJzZSBpdC5cbiAqL1xuZnVuY3Rpb24gc2VyaWFsaXplQXJncyhhcmdzOiBBcnJheTxhbnk+KTogU2VyaWFsaXplZEFyZ3VtZW50cyB7XG4gIGNvbnN0IGFyZ3NPbkh0dHAgPSBbXTtcbiAgY29uc3QgYXJnVHlwZXMgPSBbXTtcbiAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uKGFyZykge1xuICAgIC8vIEkgZG8gdGhpcyBiZWNhdXNlIG51bGxzIGFyZSBub3JtYWxseSBzZW50IGFzIGVtcHR5IHN0cmluZ3NcbiAgICBpZiAoYXJnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3NPbkh0dHAucHVzaCgnJyk7XG4gICAgICBhcmdUeXBlcy5wdXNoKCd1bmRlZmluZWQnKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBhcmdzT25IdHRwLnB1c2goYXJnKTtcbiAgICAgIGFyZ1R5cGVzLnB1c2goJ3N0cmluZycpO1xuICAgIH0gZWxzZSB7IC8vIG9iamVjdCwgbnVtYmVyLCBib29sZWFuIG51bGxcbiAgICAgIGFyZ3NPbkh0dHAucHVzaChKU09OLnN0cmluZ2lmeShhcmcpKTtcbiAgICAgIGFyZ1R5cGVzLnB1c2goJ29iamVjdCcpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB7XG4gICAgYXJnczogYXJnc09uSHR0cCxcbiAgICBhcmdUeXBlcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBEZXNlcmlhbGl6ZXMgYSB1cmwgd2l0aCBxdWVyeSBwYXJhbWV0ZXJzOiBhcmdzLCBhcmdUeXBlcyB0byBhbiBhcnJheVxuICogb2YgdGhlIG9yaWdpbmFsIGFyZ3VtZW50cyBvZiB0aGUgc2FtZSB0eXBlcyB0aGUgY2xpZW50IGNhbGxlZCB0aGUgZnVuY3Rpb24gd2l0aC5cbiAqL1xuZnVuY3Rpb24gZGVzZXJpYWxpemVBcmdzKHJlcXVlc3RVcmw6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICBsZXQge2FyZ3MsIGFyZ1R5cGVzfSA9IGdldFF1ZXJ5UGFyYW1ldGVycyhyZXF1ZXN0VXJsKTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIGFyZ1R5cGVzID0gYXJnVHlwZXMgfHwgW107XG4gIGNvbnN0IGFyZ3NBcnJheSA9IEFycmF5LmlzQXJyYXkoYXJncykgPyBhcmdzIDogW2FyZ3NdO1xuICBjb25zdCBhcmdUeXBlc0FycmF5ID0gQXJyYXkuaXNBcnJheShhcmdUeXBlcykgPyBhcmdUeXBlcyA6IFthcmdUeXBlc107XG4gIHJldHVybiBhcmdzQXJyYXkubWFwKGZ1bmN0aW9uKGFyZywgaSkge1xuICAgIC8vIEkgZG8gdGhpcyBiZWNhdXNlIG51bGxzIGFyZSBub3JtYWxseSBzZW50IGFzIGVtcHR5IHN0cmluZ3MuXG4gICAgaWYgKGFyZ1R5cGVzQXJyYXlbaV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoYXJnVHlwZXNBcnJheVtpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNvbWUgbWV0aG9kcyBoYXZlIG9wdGlvbnMgb2JqZWN0IGFyZ3VtZW50cy5cbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGFyZyk7XG4gICAgfVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jUmVxdWVzdCxcbiAgZGVzZXJpYWxpemVBcmdzLFxuICBnZXRRdWVyeVBhcmFtZXRlcnMsXG4gIHBhcnNlUmVxdWVzdEJvZHksXG4gIHNlbmRKc29uUmVzcG9uc2UsXG4gIHNlbmRUZXh0UmVzcG9uc2UsXG4gIHNlcmlhbGl6ZUFyZ3MsXG59O1xuIl19