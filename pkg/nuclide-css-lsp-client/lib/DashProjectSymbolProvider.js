'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DashProjectSymbolProvider {

  constructor(languageService) {
    this._languageService = languageService;
  }

  searchSymbolsForDirectory(query, directory, callback) {
    const directoryPath = directory.getPath();

    const results = _rxjsBundlesRxMinJs.Observable.defer(() => this._languageService.getLanguageServiceForUri(directoryPath)).switchMap(service => service == null ? _rxjsBundlesRxMinJs.Observable.of([]) : service.symbolSearch(query, [directoryPath])).map(searchResults => searchResults || []).catch(() => _rxjsBundlesRxMinJs.Observable.of([]));

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(results.subscribe(callback));
  }
}
exports.default = DashProjectSymbolProvider; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */

// $FlowFB