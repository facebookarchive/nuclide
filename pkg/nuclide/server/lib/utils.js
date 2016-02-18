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
//# sourceMappingURL=data:application/json;base64,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Y2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5jb25zdCByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xuY29uc3QgTUFYX1JFUVVFU1RfTEVOR1RIID0gMWU2O1xuXG50eXBlIEh0dHBSZXNwb25zZSA9IHtcbiAgc3RhdHVzQ29kZTogbnVtYmVyLFxufTtcbmV4cG9ydCB0eXBlIFJlc3BvbnNlQm9keSA9IHtib2R5OiBzdHJpbmcsIHJlc3BvbnNlOiBIdHRwUmVzcG9uc2V9O1xudHlwZSBRdWVyeVBhcmFtcyA9IHtba2V5OnN0cmluZ106IGFueX07XG50eXBlIFNlcmlhbGl6ZWRBcmd1bWVudHMgPSB7YXJnczogQXJyYXk8c3RyaW5nPiwgYXJnVHlwZXM6IEFycmF5PHN0cmluZz59O1xuXG5leHBvcnQgdHlwZSBSZXF1ZXN0T3B0aW9ucyA9IHtcbiAgdXJpOiBzdHJpbmcsXG4gIGFnZW50T3B0aW9ucz86IHtcbiAgICBjYTogQnVmZmVyLFxuICAgIGtleTogQnVmZmVyLFxuICAgIGNlcnQ6IEJ1ZmZlcixcbiAgfSxcbiAgdXNlUXVlcnlzdHJpbmc/OiBib29sZWFuLFxufTtcblxuLyoqXG4gKiBQcm9taXNpZmllZCB2ZXJzaW9uIG9mIHRoZSByZXF1ZXN0IGZ1bmN0aW9uOlxuICogaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcmVxdWVzdCNyZXF1ZXN0b3B0aW9ucy1jYWxsYmFja1xuICogRGVmYXVsdHMgdG8gdXNpbmcgdGhlIG5vZGUncyBxdWVyeXN0cmluZyBtb2R1bGUgdG8gZW5jb2RlIHRoZSB1cmwgcXVlcnkgcGFyYW1ldGVycy5cbiAqIElmIHlvdSB3YW50IHRvIHVzZSB0aGUgbnBtJ3MgcXMgbW9kdWxlIHRvIGVuY29kZSB0aGUgcXVlcnkgcGFyYW1ldGVycywgZXhwbGljaXRseSBwcm92aWRlXG4gKiB0aGUgb3B0aW9uOlxuICoge3VzZVF1ZXJ5c3RyaW5nOiBmYWxzZX1cbiAqL1xuZnVuY3Rpb24gYXN5bmNSZXF1ZXN0KG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKTogUHJvbWlzZTxSZXNwb25zZUJvZHk+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAob3B0aW9ucy51c2VRdWVyeXN0cmluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb25zLnVzZVF1ZXJ5c3RyaW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgcmVxdWVzdChvcHRpb25zLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICBsZXQgZXJyb3JKc29uID0gYm9keTtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlcnJvckpzb24gPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIDQwNCByZXNwb25zZXMgYXJlbid0IGN1cnJlbnRseSBKU09OLlxuICAgICAgICAgICAgZXJyb3JKc29uID0ge21lc3NhZ2U6IGJvZHl9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDYXN0IHRvIE9iamVjdCBmb3IgdXNlIG9mIGNvZGUgZmllbGQgYmVsb3cuLi5cbiAgICAgICAgY29uc3QgZXJyOiBPYmplY3QgPSBuZXcgRXJyb3IoZXJyb3JKc29uLm1lc3NhZ2UpO1xuICAgICAgICAvLyBTdWNjZXNzIGh0dHAgc3RhdHVzIGNvZGVzIHJhbmdlIGZyb20gMjAwIHRvIDI5OS5cbiAgICAgICAgZXJyLmNvZGUgPSBlcnJvckpzb24uY29kZSB8fCByZXNwb25zZS5zdGF0dXNDb2RlO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoe2JvZHksIHJlc3BvbnNlfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFdyaXRlIGEgdGV4dCBvciBjb252ZXJ0IHRvIHRleHQgcmVzcG9uc2Ugd2l0aCBhbiBvcHRpb25hbCBzdGF0dXMgY29kZS5cbiAqL1xuZnVuY3Rpb24gc2VuZFRleHRSZXNwb25zZShyZXNwb25zZTogaHR0cCRmaXhlZCRTZXJ2ZXJSZXNwb25zZSwgdGV4dDogYW55LCBzdGF0dXNDb2RlOiA/bnVtYmVyKTpcbiAgICB2b2lkIHtcbiAgaWYgKHR5cGVvZiBzdGF0dXNDb2RlID09PSAnbnVtYmVyJykge1xuICAgIHJlc3BvbnNlLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICB9XG4gIHJlc3BvbnNlLndyaXRlKHRleHQgfHwgJycpO1xuICByZXNwb25zZS5lbmQoKTtcbn1cblxuLyoqXG4gKiBXcml0ZSBhIGpzb24gcmVzcG9uc2UgdGV4dCB3aXRoIGFuIG9wdGlvbmFsIHN0YXR1cyBjb2RlLlxuICovXG5mdW5jdGlvbiBzZW5kSnNvblJlc3BvbnNlKHJlc3BvbnNlOiBodHRwJGZpeGVkJFNlcnZlclJlc3BvbnNlLCBqc29uOiBhbnksIHN0YXR1c0NvZGU6ID9udW1iZXIpOlxuICAgIHZvaWQge1xuICByZXNwb25zZS5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIHNlbmRUZXh0UmVzcG9uc2UocmVzcG9uc2UsIEpTT04uc3RyaW5naWZ5KGpzb24pLCBzdGF0dXNDb2RlKTtcbn1cblxuLyoqXG4gICogUGFyc2VzIHRoZSByZXF1ZXN0IGJvZHkgaW4gYW4gYW55Yy9wcm9taXNlIHdheVxuICAqL1xuZnVuY3Rpb24gcGFyc2VSZXF1ZXN0Qm9keShodHRwUmVxdWVzdDogaHR0cCRmaXhlZCRJbmNvbWluZ01lc3NhZ2UsIGlzSnNvbjogP2Jvb2xlYW4pOlxuICAgIFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGJvZHkgPSAnJztcbiAgICBodHRwUmVxdWVzdC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgYm9keSArPSBkYXRhO1xuICAgICAgLy8gdG9vIG11Y2ggUE9TVCBkYXRhLCBraWxsIHRoZSBjb25uZWN0aW9uIVxuICAgICAgaWYgKGJvZHkubGVuZ3RoID4gTUFYX1JFUVVFU1RfTEVOR1RIKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2JvZHkgaXMgdG9vIGJpZycpKTtcbiAgICAgICAgaHR0cFJlcXVlc3QuY29ubmVjdGlvbi5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaHR0cFJlcXVlc3Qub24oJ2VuZCcsICgpID0+IHJlc29sdmUoaXNKc29uID8gSlNPTi5wYXJzZShib2R5KSA6IGJvZHkpKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSB1cmwgcGFyYW1ldGVycyA/YWJjPWVyZiZsb2w9NDMyY1xuICovXG5mdW5jdGlvbiBnZXRRdWVyeVBhcmFtZXRlcnMocmVxdWVzdFVybDogc3RyaW5nKTogUXVlcnlQYXJhbXMge1xuICBjb25zdCBjb21wb25lbnRzOiA/T2JqZWN0ID0gdXJsLnBhcnNlKHJlcXVlc3RVcmwsIHRydWUpO1xuICBpbnZhcmlhbnQoY29tcG9uZW50cyAhPSBudWxsKTtcbiAgY29uc3Qge3F1ZXJ5fSA9IGNvbXBvbmVudHM7XG4gIHJldHVybiBxdWVyeTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIHRoZSBtZXRob2QgYXJndW1lbnRzIHRvIGFyZ3MgYW5kIGFyZ1R5cGVzIGFycmF5c1xuICogdG8gc2VuZCB0aGUgbWV0YWRhdGEgYWJvdXQgdGhlIGFyZ3VtZW50IHR5cGVzIHdpdGggdGhlIGRhdGFcbiAqIHRvIGhlbHAgdGhlIHNlcnZlciB1bmRlcnN0YW5kIGFuZCBwYXJzZSBpdC5cbiAqL1xuZnVuY3Rpb24gc2VyaWFsaXplQXJncyhhcmdzOiBBcnJheTxhbnk+KTogU2VyaWFsaXplZEFyZ3VtZW50cyB7XG4gIGNvbnN0IGFyZ3NPbkh0dHAgPSBbXTtcbiAgY29uc3QgYXJnVHlwZXMgPSBbXTtcbiAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uKGFyZykge1xuICAgIC8vIEkgZG8gdGhpcyBiZWNhdXNlIG51bGxzIGFyZSBub3JtYWxseSBzZW50IGFzIGVtcHR5IHN0cmluZ3NcbiAgICBpZiAoYXJnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3NPbkh0dHAucHVzaCgnJyk7XG4gICAgICBhcmdUeXBlcy5wdXNoKCd1bmRlZmluZWQnKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBhcmdzT25IdHRwLnB1c2goYXJnKTtcbiAgICAgIGFyZ1R5cGVzLnB1c2goJ3N0cmluZycpO1xuICAgIH0gZWxzZSB7IC8vIG9iamVjdCwgbnVtYmVyLCBib29sZWFuIG51bGxcbiAgICAgIGFyZ3NPbkh0dHAucHVzaChKU09OLnN0cmluZ2lmeShhcmcpKTtcbiAgICAgIGFyZ1R5cGVzLnB1c2goJ29iamVjdCcpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB7XG4gICAgYXJnczogYXJnc09uSHR0cCxcbiAgICBhcmdUeXBlcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBEZXNlcmlhbGl6ZXMgYSB1cmwgd2l0aCBxdWVyeSBwYXJhbWV0ZXJzOiBhcmdzLCBhcmdUeXBlcyB0byBhbiBhcnJheVxuICogb2YgdGhlIG9yaWdpbmFsIGFyZ3VtZW50cyBvZiB0aGUgc2FtZSB0eXBlcyB0aGUgY2xpZW50IGNhbGxlZCB0aGUgZnVuY3Rpb24gd2l0aC5cbiAqL1xuZnVuY3Rpb24gZGVzZXJpYWxpemVBcmdzKHJlcXVlc3RVcmw6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICBsZXQge2FyZ3MsIGFyZ1R5cGVzfSA9IGdldFF1ZXJ5UGFyYW1ldGVycyhyZXF1ZXN0VXJsKTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIGFyZ1R5cGVzID0gYXJnVHlwZXMgfHwgW107XG4gIGNvbnN0IGFyZ3NBcnJheSA9IEFycmF5LmlzQXJyYXkoYXJncykgPyBhcmdzIDogW2FyZ3NdO1xuICBjb25zdCBhcmdUeXBlc0FycmF5ID0gQXJyYXkuaXNBcnJheShhcmdUeXBlcykgPyBhcmdUeXBlcyA6IFthcmdUeXBlc107XG4gIHJldHVybiBhcmdzQXJyYXkubWFwKGZ1bmN0aW9uKGFyZywgaSkge1xuICAgIC8vIEkgZG8gdGhpcyBiZWNhdXNlIG51bGxzIGFyZSBub3JtYWxseSBzZW50IGFzIGVtcHR5IHN0cmluZ3MuXG4gICAgaWYgKGFyZ1R5cGVzQXJyYXlbaV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoYXJnVHlwZXNBcnJheVtpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNvbWUgbWV0aG9kcyBoYXZlIG9wdGlvbnMgb2JqZWN0IGFyZ3VtZW50cy5cbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGFyZyk7XG4gICAgfVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jUmVxdWVzdCxcbiAgZGVzZXJpYWxpemVBcmdzLFxuICBnZXRRdWVyeVBhcmFtZXRlcnMsXG4gIHBhcnNlUmVxdWVzdEJvZHksXG4gIHNlbmRKc29uUmVzcG9uc2UsXG4gIHNlbmRUZXh0UmVzcG9uc2UsXG4gIHNlcmlhbGl6ZUFyZ3MsXG59O1xuIl19