var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactForAtom = require('react-for-atom');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzRCQWFvQixnQkFBZ0I7O0FBRXBDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQzs7Ozs7OztJQU1oQiw0QkFBNEI7QUFLckIsV0FMUCw0QkFBNEIsQ0FLcEIsaUJBQXlCLEVBQUUsU0FBcUIsRUFBRTswQkFMMUQsNEJBQTRCOztBQU05QixRQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7QUFDNUMsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDNUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQztHQUNuQzs7Ozs7O2VBVEcsNEJBQTRCOztXQWNwQix3QkFBVztBQUNyQixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDeEI7Ozs7Ozs7V0FLbUIsZ0NBQVc7QUFDN0IsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7S0FDaEM7Ozs7Ozs7V0FLVyx3QkFBZTtBQUN6QixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDeEI7Ozs7Ozs7V0FLUyxzQkFBa0I7QUFDMUIsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs7O1dBS1csc0JBQUMsTUFBYyxFQUFrQjtBQUMzQyxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7Ozs7Ozs7V0FLTSxtQkFBUztBQUNkLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1NBbkRHLDRCQUE0Qjs7O0FBc0RsQyxNQUFNLENBQUMsT0FBTyxHQUFHLDRCQUE0QixDQUFDIiwiZmlsZSI6IkRlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5sZXQgdW5pcXVlS2V5U2VlZCA9IDA7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBvZiBhbGwgbGF1bmNoL2F0dGFjaCBwcm92aWRlcnMuXG4gKiBJdCBhbGxvd3MgZWFjaCBjb25jcmV0ZSBwcm92aWRlciB0byBwcm92aWRlIGN1c3RvbWl6ZWQgZGVidWdnaW5nIHR5cGVzLCBhY3Rpb25zIGFuZCBVSS5cbiAqL1xuY2xhc3MgRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlciB7XG4gIF9kZWJ1Z2dpbmdUeXBlTmFtZTogc3RyaW5nO1xuICBfdGFyZ2V0VXJpOiBOdWNsaWRlVXJpO1xuICBfdW5pcXVlS2V5OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoZGVidWdnaW5nVHlwZU5hbWU6IHN0cmluZywgdGFyZ2V0VXJpOiBOdWNsaWRlVXJpKSB7XG4gICAgdGhpcy5fZGVidWdnaW5nVHlwZU5hbWUgPSBkZWJ1Z2dpbmdUeXBlTmFtZTtcbiAgICB0aGlzLl90YXJnZXRVcmkgPSB0YXJnZXRVcmk7XG4gICAgdGhpcy5fdW5pcXVlS2V5ID0gdW5pcXVlS2V5U2VlZCsrO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB1bmlxdWUga2V5IHdoaWNoIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGdldFVuaXF1ZUtleSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl91bmlxdWVLZXk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGVidWdnaW5nIHR5cGUgbmFtZSBmb3IgdGhpcyBwcm92aWRlcihlLmcuIE5hdHZlLCBQaHAsIE5vZGUgZXRjLi4uKS5cbiAgICovXG4gIGdldERlYnVnZ2luZ1R5cGVOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2RlYnVnZ2luZ1R5cGVOYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGFyZ2V0IHVyaSBmb3IgdGhpcyBwcm92aWRlci5cbiAgICovXG4gIGdldFRhcmdldFVyaSgpOiBOdWNsaWRlVXJpIHtcbiAgICByZXR1cm4gdGhpcy5fdGFyZ2V0VXJpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIHN1cHBvcnRlZCBkZWJ1Z2dlciBhY3Rpb25zLlxuICAgKi9cbiAgZ2V0QWN0aW9ucygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFVJIGNvbXBvbmVudCBmb3IgaW5wdXQgZGVidWcgYWN0aW9uLlxuICAgKi9cbiAgZ2V0Q29tcG9uZW50KGFjdGlvbjogc3RyaW5nKTogP1JlYWN0LkVsZW1lbnQge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZSBhbnkgcmVzb3VyY2UgaGVsZCBieSB0aGlzIHByb3ZpZGVyLlxuICAgKi9cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fic3RyYWN0IG1ldGhvZCcpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcjtcbiJdfQ==