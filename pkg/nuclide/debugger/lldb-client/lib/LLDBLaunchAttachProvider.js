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
  }

  _createClass(LLDBLaunchAttachProvider, [{
    key: 'getActions',
    value: function getActions() {
      return ['Attach', 'Launch'];
    }
  }, {
    key: 'getComponent',
    value: function getComponent(action) {
      var dispatcher = new _flux.Dispatcher();
      var actions = new _LaunchAttachActions.LaunchAttachActions(dispatcher, this.getTargetUri());
      var store = new _LaunchAttachStore.LaunchAttachStore(dispatcher);
      if (action === 'Launch') {
        return _reactForAtom.React.createElement(_LaunchUIComponent.LaunchUIComponent, { store: store, actions: actions });
      } else if (action === 'Attach') {
        return _reactForAtom.React.createElement(_AttachUIComponent.AttachUIComponent, { store: store, actions: actions });
      } else {
        return null;
      }
    }
  }]);

  return LLDBLaunchAttachProvider;
})(_atom.DebuggerLaunchAttachProvider);

exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxMREJMYXVuY2hBdHRhY2hQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFXMkMsWUFBWTs7NEJBQ25DLGdCQUFnQjs7b0JBQ1gsTUFBTTs7aUNBQ0MscUJBQXFCOztpQ0FDckIscUJBQXFCOztpQ0FDckIscUJBQXFCOzttQ0FDbkIsdUJBQXVCOztJQUU1Qyx3QkFBd0I7WUFBeEIsd0JBQXdCOztBQUN4QixXQURBLHdCQUF3QixDQUN2QixpQkFBeUIsRUFBRSxTQUFpQixFQUFFOzBCQUQvQyx3QkFBd0I7O0FBRWpDLCtCQUZTLHdCQUF3Qiw2Q0FFM0IsaUJBQWlCLEVBQUUsU0FBUyxFQUFFO0dBQ3JDOztlQUhVLHdCQUF3Qjs7V0FLekIsc0JBQWtCO0FBQzFCLGFBQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDN0I7OztXQUVXLHNCQUFDLE1BQWMsRUFBaUI7QUFDMUMsVUFBTSxVQUFVLEdBQUcsc0JBQWdCLENBQUM7QUFDcEMsVUFBTSxPQUFPLEdBQUcsNkNBQXdCLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUN6RSxVQUFNLEtBQUssR0FBRyx5Q0FBc0IsVUFBVSxDQUFDLENBQUM7QUFDaEQsVUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQ3ZCLGVBQU8sMEVBQW1CLEtBQUssRUFBRSxLQUFLLEFBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxBQUFDLEdBQUcsQ0FBQztPQUM5RCxNQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM5QixlQUFPLDBFQUFtQixLQUFLLEVBQUUsS0FBSyxBQUFDLEVBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQyxHQUFHLENBQUM7T0FDOUQsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7O1NBcEJVLHdCQUF3QiIsImZpbGUiOiJMTERCTGF1bmNoQXR0YWNoUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0RlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXJ9IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB7TGF1bmNoQXR0YWNoU3RvcmV9IGZyb20gJy4vTGF1bmNoQXR0YWNoU3RvcmUnO1xuaW1wb3J0IHtMYXVuY2hVSUNvbXBvbmVudH0gZnJvbSAnLi9MYXVuY2hVSUNvbXBvbmVudCc7XG5pbXBvcnQge0F0dGFjaFVJQ29tcG9uZW50fSBmcm9tICcuL0F0dGFjaFVJQ29tcG9uZW50JztcbmltcG9ydCB7TGF1bmNoQXR0YWNoQWN0aW9uc30gZnJvbSAnLi9MYXVuY2hBdHRhY2hBY3Rpb25zJztcblxuZXhwb3J0IGNsYXNzIExMREJMYXVuY2hBdHRhY2hQcm92aWRlciBleHRlbmRzIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcihkZWJ1Z2dpbmdUeXBlTmFtZTogc3RyaW5nLCB0YXJnZXRVcmk6IHN0cmluZykge1xuICAgIHN1cGVyKGRlYnVnZ2luZ1R5cGVOYW1lLCB0YXJnZXRVcmkpO1xuICB9XG5cbiAgZ2V0QWN0aW9ucygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gWydBdHRhY2gnLCAnTGF1bmNoJ107XG4gIH1cblxuICBnZXRDb21wb25lbnQoYWN0aW9uOiBzdHJpbmcpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICBjb25zdCBhY3Rpb25zID0gbmV3IExhdW5jaEF0dGFjaEFjdGlvbnMoZGlzcGF0Y2hlciwgdGhpcy5nZXRUYXJnZXRVcmkoKSk7XG4gICAgY29uc3Qgc3RvcmUgPSBuZXcgTGF1bmNoQXR0YWNoU3RvcmUoZGlzcGF0Y2hlcik7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ0xhdW5jaCcpIHtcbiAgICAgIHJldHVybiA8TGF1bmNoVUlDb21wb25lbnQgc3RvcmU9e3N0b3JlfSBhY3Rpb25zPXthY3Rpb25zfSAvPjtcbiAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ0F0dGFjaCcpIHtcbiAgICAgIHJldHVybiA8QXR0YWNoVUlDb21wb25lbnQgc3RvcmU9e3N0b3JlfSBhY3Rpb25zPXthY3Rpb25zfSAvPjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=