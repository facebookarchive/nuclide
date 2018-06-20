'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _CodeLensListener;

function _load_CodeLensListener() {
  return _CodeLensListener = require('./CodeLensListener');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _OCamlLanguage;

function _load_OCamlLanguage() {
  return _OCamlLanguage = require('./OCamlLanguage');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(); /**
                                                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                                                        * All rights reserved.
                                                                                        *
                                                                                        * This source code is licensed under the license found in the LICENSE file in
                                                                                        * the root directory of this source tree.
                                                                                        *
                                                                                        *  strict-local
                                                                                        * @format
                                                                                        */

async function activate() {
  const ocamlLspLanguageService = (0, (_OCamlLanguage || _load_OCamlLanguage()).createLanguageService)();
  ocamlLspLanguageService.activate();
  disposables.add(ocamlLspLanguageService);

  if ((_featureConfig || _load_featureConfig()).default.get('nuclide-ocaml.codeLens')) {
    disposables.add((0, (_CodeLensListener || _load_CodeLensListener()).observeForCodeLens)(ocamlLspLanguageService, (0, (_log4js || _load_log4js()).getLogger)('OcamlService')));
  }
}

async function deactivate() {
  disposables.dispose();
  disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
}