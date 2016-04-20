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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaEF0dGFjaFN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBZ0J5QixNQUFNOztzQkFDSixRQUFROzt5QkFDRSxhQUFhOztBQUVsRCxJQUFNLCtCQUErQixHQUFHLGlDQUFpQyxDQUFDOztJQUU3RCxpQkFBaUI7QUFNakIsV0FOQSxpQkFBaUIsQ0FNaEIsVUFBc0IsRUFBRTswQkFOekIsaUJBQWlCOztBQU8xQixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNsRixRQUFJLENBQUMsYUFBYSxHQUFHLDBCQUFrQixDQUFDO0FBQ3hDLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7R0FDOUI7O2VBWFUsaUJBQWlCOztXQWFyQixtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFd0IsbUNBQUMsUUFBb0IsRUFBZTs7O0FBQzNELFVBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLCtCQUErQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2pFLGFBQU8scUJBQ0w7ZUFBTSxNQUFLLGFBQWEsQ0FBQyxjQUFjLENBQUMsK0JBQStCLEVBQUUsUUFBUSxDQUFDO09BQUEsQ0FDbkYsQ0FBQztLQUNIOzs7V0FFYSx3QkFBQyxJQUFxQyxFQUFRO0FBQzFELGNBQVEsSUFBSSxDQUFDLFVBQVU7QUFDckIsYUFBSyxrQ0FBdUIseUJBQXlCO0FBQ25ELGNBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3BDLGNBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDekQsZ0JBQU07QUFBQSxPQUNUO0tBQ0Y7OztXQUVtQixnQ0FBNEI7QUFDOUMsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7S0FDaEM7OztTQW5DVSxpQkFBaUIiLCJmaWxlIjoiTGF1bmNoQXR0YWNoU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEF0dGFjaFRhcmdldEluZm8sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5cbmltcG9ydCB7RGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7TGF1bmNoQXR0YWNoQWN0aW9uQ29kZX0gZnJvbSAnLi9Db25zdGFudHMnO1xuXG5jb25zdCBBVFRBQ0hfVEFSR0VUX0xJU1RfQ0hBTkdFX0VWRU5UID0gJ0FUVEFDSF9UQVJHRVRfTElTVF9DSEFOR0VfRVZFTlQnO1xuXG5leHBvcnQgY2xhc3MgTGF1bmNoQXR0YWNoU3RvcmUge1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2Rpc3BhdGNoZXJUb2tlbjogYW55O1xuICBfYXR0YWNoVGFyZ2V0SW5mb3M6IEFycmF5PEF0dGFjaFRhcmdldEluZm8+O1xuICBfZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG5cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXJUb2tlbiA9IHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5faGFuZGxlQWN0aW9ucy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fYXR0YWNoVGFyZ2V0SW5mb3MgPSBbXTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuX2Rpc3BhdGNoZXJUb2tlbik7XG4gIH1cblxuICBvbkF0dGFjaFRhcmdldExpc3RDaGFuZ2VkKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlci5vbihBVFRBQ0hfVEFSR0VUX0xJU1RfQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKFxuICAgICAgKCkgPT4gdGhpcy5fZXZlbnRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKEFUVEFDSF9UQVJHRVRfTElTVF9DSEFOR0VfRVZFTlQsIGNhbGxiYWNrKVxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlQWN0aW9ucyhhcmdzOiB7YWN0aW9uVHlwZTogc3RyaW5nOyBkYXRhOiBhbnl9KTogdm9pZCB7XG4gICAgc3dpdGNoIChhcmdzLmFjdGlvblR5cGUpIHtcbiAgICAgIGNhc2UgTGF1bmNoQXR0YWNoQWN0aW9uQ29kZS5VUERBVEVfQVRUQUNIX1RBUkdFVF9MSVNUOlxuICAgICAgICB0aGlzLl9hdHRhY2hUYXJnZXRJbmZvcyA9IGFyZ3MuZGF0YTtcbiAgICAgICAgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXQoQVRUQUNIX1RBUkdFVF9MSVNUX0NIQU5HRV9FVkVOVCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGdldEF0dGFjaFRhcmdldEluZm9zKCk6IEFycmF5PEF0dGFjaFRhcmdldEluZm8+IHtcbiAgICByZXR1cm4gdGhpcy5fYXR0YWNoVGFyZ2V0SW5mb3M7XG4gIH1cbn1cbiJdfQ==