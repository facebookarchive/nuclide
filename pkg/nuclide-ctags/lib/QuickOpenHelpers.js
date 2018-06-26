'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('../../nuclide-hack/lib/HackLanguage');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// ctags doesn't have a true limit API, so having too many results slows down Nuclide.

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const MIN_QUERY_LENGTH = 2; /**
                             * Copyright (c) 2015-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the license found in the LICENSE file in
                             * the root directory of this source tree.
                             *
                             * 
                             * @format
                             */

const RESULTS_LIMIT = 10;
const DEFAULT_ICON = 'icon-squirrel';

async function getCtagsService(directory) {
  // The tags package looks in the directory, so give it a sample file.
  const path = (_nuclideUri || _load_nuclideUri()).default.join(directory.getPath(), 'file');
  const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('CtagsService', path);
  if (service == null) {
    return null;
  }
  return service.getCtagsService(path);
}

class QuickOpenHelpers {
  static async isEligibleForDirectory(directory) {
    const svc = await getCtagsService(directory);
    if (svc != null) {
      svc.dispose();
      return true;
    }
    return false;
  }

  static getComponentForItem(uncastedItem) {
    const item = uncastedItem;
    const path = (_nuclideUri || _load_nuclideUri()).default.relative(item.dir, item.path);
    let kind;
    let icon;
    if (item.kind != null) {
      kind = (_utils || _load_utils()).CTAGS_KIND_NAMES[item.kind];
      icon = (_utils || _load_utils()).CTAGS_KIND_ICONS[item.kind];
    }
    icon = icon || DEFAULT_ICON;
    return _react.createElement(
      'div',
      { title: kind },
      _react.createElement(
        'span',
        { className: `file icon ${icon}` },
        _react.createElement(
          'code',
          null,
          item.name
        )
      ),
      _react.createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        path
      )
    );
  }

  static async executeQuery(query, directory) {
    if (query.length < MIN_QUERY_LENGTH) {
      return [];
    }

    const dir = directory.getPath();
    const service = await getCtagsService(directory);
    if (service == null) {
      return [];
    }

    // HACK: Ctags results typically just duplicate Hack results when they're present.
    // Filter out results from PHP files when the Hack service is available.
    // TODO(hansonw): Remove this when quick-open has proper ranking/de-duplication.
    let isHackProject;
    if ((_featureConfig || _load_featureConfig()).default.get('nuclide-ctags.disableWithHack') !== false) {
      isHackProject = await (0, (_HackLanguage || _load_HackLanguage()).isFileInHackProject)(directory.getPath());
    }

    try {
      const results = await service.findTags(query, {
        caseInsensitive: true,
        partialMatch: true,
        limit: RESULTS_LIMIT
      });

      return results.filter(tag => !isHackProject || !tag.file.endsWith('.php')).map(tag => {
        return Object.assign({}, tag, {
          resultType: 'FILE',
          path: tag.file,
          dir,
          async callback() {
            const line = await (0, (_utils || _load_utils()).getLineNumberForTag)(tag);
            (0, (_goToLocation || _load_goToLocation()).goToLocation)(tag.file, { line });
          }
        });
      });
    } finally {
      service.dispose();
    }
  }
}
exports.default = QuickOpenHelpers;