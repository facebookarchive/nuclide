'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = undefined;
exports.getPythonAutoGenConfig = getPythonAutoGenConfig;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _constants;

function _load_constants() {
  return _constants = require('nuclide-debugger-common/constants');
}

var _autogenUtils;

function _load_autogenUtils() {
  return _autogenUtils = require('nuclide-debugger-common/autogen-utils');
}

var _AutoGenLaunchAttachProvider;

function _load_AutoGenLaunchAttachProvider() {
  return _AutoGenLaunchAttachProvider = _interopRequireDefault(require('nuclide-debugger-common/AutoGenLaunchAttachProvider'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const NUCLIDE_PYTHON_DEBUGGER_DEX_URI = exports.NUCLIDE_PYTHON_DEBUGGER_DEX_URI = 'https://our.intern.facebook.com/intern/dex/python-and-fbcode/debugging/#nuclide';

class Activation {

  constructor() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_utils || _load_utils()).listenToRemoteDebugCommands)());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeRpcService(rpcService) {
    return (0, (_utils || _load_utils()).setRpcService)(rpcService);
  }

  createDebuggerProvider() {
    return {
      name: 'Python',
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).default('Python', connection, getPythonAutoGenConfig());
      }
    };
  }
}

function getPythonAutoGenConfig() {
  const pkgJson = require('./VendorLib/vs-py-debugger/package.json');
  const configurationAttributes = pkgJson.contributes.debuggers[0].configurationAttributes;
  configurationAttributes.launch.properties.pythonPath.description = 'Path (fully qualified) to python executable.';
  const launchProperties = {};
  const launchRequired = ['pythonPath', 'program', 'cwd'];
  const launchVisible = launchRequired.concat(['args', 'env', 'stopOnEntry']);
  const launchWhitelisted = new Set(launchVisible.concat(['console', 'debugOptions']));

  Object.entries(configurationAttributes.launch.properties).filter(property => launchWhitelisted.has(property[0])).forEach(property => {
    const name = property[0];
    const propertyDetails = property[1];
    // TODO(goom): replace the indexOf '$' stuff with logic that accesses settings
    if (propertyDetails.default != null && typeof propertyDetails.default === 'string' && propertyDetails.default.indexOf('$') === 0) {
      delete propertyDetails.default;
    }
    launchProperties[name] = propertyDetails;
  });

  return {
    launch: {
      launch: true,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.PYTHON,
      threads: true,
      properties: (0, (_autogenUtils || _load_autogenUtils()).generatePropertyArray)(launchProperties, launchRequired, launchVisible),
      scriptPropertyName: 'program',
      scriptExtension: '.py',
      cwdPropertyName: 'cwd',
      header: _react.createElement(
        'p',
        null,
        'This is intended to debug python script files.',
        _react.createElement('br', null),
        'To debug buck targets, you should',
        ' ',
        _react.createElement(
          'a',
          { href: NUCLIDE_PYTHON_DEBUGGER_DEX_URI },
          'use the buck toolbar instead'
        ),
        '.'
      )
    },
    attach: null
  };
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);