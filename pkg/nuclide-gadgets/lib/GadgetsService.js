var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var GadgetsService = (function () {
  function GadgetsService(commands) {
    _classCallCheck(this, GadgetsService);

    this._commands = commands;
  }

  _createClass(GadgetsService, [{
    key: 'destroyGadget',
    value: function destroyGadget(gadgetId) {
      this._commands.destroyGadget(gadgetId);
    }
  }, {
    key: 'registerGadget',
    value: function registerGadget(gadget) {
      var _this = this;

      this._commands.registerGadget(gadget);
      return new _atom.Disposable(function () {
        _this._commands.unregisterGadget(gadget.gadgetId);
      });
    }
  }, {
    key: 'showGadget',
    value: function showGadget(gadgetId) {
      this._commands.showGadget(gadgetId);
    }
  }]);

  return GadgetsService;
})();

module.exports = GadgetsService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdhZGdldHNTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFjeUIsTUFBTTs7SUFFekIsY0FBYztBQUlQLFdBSlAsY0FBYyxDQUlOLFFBQWtCLEVBQUU7MEJBSjVCLGNBQWM7O0FBS2hCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0dBQzNCOztlQU5HLGNBQWM7O1dBUUwsdUJBQUMsUUFBZ0IsRUFBUTtBQUNwQyxVQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN4Qzs7O1dBRWEsd0JBQUMsTUFBYyxFQUFlOzs7QUFDMUMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLGNBQUssU0FBUyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNsRCxDQUFDLENBQUM7S0FDSjs7O1dBRVMsb0JBQUMsUUFBZ0IsRUFBUTtBQUNqQyxVQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNyQzs7O1NBckJHLGNBQWM7OztBQXlCcEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoiR2FkZ2V0c1NlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBDb21tYW5kcyBmcm9tICcuL0NvbW1hbmRzJztcbmltcG9ydCB0eXBlIHtHYWRnZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtZ2FkZ2V0cy1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuY2xhc3MgR2FkZ2V0c1NlcnZpY2Uge1xuXG4gIF9jb21tYW5kczogQ29tbWFuZHM7XG5cbiAgY29uc3RydWN0b3IoY29tbWFuZHM6IENvbW1hbmRzKSB7XG4gICAgdGhpcy5fY29tbWFuZHMgPSBjb21tYW5kcztcbiAgfVxuXG4gIGRlc3Ryb3lHYWRnZXQoZ2FkZ2V0SWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmRzLmRlc3Ryb3lHYWRnZXQoZ2FkZ2V0SWQpO1xuICB9XG5cbiAgcmVnaXN0ZXJHYWRnZXQoZ2FkZ2V0OiBHYWRnZXQpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fY29tbWFuZHMucmVnaXN0ZXJHYWRnZXQoZ2FkZ2V0KTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fY29tbWFuZHMudW5yZWdpc3RlckdhZGdldChnYWRnZXQuZ2FkZ2V0SWQpO1xuICAgIH0pO1xuICB9XG5cbiAgc2hvd0dhZGdldChnYWRnZXRJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY29tbWFuZHMuc2hvd0dhZGdldChnYWRnZXRJZCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhZGdldHNTZXJ2aWNlO1xuIl19