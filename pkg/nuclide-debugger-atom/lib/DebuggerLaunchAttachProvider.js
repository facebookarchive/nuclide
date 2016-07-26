var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var uniqueKeySeed = 0;

/**
 * Base class of all launch/attach providers.
 * It allows each concrete provider to provide customized debugging types, actions and UI.
 */

var DebuggerLaunchAttachProvider = (function () {
  function DebuggerLaunchAttachProvider(debuggingTypeName, targetUri) {
    _classCallCheck(this, DebuggerLaunchAttachProvider);

    this._debuggingTypeName = debuggingTypeName;
    this._targetUri = targetUri;
    this._uniqueKey = uniqueKeySeed++;
  }

  /**
   * Returns a unique key which can be associated with the component.
   */

  _createClass(DebuggerLaunchAttachProvider, [{
    key: 'getUniqueKey',
    value: function getUniqueKey() {
      return this._uniqueKey;
    }

    /**
     * Returns the debugging type name for this provider(e.g. Natve, Php, Node etc...).
     */
  }, {
    key: 'getDebuggingTypeName',
    value: function getDebuggingTypeName() {
      return this._debuggingTypeName;
    }

    /**
     * Returns target uri for this provider.
     */
  }, {
    key: 'getTargetUri',
    value: function getTargetUri() {
      return this._targetUri;
    }

    /**
     * Returns a list of supported debugger actions.
     */
  }, {
    key: 'getActions',
    value: function getActions() {
      throw new Error('abstract method');
    }

    /**
     * Returns the UI component for input debug action.
     */
  }, {
    key: 'getComponent',
    value: function getComponent(action) {
      throw new Error('abstract method');
    }

    /**
     * Dispose any resource held by this provider.
     */
  }, {
    key: 'dispose',
    value: function dispose() {
      throw new Error('abstract method');
    }
  }]);

  return DebuggerLaunchAttachProvider;
})();

module.exports = DebuggerLaunchAttachProvider;