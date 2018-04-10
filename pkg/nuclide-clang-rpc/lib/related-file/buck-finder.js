'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findSourceFileInSameFolderIfBelongsToBuck = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let findAnySourceInDir = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (dirname) {
    for (const file of yield (_fsPromise || _load_fsPromise()).default.readdir(dirname).catch(function () {
      return [];
    })) {
      if ((0, (_utils || _load_utils()).isSourceFile)(file)) {
        return (_nuclideUri || _load_nuclideUri()).default.join(dirname, file);
      }
    }
    return null;
  });

  return function findAnySourceInDir(_x) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

let headerSeemsToBeInABuckProject = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (header) {
    const buildFile = yield (0, (_utils || _load_utils()).guessBuildFile)(header);
    return buildFile != null && (0, (_utils || _load_utils()).isBuckBuildFile)(buildFile);
  });

  return function headerSeemsToBeInABuckProject(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let findSourceFileInSameFolderIfBelongsToBuck = exports.findSourceFileInSameFolderIfBelongsToBuck = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (header) {
    // we can assume that any source in the same target has the same includes,
    // but finding which target is hard, so we fallback to any source in the
    // same folder
    if (yield headerSeemsToBeInABuckProject(header)) {
      return findAnySourceInDir((_nuclideUri || _load_nuclideUri()).default.dirname(header));
    }
    return null;
  });

  return function findSourceFileInSameFolderIfBelongsToBuck(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }