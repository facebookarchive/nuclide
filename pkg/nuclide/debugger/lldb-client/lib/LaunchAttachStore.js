Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _events = require('events');

var _Constants = require('./Constants');

var ATTACH_TARGET_LIST_CHANGE_EVENT = 'ATTACH_TARGET_LIST_CHANGE_EVENT';

var LaunchAttachStore = (function () {
  function LaunchAttachStore(dispatcher) {
    _classCallCheck(this, LaunchAttachStore);

    this._dispatcher = dispatcher;
    this._dispatcherToken = this._dispatcher.register(this._handleActions.bind(this));
    this._eventEmitter = new _events.EventEmitter();
    this._attachTargetInfos = [];
  }

  _createClass(LaunchAttachStore, [{
    key: 'dispose',
    value: function dispose() {
      this._dispatcher.unregister(this._dispatcherToken);
    }
  }, {
    key: 'onAttachTargetListChanged',
    value: function onAttachTargetListChanged(callback) {
      var _this = this;

      this._eventEmitter.on(ATTACH_TARGET_LIST_CHANGE_EVENT, callback);
      return new _atom.Disposable(function () {
        return _this._eventEmitter.removeListener(ATTACH_TARGET_LIST_CHANGE_EVENT, callback);
      });
    }
  }, {
    key: '_handleActions',
    value: function _handleActions(args) {
      switch (args.actionType) {
        case _Constants.LaunchAttachActionCode.UPDATE_ATTACH_TARGET_LIST:
          this._attachTargetInfos = args.data;
          this._eventEmitter.emit(ATTACH_TARGET_LIST_CHANGE_EVENT);
          break;
      }
    }
  }, {
    key: 'getAttachTargetInfos',
    value: function getAttachTargetInfos() {
      return this._attachTargetInfos;
    }
  }]);

  return LaunchAttachStore;
})();

exports.LaunchAttachStore = LaunchAttachStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaEF0dGFjaFN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBY3lCLE1BQU07O3NCQUNKLFFBQVE7O3lCQUNFLGFBQWE7O0FBRWxELElBQU0sK0JBQStCLEdBQUcsaUNBQWlDLENBQUM7O0lBRTdELGlCQUFpQjtBQU1qQixXQU5BLGlCQUFpQixDQU1oQixVQUFzQixFQUFFOzBCQU56QixpQkFBaUI7O0FBTzFCLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2xGLFFBQUksQ0FBQyxhQUFhLEdBQUcsMEJBQWtCLENBQUM7QUFDeEMsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztHQUM5Qjs7ZUFYVSxpQkFBaUI7O1dBYXJCLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDcEQ7OztXQUV3QixtQ0FBQyxRQUFvQixFQUFlOzs7QUFDM0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsK0JBQStCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDakUsYUFBTyxxQkFDTDtlQUFNLE1BQUssYUFBYSxDQUFDLGNBQWMsQ0FBQywrQkFBK0IsRUFBRSxRQUFRLENBQUM7T0FBQSxDQUNuRixDQUFDO0tBQ0g7OztXQUVhLHdCQUFDLElBQXFDLEVBQVE7QUFDMUQsY0FBUSxJQUFJLENBQUMsVUFBVTtBQUNyQixhQUFLLGtDQUF1Qix5QkFBeUI7QUFDbkQsY0FBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDcEMsY0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUN6RCxnQkFBTTtBQUFBLE9BQ1Q7S0FDRjs7O1dBRW1CLGdDQUE0QjtBQUM5QyxhQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztLQUNoQzs7O1NBbkNVLGlCQUFpQiIsImZpbGUiOiJMYXVuY2hBdHRhY2hTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtBdHRhY2hUYXJnZXRJbmZvfSBmcm9tICcuLi8uLi9sbGRiLXNlcnZlci9saWIvRGVidWdnZXJScGNTZXJ2aWNlSW50ZXJmYWNlJztcbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHtMYXVuY2hBdHRhY2hBY3Rpb25Db2RlfSBmcm9tICcuL0NvbnN0YW50cyc7XG5cbmNvbnN0IEFUVEFDSF9UQVJHRVRfTElTVF9DSEFOR0VfRVZFTlQgPSAnQVRUQUNIX1RBUkdFVF9MSVNUX0NIQU5HRV9FVkVOVCc7XG5cbmV4cG9ydCBjbGFzcyBMYXVuY2hBdHRhY2hTdG9yZSB7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfZGlzcGF0Y2hlclRva2VuOiBhbnk7XG4gIF9hdHRhY2hUYXJnZXRJbmZvczogQXJyYXk8QXR0YWNoVGFyZ2V0SW5mbz47XG4gIF9ldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcblxuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyOiBEaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5fZGlzcGF0Y2hlclRva2VuID0gdGhpcy5fZGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLl9oYW5kbGVBY3Rpb25zLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9hdHRhY2hUYXJnZXRJbmZvcyA9IFtdO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5fZGlzcGF0Y2hlclRva2VuKTtcbiAgfVxuXG4gIG9uQXR0YWNoVGFyZ2V0TGlzdENoYW5nZWQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLm9uKEFUVEFDSF9UQVJHRVRfTElTVF9DSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoXG4gICAgICAoKSA9PiB0aGlzLl9ldmVudEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoQVRUQUNIX1RBUkdFVF9MSVNUX0NIQU5HRV9FVkVOVCwgY2FsbGJhY2spXG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVBY3Rpb25zKGFyZ3M6IHthY3Rpb25UeXBlOiBzdHJpbmc7IGRhdGE6IGFueX0pOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGFyZ3MuYWN0aW9uVHlwZSkge1xuICAgICAgY2FzZSBMYXVuY2hBdHRhY2hBY3Rpb25Db2RlLlVQREFURV9BVFRBQ0hfVEFSR0VUX0xJU1Q6XG4gICAgICAgIHRoaXMuX2F0dGFjaFRhcmdldEluZm9zID0gYXJncy5kYXRhO1xuICAgICAgICB0aGlzLl9ldmVudEVtaXR0ZXIuZW1pdChBVFRBQ0hfVEFSR0VUX0xJU1RfQ0hBTkdFX0VWRU5UKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZ2V0QXR0YWNoVGFyZ2V0SW5mb3MoKTogQXJyYXk8QXR0YWNoVGFyZ2V0SW5mbz4ge1xuICAgIHJldHVybiB0aGlzLl9hdHRhY2hUYXJnZXRJbmZvcztcbiAgfVxufVxuIl19