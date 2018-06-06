'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _fs = _interopRequireDefault(require('fs'));

var _collection;

function _load_collection() {
  return _collection = require('../../nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The parts of a VSP adapter's package.json that we need in order to parse
// command line options.
class VSPOptionsData {

  constructor(packagePath) {
    this._packagePath = packagePath;

    const path = (_nuclideUri || _load_nuclideUri()).default.join(this._packagePath, 'package.json');
    try {
      this._adapterConfiguration = JSON.parse(_fs.default.readFileSync(path, 'utf8'));
    } catch (error) {
      throw new Error(`Adapter package.json for '${this._packagePath}' is corrupt.`);
    }

    if (this._adapterConfiguration == null) {
      throw new Error(`Adapter package.json for '${this._packagePath}' is corrupt.`);
    }

    // $TODO enumerate languages
    // Note that not all adapters will have this file; some have the
    // strings directly embedded in package.json
    const nlsPath = (_nuclideUri || _load_nuclideUri()).default.join(this._packagePath, 'package.nls.json');
    try {
      const packageStrings = JSON.parse(_fs.default.readFileSync(nlsPath, 'utf8'));

      if (packageStrings != null) {
        this._strings = (0, (_collection || _load_collection()).mapFromObject)(packageStrings);
      }
    } catch (error) {}
  }

  adapterPropertiesForAction(type, action) {
    const propertyMap = this._propertiesFromConfig(this._adapterConfiguration, action, type);

    for (const prop of propertyMap.values()) {
      const desc = this._translateDescription(prop.description);
      if (desc != null) {
        prop.description = desc;
      }
    }

    return propertyMap;
  }

  _propertiesFromConfig(config, action, type) {
    var _ref, _ref2, _ref3, _ref4, _ref5;

    const debuggers = ((_ref = config) != null ? (_ref2 = _ref.contributes) != null ? _ref2.debuggers : _ref2 : _ref) || null;
    if (debuggers == null) {
      throw new Error('Adapter package.json is missing.');
    }

    const theDebugger = debuggers.find(_ => _.type === type);
    const properties = (_ref3 = theDebugger) != null ? (_ref4 = _ref3.configurationAttributes) != null ? (_ref5 = _ref4[action]) != null ? _ref5.properties : _ref5 : _ref4 : _ref3;
    if (properties != null) {
      return (0, (_collection || _load_collection()).mapFromObject)(properties);
    }

    throw new Error('Adapter configuration is missing.');
  }

  _translateDescription(description) {
    if (description == null || this._strings == null) {
      return description;
    }

    const strings = this._strings;
    if (strings == null) {
      return description;
    }

    const match = description.match(/^%(.*)%$/);
    if (match == null) {
      return description;
    }
    return strings.get(match[1]) || description;
  }
}
exports.default = VSPOptionsData; /**
                                   * Copyright (c) 2017-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the BSD-style license found in the
                                   * LICENSE file in the root directory of this source tree. An additional grant
                                   * of patent rights can be found in the PATENTS file in the same directory.
                                   *
                                   * 
                                   * @format
                                   */