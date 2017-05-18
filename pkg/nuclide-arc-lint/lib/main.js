'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _ArcanistDiagnosticsProvider;

function _load_ArcanistDiagnosticsProvider() {
  return _ArcanistDiagnosticsProvider = _interopRequireWildcard(require('./ArcanistDiagnosticsProvider'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
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

class Activation {

  constructor() {
    this._busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
  }

  provideBusySignal() {
    return this._busySignalProvider;
  }

  provideLinter() {
    return {
      name: 'Arc',
      grammarScopes: ['*'],
      scope: 'file',
      lint: editor => {
        const path = editor.getPath();
        if (path == null) {
          return null;
        }
        return this._busySignalProvider.reportBusy(`Waiting for arc lint results for \`${editor.getTitle()}\``, () => (_ArcanistDiagnosticsProvider || _load_ArcanistDiagnosticsProvider()).lint(editor), { onlyForFile: path });
      }
    };
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);