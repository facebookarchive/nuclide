"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HackSymbolProvider = void 0;

function _humanizePath() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/humanizePath"));

  _humanizePath = function () {
    return data;
  };

  return data;
}

function _HackLanguage() {
  const data = require("./HackLanguage");

  _HackLanguage = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
async function getHackDirectoriesByService(directories) {
  const promises = directories.map(async directory => {
    const service = await (0, _HackLanguage().getHackLanguageForUri)(directory.getPath());
    return service ? [service, directory.getPath()] : null;
  });
  const serviceDirectories = await Promise.all(promises);
  const results = (0, _collection().collect)((0, _collection().arrayCompact)(serviceDirectories));
  return Array.from(results.entries());
}

const HackSymbolProvider = {
  providerType: 'GLOBAL',
  name: 'HackSymbolProvider',
  display: {
    title: 'Hack Symbols',
    prompt: 'Search Hack symbols...',
    action: 'nuclide-hack-symbol-provider:toggle-provider'
  },

  async isEligibleForDirectories(directories) {
    const serviceDirectories = await getHackDirectoriesByService(directories);
    const eligibilities = await Promise.all(serviceDirectories.map(([service, dirs]) => service.supportsSymbolSearch(dirs)));
    return eligibilities.some(e => e);
  },

  async executeQuery(query, directories) {
    if (query.length === 0) {
      return [];
    }

    const serviceDirectories = await getHackDirectoriesByService(directories);
    const results = await Promise.all(serviceDirectories.map(([service, dirs]) => service.symbolSearch(query, dirs)));
    return (0, _collection().arrayFlatten)((0, _collection().arrayCompact)(results));
  },

  getComponentForItem(item) {
    const name = item.name || ''; // flowlint-next-line sketchy-null-string:off

    const symbolClasses = item.icon ? `file icon icon-${item.icon}` : 'file icon no-icon';
    return React.createElement("div", {
      title: item.hoverText || ''
    }, React.createElement("span", {
      className: symbolClasses
    }, React.createElement("code", null, name)), React.createElement("span", {
      className: "omnisearch-symbol-result-filename"
    }, (0, _humanizePath().default)(item.path)));
  }

};
exports.HackSymbolProvider = HackSymbolProvider;