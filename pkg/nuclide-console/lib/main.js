Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeGadgetsService = consumeGadgetsService;
exports.provideOutputService = provideOutputService;
exports.provideRegisterExecutor = provideRegisterExecutor;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var activation = null;

function activate(state) {
  if (activation == null) {
    var Activation = require('./Activation');
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function consumeGadgetsService(gadgetsApi) {
  (0, _assert2['default'])(activation);
  return activation.consumeGadgetsService(gadgetsApi);
}

function provideOutputService() {
  (0, _assert2['default'])(activation);
  return activation.provideOutputService();
}

function provideRegisterExecutor() {
  (0, _assert2['default'])(activation);
  return activation.provideRegisterExecutor();
}