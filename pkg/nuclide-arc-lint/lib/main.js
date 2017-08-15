'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _ArcanistDiagnosticsProvider;

function _load_ArcanistDiagnosticsProvider() {
  return _ArcanistDiagnosticsProvider = _interopRequireWildcard(require('./ArcanistDiagnosticsProvider'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class Activation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeBusySignal(service) {
    this._busySignalService = service;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._busySignalService = null;
    });
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
        if (this._busySignalService == null) {
          return (_ArcanistDiagnosticsProvider || _load_ArcanistDiagnosticsProvider()).lint(editor);
        }
        return this._busySignalService.reportBusyWhile(`Waiting for arc lint results for \`${editor.getTitle()}\``, () => (_ArcanistDiagnosticsProvider || _load_ArcanistDiagnosticsProvider()).lint(editor), { onlyForFile: path });
      }
    };
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);