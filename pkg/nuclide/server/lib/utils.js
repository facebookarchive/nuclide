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
//# sourceMappingURL=data:application/json;base64,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Y2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5jb25zdCByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpO1xuY29uc3QgTUFYX1JFUVVFU1RfTEVOR1RIID0gMWU2O1xuXG50eXBlIEh0dHBSZXNwb25zZSA9IHtcbiAgc3RhdHVzQ29kZTogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIFJlc3BvbnNlQm9keSA9IHtib2R5OiBzdHJpbmc7IHJlc3BvbnNlOiBIdHRwUmVzcG9uc2V9O1xudHlwZSBRdWVyeVBhcmFtcyA9IHtba2V5OnN0cmluZ106IGFueX07XG50eXBlIFNlcmlhbGl6ZWRBcmd1bWVudHMgPSB7YXJnczogQXJyYXk8c3RyaW5nPjsgYXJnVHlwZXM6IEFycmF5PHN0cmluZz59O1xuXG5leHBvcnQgdHlwZSBSZXF1ZXN0T3B0aW9ucyA9IHtcbiAgdXJpOiBzdHJpbmc7XG4gIGFnZW50T3B0aW9ucz86IHtcbiAgICBjYTogQnVmZmVyO1xuICAgIGtleTogQnVmZmVyO1xuICAgIGNlcnQ6IEJ1ZmZlcjtcbiAgfTtcbiAgdXNlUXVlcnlzdHJpbmc/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBQcm9taXNpZmllZCB2ZXJzaW9uIG9mIHRoZSByZXF1ZXN0IGZ1bmN0aW9uOlxuICogaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcmVxdWVzdCNyZXF1ZXN0b3B0aW9ucy1jYWxsYmFja1xuICogRGVmYXVsdHMgdG8gdXNpbmcgdGhlIG5vZGUncyBxdWVyeXN0cmluZyBtb2R1bGUgdG8gZW5jb2RlIHRoZSB1cmwgcXVlcnkgcGFyYW1ldGVycy5cbiAqIElmIHlvdSB3YW50IHRvIHVzZSB0aGUgbnBtJ3MgcXMgbW9kdWxlIHRvIGVuY29kZSB0aGUgcXVlcnkgcGFyYW1ldGVycywgZXhwbGljaXRseSBwcm92aWRlXG4gKiB0aGUgb3B0aW9uOlxuICoge3VzZVF1ZXJ5c3RyaW5nOiBmYWxzZX1cbiAqL1xuZnVuY3Rpb24gYXN5bmNSZXF1ZXN0KG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKTogUHJvbWlzZTxSZXNwb25zZUJvZHk+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAob3B0aW9ucy51c2VRdWVyeXN0cmluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb25zLnVzZVF1ZXJ5c3RyaW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgcmVxdWVzdChvcHRpb25zLCAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXNDb2RlID49IDMwMCkge1xuICAgICAgICBsZXQgZXJyb3JKc29uID0gYm9keTtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlcnJvckpzb24gPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIDQwNCByZXNwb25zZXMgYXJlbid0IGN1cnJlbnRseSBKU09OLlxuICAgICAgICAgICAgZXJyb3JKc29uID0ge21lc3NhZ2U6IGJvZHl9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDYXN0IHRvIE9iamVjdCBmb3IgdXNlIG9mIGNvZGUgZmllbGQgYmVsb3cuLi5cbiAgICAgICAgY29uc3QgZXJyOiBPYmplY3QgPSBuZXcgRXJyb3IoZXJyb3JKc29uLm1lc3NhZ2UpO1xuICAgICAgICAvLyBTdWNjZXNzIGh0dHAgc3RhdHVzIGNvZGVzIHJhbmdlIGZyb20gMjAwIHRvIDI5OS5cbiAgICAgICAgZXJyLmNvZGUgPSBlcnJvckpzb24uY29kZSB8fCByZXNwb25zZS5zdGF0dXNDb2RlO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoe2JvZHksIHJlc3BvbnNlfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFdyaXRlIGEgdGV4dCBvciBjb252ZXJ0IHRvIHRleHQgcmVzcG9uc2Ugd2l0aCBhbiBvcHRpb25hbCBzdGF0dXMgY29kZS5cbiAqL1xuZnVuY3Rpb24gc2VuZFRleHRSZXNwb25zZShyZXNwb25zZTogaHR0cCRmaXhlZCRTZXJ2ZXJSZXNwb25zZSwgdGV4dDogYW55LCBzdGF0dXNDb2RlOiA/bnVtYmVyKTpcbiAgICB2b2lkIHtcbiAgaWYgKHR5cGVvZiBzdGF0dXNDb2RlID09PSAnbnVtYmVyJykge1xuICAgIHJlc3BvbnNlLnN0YXR1c0NvZGUgPSBzdGF0dXNDb2RlO1xuICB9XG4gIHJlc3BvbnNlLndyaXRlKHRleHQgfHwgJycpO1xuICByZXNwb25zZS5lbmQoKTtcbn1cblxuLyoqXG4gKiBXcml0ZSBhIGpzb24gcmVzcG9uc2UgdGV4dCB3aXRoIGFuIG9wdGlvbmFsIHN0YXR1cyBjb2RlLlxuICovXG5mdW5jdGlvbiBzZW5kSnNvblJlc3BvbnNlKHJlc3BvbnNlOiBodHRwJGZpeGVkJFNlcnZlclJlc3BvbnNlLCBqc29uOiBhbnksIHN0YXR1c0NvZGU6ID9udW1iZXIpOlxuICAgIHZvaWQge1xuICByZXNwb25zZS5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIHNlbmRUZXh0UmVzcG9uc2UocmVzcG9uc2UsIEpTT04uc3RyaW5naWZ5KGpzb24pLCBzdGF0dXNDb2RlKTtcbn1cblxuLyoqXG4gICogUGFyc2VzIHRoZSByZXF1ZXN0IGJvZHkgaW4gYW4gYW55Yy9wcm9taXNlIHdheVxuICAqL1xuZnVuY3Rpb24gcGFyc2VSZXF1ZXN0Qm9keShodHRwUmVxdWVzdDogaHR0cCRmaXhlZCRJbmNvbWluZ01lc3NhZ2UsIGlzSnNvbjogP2Jvb2xlYW4pOlxuICAgIFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGJvZHkgPSAnJztcbiAgICBodHRwUmVxdWVzdC5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICBib2R5ICs9IGRhdGE7XG4gICAgICAvLyB0b28gbXVjaCBQT1NUIGRhdGEsIGtpbGwgdGhlIGNvbm5lY3Rpb24hXG4gICAgICBpZiAoYm9keS5sZW5ndGggPiBNQVhfUkVRVUVTVF9MRU5HVEgpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignYm9keSBpcyB0b28gYmlnJykpO1xuICAgICAgICBodHRwUmVxdWVzdC5jb25uZWN0aW9uLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBodHRwUmVxdWVzdC5vbignZW5kJywgKCkgPT4gcmVzb2x2ZShpc0pzb24gPyBKU09OLnBhcnNlKGJvZHkpIDogYm9keSkpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIHVybCBwYXJhbWV0ZXJzID9hYmM9ZXJmJmxvbD00MzJjXG4gKi9cbmZ1bmN0aW9uIGdldFF1ZXJ5UGFyYW1ldGVycyhyZXF1ZXN0VXJsOiBzdHJpbmcpOiBRdWVyeVBhcmFtcyB7XG4gIGNvbnN0IGNvbXBvbmVudHM6ID9PYmplY3QgPSB1cmwucGFyc2UocmVxdWVzdFVybCwgdHJ1ZSk7XG4gIGludmFyaWFudChjb21wb25lbnRzICE9IG51bGwpO1xuICBjb25zdCB7cXVlcnl9ID0gY29tcG9uZW50cztcbiAgcmV0dXJuIHF1ZXJ5O1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgdGhlIG1ldGhvZCBhcmd1bWVudHMgdG8gYXJncyBhbmQgYXJnVHlwZXMgYXJyYXlzXG4gKiB0byBzZW5kIHRoZSBtZXRhZGF0YSBhYm91dCB0aGUgYXJndW1lbnQgdHlwZXMgd2l0aCB0aGUgZGF0YVxuICogdG8gaGVscCB0aGUgc2VydmVyIHVuZGVyc3RhbmQgYW5kIHBhcnNlIGl0LlxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVBcmdzKGFyZ3M6IEFycmF5PGFueT4pOiBTZXJpYWxpemVkQXJndW1lbnRzIHtcbiAgY29uc3QgYXJnc09uSHR0cCA9IFtdO1xuICBjb25zdCBhcmdUeXBlcyA9IFtdO1xuICBhcmdzLmZvckVhY2goZnVuY3Rpb24oYXJnKSB7XG4gICAgLy8gSSBkbyB0aGlzIGJlY2F1c2UgbnVsbHMgYXJlIG5vcm1hbGx5IHNlbnQgYXMgZW1wdHkgc3RyaW5nc1xuICAgIGlmIChhcmcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJnc09uSHR0cC5wdXNoKCcnKTtcbiAgICAgIGFyZ1R5cGVzLnB1c2goJ3VuZGVmaW5lZCcpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGFyZ3NPbkh0dHAucHVzaChhcmcpO1xuICAgICAgYXJnVHlwZXMucHVzaCgnc3RyaW5nJyk7XG4gICAgfSBlbHNlIHsgLy8gb2JqZWN0LCBudW1iZXIsIGJvb2xlYW4gbnVsbFxuICAgICAgYXJnc09uSHR0cC5wdXNoKEpTT04uc3RyaW5naWZ5KGFyZykpO1xuICAgICAgYXJnVHlwZXMucHVzaCgnb2JqZWN0Jyk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHtcbiAgICBhcmdzOiBhcmdzT25IdHRwLFxuICAgIGFyZ1R5cGVzLFxuICB9O1xufVxuXG4vKipcbiAqIERlc2VyaWFsaXplcyBhIHVybCB3aXRoIHF1ZXJ5IHBhcmFtZXRlcnM6IGFyZ3MsIGFyZ1R5cGVzIHRvIGFuIGFycmF5XG4gKiBvZiB0aGUgb3JpZ2luYWwgYXJndW1lbnRzIG9mIHRoZSBzYW1lIHR5cGVzIHRoZSBjbGllbnQgY2FsbGVkIHRoZSBmdW5jdGlvbiB3aXRoLlxuICovXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZUFyZ3MocmVxdWVzdFVybDogc3RyaW5nKTogQXJyYXk8YW55PiB7XG4gIGxldCB7YXJncywgYXJnVHlwZXN9ID0gZ2V0UXVlcnlQYXJhbWV0ZXJzKHJlcXVlc3RVcmwpO1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgYXJnVHlwZXMgPSBhcmdUeXBlcyB8fCBbXTtcbiAgY29uc3QgYXJnc0FycmF5ID0gQXJyYXkuaXNBcnJheShhcmdzKSA/IGFyZ3MgOiBbYXJnc107XG4gIGNvbnN0IGFyZ1R5cGVzQXJyYXkgPSBBcnJheS5pc0FycmF5KGFyZ1R5cGVzKSA/IGFyZ1R5cGVzIDogW2FyZ1R5cGVzXTtcbiAgcmV0dXJuIGFyZ3NBcnJheS5tYXAoZnVuY3Rpb24oYXJnLCBpKSB7XG4gICAgLy8gSSBkbyB0aGlzIGJlY2F1c2UgbnVsbHMgYXJlIG5vcm1hbGx5IHNlbnQgYXMgZW1wdHkgc3RyaW5ncy5cbiAgICBpZiAoYXJnVHlwZXNBcnJheVtpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmIChhcmdUeXBlc0FycmF5W2ldID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc29tZSBtZXRob2RzIGhhdmUgb3B0aW9ucyBvYmplY3QgYXJndW1lbnRzLlxuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYXJnKTtcbiAgICB9XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXN5bmNSZXF1ZXN0LFxuICBkZXNlcmlhbGl6ZUFyZ3MsXG4gIGdldFF1ZXJ5UGFyYW1ldGVycyxcbiAgcGFyc2VSZXF1ZXN0Qm9keSxcbiAgc2VuZEpzb25SZXNwb25zZSxcbiAgc2VuZFRleHRSZXNwb25zZSxcbiAgc2VyaWFsaXplQXJncyxcbn07XG4iXX0=