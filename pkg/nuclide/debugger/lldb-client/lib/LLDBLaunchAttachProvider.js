Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('../../atom');

var _reactForAtom = require('react-for-atom');

var _flux = require('flux');

var _LaunchAttachStore = require('./LaunchAttachStore');

var _LaunchUIComponent = require('./LaunchUIComponent');

var _AttachUIComponent = require('./AttachUIComponent');

var _LaunchAttachActions = require('./LaunchAttachActions');

var LLDBLaunchAttachProvider = (function (_DebuggerLaunchAttachProvider) {
  _inherits(LLDBLaunchAttachProvider, _DebuggerLaunchAttachProvider);

  function LLDBLaunchAttachProvider(debuggingTypeName, targetUri) {
    _classCallCheck(this, LLDBLaunchAttachProvider);

    _get(Object.getPrototypeOf(LLDBLaunchAttachProvider.prototype), 'constructor', this).call(this, debuggingTypeName, targetUri);
    this._dispatcher = new _flux.Dispatcher();
    this._actions = new _LaunchAttachActions.LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new _LaunchAttachStore.LaunchAttachStore(this._dispatcher);
  }

  _createClass(LLDBLaunchAttachProvider, [{
    key: 'getActions',
    value: function getActions() {
      return ['Attach', 'Launch'];
    }
  }, {
    key: 'getComponent',
    value: function getComponent(action) {
      if (action === 'Launch') {
        return _reactForAtom.React.createElement(_LaunchUIComponent.LaunchUIComponent, { store: this._store, actions: this._actions });
      } else if (action === 'Attach') {
        this._actions.updateAttachTargetList();
        return _reactForAtom.React.createElement(_AttachUIComponent.AttachUIComponent, { store: this._store, actions: this._actions });
      } else {
        return null;
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._store.dispose();
    }
  }]);

  return LLDBLaunchAttachProvider;
})(_atom.DebuggerLaunchAttachProvider);

exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxMREJMYXVuY2hBdHRhY2hQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFXMkMsWUFBWTs7NEJBQ25DLGdCQUFnQjs7b0JBQ1gsTUFBTTs7aUNBQ0MscUJBQXFCOztpQ0FDckIscUJBQXFCOztpQ0FDckIscUJBQXFCOzttQ0FDbkIsdUJBQXVCOztJQUU1Qyx3QkFBd0I7WUFBeEIsd0JBQXdCOztBQUt4QixXQUxBLHdCQUF3QixDQUt2QixpQkFBeUIsRUFBRSxTQUFpQixFQUFFOzBCQUwvQyx3QkFBd0I7O0FBTWpDLCtCQU5TLHdCQUF3Qiw2Q0FNM0IsaUJBQWlCLEVBQUUsU0FBUyxFQUFFO0FBQ3BDLFFBQUksQ0FBQyxXQUFXLEdBQUcsc0JBQWdCLENBQUM7QUFDcEMsUUFBSSxDQUFDLFFBQVEsR0FBRyw2Q0FBd0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUMvRSxRQUFJLENBQUMsTUFBTSxHQUFHLHlDQUFzQixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDdkQ7O2VBVlUsd0JBQXdCOztXQVl6QixzQkFBa0I7QUFDMUIsYUFBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM3Qjs7O1dBRVcsc0JBQUMsTUFBYyxFQUFpQjtBQUMxQyxVQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDdkIsZUFBTywwRUFBbUIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQUFBQyxHQUFHLENBQUM7T0FDMUUsTUFBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQ3ZDLGVBQU8sMEVBQW1CLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxBQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEFBQUMsR0FBRyxDQUFDO09BQzFFLE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN2Qjs7O1NBN0JVLHdCQUF3QiIsImZpbGUiOiJMTERCTGF1bmNoQXR0YWNoUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0RlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXJ9IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB7TGF1bmNoQXR0YWNoU3RvcmV9IGZyb20gJy4vTGF1bmNoQXR0YWNoU3RvcmUnO1xuaW1wb3J0IHtMYXVuY2hVSUNvbXBvbmVudH0gZnJvbSAnLi9MYXVuY2hVSUNvbXBvbmVudCc7XG5pbXBvcnQge0F0dGFjaFVJQ29tcG9uZW50fSBmcm9tICcuL0F0dGFjaFVJQ29tcG9uZW50JztcbmltcG9ydCB7TGF1bmNoQXR0YWNoQWN0aW9uc30gZnJvbSAnLi9MYXVuY2hBdHRhY2hBY3Rpb25zJztcblxuZXhwb3J0IGNsYXNzIExMREJMYXVuY2hBdHRhY2hQcm92aWRlciBleHRlbmRzIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIge1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2FjdGlvbnM6IExhdW5jaEF0dGFjaEFjdGlvbnM7XG4gIF9zdG9yZTogTGF1bmNoQXR0YWNoU3RvcmU7XG5cbiAgY29uc3RydWN0b3IoZGVidWdnaW5nVHlwZU5hbWU6IHN0cmluZywgdGFyZ2V0VXJpOiBzdHJpbmcpIHtcbiAgICBzdXBlcihkZWJ1Z2dpbmdUeXBlTmFtZSwgdGFyZ2V0VXJpKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICB0aGlzLl9hY3Rpb25zID0gbmV3IExhdW5jaEF0dGFjaEFjdGlvbnModGhpcy5fZGlzcGF0Y2hlciwgdGhpcy5nZXRUYXJnZXRVcmkoKSk7XG4gICAgdGhpcy5fc3RvcmUgPSBuZXcgTGF1bmNoQXR0YWNoU3RvcmUodGhpcy5fZGlzcGF0Y2hlcik7XG4gIH1cblxuICBnZXRBY3Rpb25zKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiBbJ0F0dGFjaCcsICdMYXVuY2gnXTtcbiAgfVxuXG4gIGdldENvbXBvbmVudChhY3Rpb246IHN0cmluZyk6ID9SZWFjdEVsZW1lbnQge1xuICAgIGlmIChhY3Rpb24gPT09ICdMYXVuY2gnKSB7XG4gICAgICByZXR1cm4gPExhdW5jaFVJQ29tcG9uZW50IHN0b3JlPXt0aGlzLl9zdG9yZX0gYWN0aW9ucz17dGhpcy5fYWN0aW9uc30gLz47XG4gICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdBdHRhY2gnKSB7XG4gICAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZUF0dGFjaFRhcmdldExpc3QoKTtcbiAgICAgIHJldHVybiA8QXR0YWNoVUlDb21wb25lbnQgc3RvcmU9e3RoaXMuX3N0b3JlfSBhY3Rpb25zPXt0aGlzLl9hY3Rpb25zfSAvPjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9yZS5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==