"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _CodeLensListener() {
  const data = require("./CodeLensListener");

  _CodeLensListener = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _OCamlLanguage() {
  const data = require("./OCamlLanguage");

  _OCamlLanguage = function () {
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
 *  strict-local
 * @format
 */
let disposables = new (_UniversalDisposable().default)();

async function activate() {
  const ocamlLspLanguageService = (0, _OCamlLanguage().createLanguageService)();
  ocamlLspLanguageService.activate();
  disposables.add(ocamlLspLanguageService);

  if (_featureConfig().default.get('nuclide-ocaml.codeLens')) {
    disposables.add((0, _CodeLensListener().observeForCodeLens)(ocamlLspLanguageService, (0, _log4js().getLogger)('OcamlService')));
  }
}

async function deactivate() {
  disposables.dispose();
  disposables = new (_UniversalDisposable().default)();
}