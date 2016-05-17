Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.normalizePathUri = normalizePathUri;
exports.dedupeNormalizedUris = dedupeNormalizedUris;
exports.splitUri = splitUri;
exports.isUriBelow = isUriBelow;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = require('../../nuclide-remote-uri');
}

function normalizePathUri(uri) {
  var _ref = (0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).parse)(uri);

  var hostname = _ref.hostname;
  var path = _ref.path;

  if (hostname != null && hostname !== '') {
    // TODO: advinsky replace with remote-uri.normalize() when task t10040084 is closed
    return 'nuclide://' + hostname + normalizePath(path);
  } else {
    return normalizePath(uri);
  }
}

function dedupeNormalizedUris(uris) {
  var dedepped = uris.slice();
  dedepped.sort();

  var lastOkIndex = -1;

  return dedepped.filter(function (u, i) {
    var sep = (0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).pathModuleFor)(u).sep;
    if (i !== 0 && u.startsWith(dedepped[lastOkIndex] + sep)) {
      return false;
    }

    lastOkIndex = i;
    return true;
  });
}

function splitUri(uri) {
  var sep = (0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).pathModuleFor)(uri).sep;
  // Can't user remote-uri.parse() here, as the (normzlized) URI might no longer conform

  var _default$parse = (_url2 || _url()).default.parse(uri);

  var hostname = _default$parse.hostname;
  var path = _default$parse.path;

  if (hostname) {
    var tokensInPath = path ? path.split(sep) : [];
    return [hostname, sep].concat(_toConsumableArray(tokensInPath));
  } else {
    var tokensInPath = uri.split(sep);
    return ['localhost', sep].concat(_toConsumableArray(tokensInPath));
  }
}

function isUriBelow(ancestorUri, descendantUri) {
  var sep = (0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).pathModuleFor)(ancestorUri).sep;
  return descendantUri.startsWith(ancestorUri) && (descendantUri[ancestorUri.length] === sep || ancestorUri.length === descendantUri.length);
}

function normalizePath(path) {
  (0, (_assert2 || _assert()).default)(path);
  var normalized = (0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).normalize)(path);
  var sep = (0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).pathModuleFor)(path).sep;
  if (normalized.endsWith(sep)) {
    return normalized.slice(0, -1);
  }

  return normalized;
}