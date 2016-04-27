Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.normalizePathUri = normalizePathUri;
exports.dedupeNormalizedUris = dedupeNormalizedUris;
exports.splitUri = splitUri;
exports.isUriBelow = isUriBelow;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

function normalizePathUri(uri) {
  var _parse = (0, _nuclideRemoteUri.parse)(uri);

  var hostname = _parse.hostname;
  var path = _parse.path;

  if (hostname != null) {
    // TODO: advinsky replace with remote-uri.normalize() when task t10040084 is closed
    return 'nuclide://' + hostname + normalizePath(path);
  } else {
    return normalizePath(path);
  }
}

function dedupeNormalizedUris(uris) {
  var dedepped = uris.slice();
  dedepped.sort();

  var lastOkIndex = -1;

  return dedepped.filter(function (u, i) {
    if (i !== 0 && u.startsWith(dedepped[lastOkIndex] + '/')) {
      return false;
    }

    lastOkIndex = i;
    return true;
  });
}

function splitUri(uri) {
  // Can't user remote-uri.parse() here, as the (normzlized) URI might no longer conform

  var _url$parse = _url2['default'].parse(uri);

  var hostname = _url$parse.hostname;
  var path = _url$parse.path;

  var tokensInPath = path ? path.split('/') : [];

  if (hostname) {
    return [hostname, '/'].concat(_toConsumableArray(tokensInPath));
  }

  return ['localhost', '/'].concat(_toConsumableArray(tokensInPath));
}

function isUriBelow(ancestorUri, descendantUri) {
  return descendantUri.startsWith(ancestorUri) && (descendantUri[ancestorUri.length] === '/' || ancestorUri.length === descendantUri.length);
}

function normalizePath(path) {
  (0, _assert2['default'])(path);
  var normalized = (0, _nuclideRemoteUri.normalize)(path);
  if (normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized;
}