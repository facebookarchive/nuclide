'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasteReduceName = hasteReduceName;
exports.getHasteName = getHasteName;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hasteReduceName(file, hasteSettings) {
  if (!hasteSettings.useNameReducers) {
    return null;
  }
  const {
    nameReducers,
    nameReducerWhitelist,
    nameReducerBlacklist
  } = hasteSettings;
  if ((nameReducerWhitelist.length === 0 || nameReducerWhitelist.some(r => r.test(file))) && !nameReducerBlacklist.some(r => r.test(file))) {
    if (nameReducers.length === 0) {
      // The default name reducer.
      return (_nuclideUri || _load_nuclideUri()).default.stripExtension((_nuclideUri || _load_nuclideUri()).default.basename(file));
    }
    return nameReducers.reduce((hasteName, reducer) => hasteName.replace(reducer.regexp, reducer.replacement), file);
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

function getHasteName(file, ast, hasteSettings) {
  if (!hasteSettings.isHaste) {
    return null;
  }
  // Try to use a name reducer, as long as this isn't blacklisted.
  const nameReducerResult = hasteReduceName(file, hasteSettings);
  if (nameReducerResult != null) {
    return nameReducerResult;
  }
  // Otherwise, if there's a @providesModule comment, this is always OK.
  for (const comment of ast.comments) {
    if (comment.type === 'CommentBlock') {
      const providesModule = comment.value.match(/@providesModule\s+(\S+)/);
      if (providesModule != null) {
        return providesModule[1];
      }
    }
  }
  return null;
}