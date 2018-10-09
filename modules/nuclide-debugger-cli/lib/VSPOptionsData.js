"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _collection() {
  const data = require("../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
class VSPOptionsData {
  constructor(packagePath) {
    this._packagePath = packagePath;

    const path = _nuclideUri().default.join(this._packagePath, 'package.json');

    try {
      this._adapterConfiguration = JSON.parse(_fs.default.readFileSync(path, 'utf8'));
    } catch (error) {
      throw new Error(`Adapter package.json for '${this._packagePath}' is corrupt.`);
    }

    if (this._adapterConfiguration == null) {
      throw new Error(`Adapter package.json for '${this._packagePath}' is corrupt.`);
    } // $TODO enumerate languages
    // Note that not all adapters will have this file; some have the
    // strings directly embedded in package.json


    const nlsPath = _nuclideUri().default.join(this._packagePath, 'package.nls.json');

    try {
      const packageStrings = JSON.parse(_fs.default.readFileSync(nlsPath, 'utf8'));

      if (packageStrings != null) {
        this._strings = (0, _collection().mapFromObject)(packageStrings);
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
    var _ref, _ref2;

    const debuggers = ((_ref = config) != null ? (_ref = _ref.contributes) != null ? _ref.debuggers : _ref : _ref) || null;

    if (debuggers == null) {
      throw new Error('Adapter package.json is missing.');
    }

    const theDebugger = debuggers.find(_ => _.type === type);
    const properties = (_ref2 = theDebugger) != null ? (_ref2 = _ref2.configurationAttributes) != null ? (_ref2 = _ref2[action]) != null ? _ref2.properties : _ref2 : _ref2 : _ref2;

    if (properties != null) {
      return (0, _collection().mapFromObject)(properties);
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

exports.default = VSPOptionsData;