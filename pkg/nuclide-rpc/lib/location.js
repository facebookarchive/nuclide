'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.locationToString = locationToString;
exports.locationsEqual = locationsEqual;
exports.stripLocationsFileName = stripLocationsFileName;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function locationToString(location) {
  switch (location.type) {
    case 'source':
      return `${location.fileName}(${location.line})`;
    case 'builtin':
      return '<builtin>';
    default:
      throw new Error('Bad location type');
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function locationsEqual(first, second) {
  if (first.type !== second.type) {
    return false;
  }
  switch (first.type) {
    case 'source':
      if (!(second.type === 'source')) {
        throw new Error('Invariant violation: "second.type === \'source\'"');
      }

      return first.fileName === second.fileName && first.line === second.line;
    case 'builtin':
      return true;
    default:
      throw new Error('Bad location type');
  }
}

function stripLocationsFileName(obj) {
  function inspect(key, value) {
    if (key === 'location' && value !== null && typeof value.fileName === 'string') {
      value.fileName = (_nuclideUri || _load_nuclideUri()).default.basename(value.fileName);
    } else {
      stripLocationsFileName(value);
    }
  }
  if (Array.isArray(obj)) {
    obj.forEach(value => {
      inspect(null, value);
    });
  } else if (obj instanceof Map) {
    obj.forEach((value, key) => {
      inspect(key, value);
    });
  } else if (obj != null && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      inspect(key, obj[key]);
    });
  }
  return obj;
}