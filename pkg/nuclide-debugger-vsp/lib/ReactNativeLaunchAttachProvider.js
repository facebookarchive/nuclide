'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _react = _interopRequireDefault(require('react'));

var _ReactNativeAttachUiComponent;

function _load_ReactNativeAttachUiComponent() {
  return _ReactNativeAttachUiComponent = _interopRequireDefault(require('./ReactNativeAttachUiComponent'));
}

var _ReactNativeLaunchUiComponent;

function _load_ReactNativeLaunchUiComponent() {
  return _ReactNativeLaunchUiComponent = _interopRequireDefault(require('./ReactNativeLaunchUiComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReactNativeLaunchAttachProvider extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerLaunchAttachProvider {
  constructor(targetUri) {
    super('React Native', targetUri);
  }

  getCallbacksForAction(action) {
    var _this = this;

    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: (() => {
        var _ref = (0, _asyncToGenerator.default)(function* () {
          return (_nuclideUri || _load_nuclideUri()).default.isLocal(_this._targetUri);
        });

        return function isEnabled() {
          return _ref.apply(this, arguments);
        };
      })(),

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: super.getCallbacksForAction(action).getDebuggerTypeNames,

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        if (action === 'launch') {
          return _react.default.createElement((_ReactNativeLaunchUiComponent || _load_ReactNativeLaunchUiComponent()).default, {
            configIsValidChanged: configIsValidChanged
          });
        } else {
          return _react.default.createElement((_ReactNativeAttachUiComponent || _load_ReactNativeAttachUiComponent()).default, {
            configIsValidChanged: configIsValidChanged
          });
        }
      }
    };
  }

  dispose() {}
}
exports.default = ReactNativeLaunchAttachProvider; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    * @format
                                                    */