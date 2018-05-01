'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.JavaLaunchAttachProvider = undefined;var _nuclideDebuggerCommon;












function _load_nuclideDebuggerCommon() {return _nuclideDebuggerCommon = require('nuclide-debugger-common');}
var _react = _interopRequireWildcard(require('react'));var _AndroidLaunchComponent;
function _load_AndroidLaunchComponent() {return _AndroidLaunchComponent = require('./AndroidLaunchComponent');}var _AndroidAttachComponent;
function _load_AndroidAttachComponent() {return _AndroidAttachComponent = require('./AndroidAttachComponent');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}


const JAVA_DEBUG_ANDROID = 'Java (Android)'; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */class JavaLaunchAttachProvider extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerLaunchAttachProvider {getCallbacksForAction(action) {return { /**
                                                                                                                                                                                                                        * Whether this provider is enabled or not.
                                                                                                                                                                                                                        */isEnabled: () => {return Promise.resolve(true);},
      /**
                                                                                                                                                                                                                                                                             * Returns a list of supported debugger types + environments for the specified action.
                                                                                                                                                                                                                                                                             */
      getDebuggerTypeNames: () => {
        return [JAVA_DEBUG_ANDROID];
      },

      /**
          * Returns the UI component for configuring the specified debugger type and action.
          */
      getComponent: (
      debuggerTypeName,
      configIsValidChanged) =>
      {
        if (action === 'launch') {
          return (
            _react.createElement((_AndroidLaunchComponent || _load_AndroidLaunchComponent()).AndroidLaunchComponent, {
              targetUri: this.getTargetUri(),
              configIsValidChanged: configIsValidChanged }));


        } else {if (!(

          action === 'attach')) {throw new Error(
            'Unrecognized action: ' + action + ' for component');}

          return (
            _react.createElement((_AndroidAttachComponent || _load_AndroidAttachComponent()).AndroidAttachComponent, {
              targetUri: this.getTargetUri(),
              configIsValidChanged: configIsValidChanged }));


        }
      } };

  }

  dispose() {}}exports.JavaLaunchAttachProvider = JavaLaunchAttachProvider;