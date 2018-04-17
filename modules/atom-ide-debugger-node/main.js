'use strict';

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider() {
    return {
      name: 'Node',
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).default('Node', connection, getNodeAutoGenConfig());
      }
    };
  }
}

function getNodeAutoGenConfig() {
  const pkgJson = require('./VendorLib/vscode-node-debug2/package.json');
  const pkgJsonDescriptions = require('./VendorLib/vscode-node-debug2/package.nls.json');
  const configurationAttributes = pkgJson.contributes.debuggers[1].configurationAttributes;
  Object.entries(configurationAttributes.launch.properties).forEach(property => {
    const name = property[0];
    const descriptionSubstitution = configurationAttributes.launch.properties[name].description;
    if (descriptionSubstitution != null && typeof descriptionSubstitution === 'string') {
      configurationAttributes.launch.properties[name].description = pkgJsonDescriptions[descriptionSubstitution.slice(1, -1)];
    }
  });
  configurationAttributes.launch.properties.runtimeExecutable = {
    type: 'string',
    description: "Runtime to use. Either an absolute path or the name of a runtime available on the PATH. If ommitted 'node' is assumed.",
    default: ''
  };
  configurationAttributes.launch.properties.protocol = {
    type: 'string',
    description: '',
    default: 'inspector'
  };

  const launchProperties = {};
  const launchRequired = ['program', 'cwd'];
  const launchVisible = launchRequired.concat(['runtimeExecutable', 'args', 'outFiles', 'env', 'stopOnEntry']);
  const launchWhitelisted = new Set(launchVisible.concat(['protocol', 'outFiles']));

  Object.entries(configurationAttributes.launch.properties).filter(property => launchWhitelisted.has(property[0])).forEach(property => {
    const name = property[0];
    const propertyDetails = property[1];
    launchProperties[name] = propertyDetails;
  });

  return {
    launch: {
      launch: true,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.NODE,
      threads: false,
      properties: (0, (_autogenUtils || _load_autogenUtils()).generatePropertyArray)(launchProperties, launchRequired, launchVisible),
      scriptPropertyName: 'program',
      cwdPropertyName: 'cwd',
      scriptExtension: '.js',
      header: _react.createElement(
        'p',
        null,
        'This is intended to debug node.js files (for node version 6.3+).'
      )
    },
    attach: {
      launch: false,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.NODE,
      threads: false,
      properties: [{
        name: 'port',
        type: 'number',
        description: 'Port',
        required: true,
        visible: true
      }],
      header: _react.createElement(
        'p',
        null,
        'Attach to a running node.js process'
      )
    }
  };
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);