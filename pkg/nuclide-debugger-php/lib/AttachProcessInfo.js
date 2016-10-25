'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachProcessInfo = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _PhpDebuggerInstance;

function _load_PhpDebuggerInstance() {
  return _PhpDebuggerInstance = require('./PhpDebuggerInstance');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let AttachProcessInfo = exports.AttachProcessInfo = class AttachProcessInfo extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerProcessInfo {
  constructor(targetUri) {
    super('hhvm', targetUri);
  }

  debug() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        // $FlowFB
        const services = require('./fb/services');
        yield services.warnIfNotBuilt(_this.getTargetUri());
        services.startSlog();
      } catch (_) {}
      return new (_PhpDebuggerInstance || _load_PhpDebuggerInstance()).PhpDebuggerInstance(_this);
    })();
  }

  supportThreads() {
    return true;
  }

  supportSingleThreadStepping() {
    return true;
  }

  singleThreadSteppingEnabled() {
    return true;
  }

  customControlButtons() {
    const customControlButtons = [{
      icon: 'link-external',
      title: 'Toggle HTTP Request Sender',
      onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-http-request-sender:toggle-http-request-edit-dialog')
    }];
    try {
      // $FlowFB
      return customControlButtons.concat(require('./fb/services').customControlButtons);
    } catch (_) {
      return customControlButtons;
    }
  }
};