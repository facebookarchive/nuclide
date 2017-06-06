'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideArcanistBase;

function _load_nuclideArcanistBase() {
  return _nuclideArcanistBase = require('../../nuclide-arcanist-base');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (projectId, projects) {
    // Fetch the Arcanist project of each open project.
    // This also gets parent projects, in case we have a child project mounted.
    const arcInfos = yield Promise.all(projects.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (dir) {
        const matches = [];
        let currentDir = dir;
        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const info = yield (0, (_nuclideArcanistBase || _load_nuclideArcanistBase()).findArcProjectIdAndDirectory)(currentDir);
          if (info == null) {
            break;
          }
          matches.push(info);
          currentDir = (_nuclideUri || _load_nuclideUri()).default.dirname(info.directory);
        }
        return matches;
      });

      return function (_x3) {
        return _ref2.apply(this, arguments);
      };
    })()));

    return [].concat(...arcInfos).filter(Boolean).filter(function (arcInfo) {
      return arcInfo.projectId === projectId;
    }).map(function (arcInfo) {
      return arcInfo.directory;
    });
  });

  function getMatchingProjects(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return getMatchingProjects;
})();