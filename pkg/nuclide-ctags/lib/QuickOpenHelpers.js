"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _HackLanguage() {
  const data = require("../../nuclide-hack/lib/HackLanguage");

  _HackLanguage = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
// ctags doesn't have a true limit API, so having too many results slows down Nuclide.
const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 10;
const DEFAULT_ICON = 'icon-squirrel';

async function getCtagsService(directory) {
  // The tags package looks in the directory, so give it a sample file.
  const path = _nuclideUri().default.join(directory.getPath(), 'file');

  const service = (0, _nuclideRemoteConnection().getServiceByNuclideUri)('CtagsService', path);

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

    const path = _nuclideUri().default.relative(item.dir, item.path);

    let kind;
    let icon;

    if (item.kind != null) {
      kind = _utils().CTAGS_KIND_NAMES[item.kind];
      icon = _utils().CTAGS_KIND_ICONS[item.kind];
    }

    icon = icon || DEFAULT_ICON;
    return React.createElement("div", {
      title: kind
    }, React.createElement("span", {
      className: `file icon ${icon}`
    }, React.createElement("code", null, item.name)), React.createElement("span", {
      className: "omnisearch-symbol-result-filename"
    }, path));
  }

  static async executeQuery(query, directory) {
    if (query.length < MIN_QUERY_LENGTH) {
      return [];
    }

    const dir = directory.getPath();
    const service = await getCtagsService(directory);

    if (service == null) {
      return [];
    } // HACK: Ctags results typically just duplicate Hack results when they're present.
    // Filter out results from PHP files when the Hack service is available.
    // TODO(hansonw): Remove this when quick-open has proper ranking/de-duplication.


    let isHackProject;

    if (_featureConfig().default.get('nuclide-ctags.disableWithHack') !== false) {
      isHackProject = await (0, _HackLanguage().isFileInHackProject)(directory.getPath());
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
            const line = await (0, _utils().getLineNumberForTag)(tag);
            (0, _goToLocation().goToLocation)(tag.file, {
              line
            });
          }

        });
      });
    } finally {
      service.dispose();
    }
  }

}

exports.default = QuickOpenHelpers;