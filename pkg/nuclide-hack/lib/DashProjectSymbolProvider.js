"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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
const DashProjectSymbolProvider = {
  searchSymbolsForDirectory(query, directory, callback) {
    const directoryPath = directory.getPath();

    const results = _RxMin.Observable.defer(() => (0, _HackLanguage().getHackLanguageForUri)(directoryPath)).switchMap(service => service == null ? _RxMin.Observable.of([]) : service.symbolSearch(query, [directoryPath])).map(searchResults => searchResults || []).catch(() => _RxMin.Observable.of([]));

    return new (_UniversalDisposable().default)(results.subscribe(callback));
  }

};
var _default = DashProjectSymbolProvider;
exports.default = _default;