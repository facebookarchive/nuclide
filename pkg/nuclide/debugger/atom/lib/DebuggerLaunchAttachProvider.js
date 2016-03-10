var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Base class of all launch/attach providers.
 * It allows each concrete provider to provide customized debugging types, actions and UI.
 */

var DebuggerLaunchAttachProvider = (function () {
  function DebuggerLaunchAttachProvider(debuggingTypeName, targetUri) {
    _classCallCheck(this, DebuggerLaunchAttachProvider);

    this._debuggingTypeName = debuggingTypeName;
    this._targetUri = targetUri;
  }

  /**
   * Returns the debugging type name for this provider(e.g. Natve, Php, Node etc...).
   */

  _createClass(DebuggerLaunchAttachProvider, [{
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
  }]);

  return DebuggerLaunchAttachProvider;
})();

module.exports = DebuggerLaunchAttachProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpQk0sNEJBQTRCO0FBSXJCLFdBSlAsNEJBQTRCLENBSXBCLGlCQUF5QixFQUFFLFNBQXFCLEVBQUU7MEJBSjFELDRCQUE0Qjs7QUFLOUIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO0FBQzVDLFFBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0dBQzdCOzs7Ozs7ZUFQRyw0QkFBNEI7O1dBWVosZ0NBQVc7QUFDN0IsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7S0FDaEM7Ozs7Ozs7V0FLVyx3QkFBZTtBQUN6QixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDeEI7Ozs7Ozs7V0FLUyxzQkFBa0I7QUFDMUIsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs7O1dBS1csc0JBQUMsTUFBYyxFQUFpQjtBQUMxQyxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7OztTQW5DRyw0QkFBNEI7OztBQXNDbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyw0QkFBNEIsQ0FBQyIsImZpbGUiOiJEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuXG4vKlxuICogQmFzZSBjbGFzcyBvZiBhbGwgbGF1bmNoL2F0dGFjaCBwcm92aWRlcnMuXG4gKiBJdCBhbGxvd3MgZWFjaCBjb25jcmV0ZSBwcm92aWRlciB0byBwcm92aWRlIGN1c3RvbWl6ZWQgZGVidWdnaW5nIHR5cGVzLCBhY3Rpb25zIGFuZCBVSS5cbiAqL1xuY2xhc3MgRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlciB7XG4gIF9kZWJ1Z2dpbmdUeXBlTmFtZTogc3RyaW5nO1xuICBfdGFyZ2V0VXJpOiBOdWNsaWRlVXJpO1xuXG4gIGNvbnN0cnVjdG9yKGRlYnVnZ2luZ1R5cGVOYW1lOiBzdHJpbmcsIHRhcmdldFVyaTogTnVjbGlkZVVyaSkge1xuICAgIHRoaXMuX2RlYnVnZ2luZ1R5cGVOYW1lID0gZGVidWdnaW5nVHlwZU5hbWU7XG4gICAgdGhpcy5fdGFyZ2V0VXJpID0gdGFyZ2V0VXJpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlYnVnZ2luZyB0eXBlIG5hbWUgZm9yIHRoaXMgcHJvdmlkZXIoZS5nLiBOYXR2ZSwgUGhwLCBOb2RlIGV0Yy4uLikuXG4gICAqL1xuICBnZXREZWJ1Z2dpbmdUeXBlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9kZWJ1Z2dpbmdUeXBlTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRhcmdldCB1cmkgZm9yIHRoaXMgcHJvdmlkZXIuXG4gICAqL1xuICBnZXRUYXJnZXRVcmkoKTogTnVjbGlkZVVyaSB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldFVyaTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBzdXBwb3J0ZWQgZGVidWdnZXIgYWN0aW9ucy5cbiAgICovXG4gIGdldEFjdGlvbnMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnN0cmFjdCBtZXRob2QnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBVSSBjb21wb25lbnQgZm9yIGlucHV0IGRlYnVnIGFjdGlvbi5cbiAgICovXG4gIGdldENvbXBvbmVudChhY3Rpb246IHN0cmluZyk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHRocm93IG5ldyBFcnJvcignYWJzdHJhY3QgbWV0aG9kJyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyO1xuIl19