var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7O0lBTWhCLDRCQUE0QjtBQUtyQixXQUxQLDRCQUE0QixDQUtwQixpQkFBeUIsRUFBRSxTQUFxQixFQUFFOzBCQUwxRCw0QkFBNEI7O0FBTTlCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztBQUM1QyxRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixRQUFJLENBQUMsVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFDO0dBQ25DOzs7Ozs7ZUFURyw0QkFBNEI7O1dBY3BCLHdCQUFXO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztLQUN4Qjs7Ozs7OztXQUttQixnQ0FBVztBQUM3QixhQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztLQUNoQzs7Ozs7OztXQUtXLHdCQUFlO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztLQUN4Qjs7Ozs7OztXQUtTLHNCQUFrQjtBQUMxQixZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7Ozs7Ozs7V0FLVyxzQkFBQyxNQUFjLEVBQWlCO0FBQzFDLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7Ozs7OztXQUtNLG1CQUFTO0FBQ2QsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7U0FuREcsNEJBQTRCOzs7QUFzRGxDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsNEJBQTRCLENBQUMiLCJmaWxlIjoiRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcblxubGV0IHVuaXF1ZUtleVNlZWQgPSAwO1xuXG4vKipcbiAqIEJhc2UgY2xhc3Mgb2YgYWxsIGxhdW5jaC9hdHRhY2ggcHJvdmlkZXJzLlxuICogSXQgYWxsb3dzIGVhY2ggY29uY3JldGUgcHJvdmlkZXIgdG8gcHJvdmlkZSBjdXN0b21pemVkIGRlYnVnZ2luZyB0eXBlcywgYWN0aW9ucyBhbmQgVUkuXG4gKi9cbmNsYXNzIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIge1xuICBfZGVidWdnaW5nVHlwZU5hbWU6IHN0cmluZztcbiAgX3RhcmdldFVyaTogTnVjbGlkZVVyaTtcbiAgX3VuaXF1ZUtleTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGRlYnVnZ2luZ1R5cGVOYW1lOiBzdHJpbmcsIHRhcmdldFVyaTogTnVjbGlkZVVyaSkge1xuICAgIHRoaXMuX2RlYnVnZ2luZ1R5cGVOYW1lID0gZGVidWdnaW5nVHlwZU5hbWU7XG4gICAgdGhpcy5fdGFyZ2V0VXJpID0gdGFyZ2V0VXJpO1xuICAgIHRoaXMuX3VuaXF1ZUtleSA9IHVuaXF1ZUtleVNlZWQrKztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdW5pcXVlIGtleSB3aGljaCBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBnZXRVbmlxdWVLZXkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdW5pcXVlS2V5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlYnVnZ2luZyB0eXBlIG5hbWUgZm9yIHRoaXMgcHJvdmlkZXIoZS5nLiBOYXR2ZSwgUGhwLCBOb2RlIGV0Yy4uLikuXG4gICAqL1xuICBnZXREZWJ1Z2dpbmdUeXBlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9kZWJ1Z2dpbmdUeXBlTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRhcmdldCB1cmkgZm9yIHRoaXMgcHJvdmlkZXIuXG4gICAqL1xuICBnZXRUYXJnZXRVcmkoKTogTnVjbGlkZVVyaSB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldFVyaTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBzdXBwb3J0ZWQgZGVidWdnZXIgYWN0aW9ucy5cbiAgICovXG4gIGdldEFjdGlvbnMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBVSSBjb21wb25lbnQgZm9yIGlucHV0IGRlYnVnIGFjdGlvbi5cbiAgICovXG4gIGdldENvbXBvbmVudChhY3Rpb246IHN0cmluZyk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZSBhbnkgcmVzb3VyY2UgaGVsZCBieSB0aGlzIHByb3ZpZGVyLlxuICAgKi9cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcjtcbiJdfQ==