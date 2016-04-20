Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _reactForAtom = require('react-for-atom');

var _LaunchUiComponent = require('./LaunchUiComponent');

var _AttachUiComponent = require('./AttachUiComponent');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var HhvmLaunchAttachProvider = (function (_DebuggerLaunchAttachProvider) {
  _inherits(HhvmLaunchAttachProvider, _DebuggerLaunchAttachProvider);

  function HhvmLaunchAttachProvider(debuggingTypeName, targetUri) {
    _classCallCheck(this, HhvmLaunchAttachProvider);

    _get(Object.getPrototypeOf(HhvmLaunchAttachProvider.prototype), 'constructor', this).call(this, debuggingTypeName, targetUri);
  }

  _createClass(HhvmLaunchAttachProvider, [{
    key: 'getActions',
    value: function getActions() {
      return ['Attach', 'Launch'];
    }
  }, {
    key: 'getComponent',
    value: function getComponent(action) {
      if (action === 'Launch') {
        return _reactForAtom.React.createElement(_LaunchUiComponent.LaunchUiComponent, { targetUri: this.getTargetUri() });
      } else if (action === 'Attach') {
        return _reactForAtom.React.createElement(_AttachUiComponent.AttachUiComponent, { targetUri: this.getTargetUri() });
      } else {
        (0, _assert2['default'])(false, 'Unrecognized action for component.');
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return HhvmLaunchAttachProvider;
})(_nuclideDebuggerAtom.DebuggerLaunchAttachProvider);

exports.HhvmLaunchAttachProvider = HhvmLaunchAttachProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhodm1MYXVuY2hBdHRhY2hQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21DQVcyQyw2QkFBNkI7OzRCQUNwRCxnQkFBZ0I7O2lDQUNKLHFCQUFxQjs7aUNBQ3JCLHFCQUFxQjs7c0JBQy9CLFFBQVE7Ozs7SUFFakIsd0JBQXdCO1lBQXhCLHdCQUF3Qjs7QUFDeEIsV0FEQSx3QkFBd0IsQ0FDdkIsaUJBQXlCLEVBQUUsU0FBaUIsRUFBRTswQkFEL0Msd0JBQXdCOztBQUVqQywrQkFGUyx3QkFBd0IsNkNBRTNCLGlCQUFpQixFQUFFLFNBQVMsRUFBRTtHQUNyQzs7ZUFIVSx3QkFBd0I7O1dBS3pCLHNCQUFrQjtBQUMxQixhQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzdCOzs7V0FFVyxzQkFBQyxNQUFjLEVBQWtCO0FBQzNDLFVBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUN2QixlQUFPLDBFQUFtQixTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxBQUFDLEdBQUcsQ0FBQztPQUM5RCxNQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM5QixlQUFPLDBFQUFtQixTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxBQUFDLEdBQUcsQ0FBQztPQUM5RCxNQUFNO0FBQ0wsaUNBQVUsS0FBSyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7T0FDeEQ7S0FDRjs7O1dBRU0sbUJBQVMsRUFBRTs7O1NBbkJQLHdCQUF3QiIsImZpbGUiOiJIaHZtTGF1bmNoQXR0YWNoUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0RlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0xhdW5jaFVpQ29tcG9uZW50fSBmcm9tICcuL0xhdW5jaFVpQ29tcG9uZW50JztcbmltcG9ydCB7QXR0YWNoVWlDb21wb25lbnR9IGZyb20gJy4vQXR0YWNoVWlDb21wb25lbnQnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5leHBvcnQgY2xhc3MgSGh2bUxhdW5jaEF0dGFjaFByb3ZpZGVyIGV4dGVuZHMgRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKGRlYnVnZ2luZ1R5cGVOYW1lOiBzdHJpbmcsIHRhcmdldFVyaTogc3RyaW5nKSB7XG4gICAgc3VwZXIoZGVidWdnaW5nVHlwZU5hbWUsIHRhcmdldFVyaSk7XG4gIH1cblxuICBnZXRBY3Rpb25zKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiBbJ0F0dGFjaCcsICdMYXVuY2gnXTtcbiAgfVxuXG4gIGdldENvbXBvbmVudChhY3Rpb246IHN0cmluZyk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAoYWN0aW9uID09PSAnTGF1bmNoJykge1xuICAgICAgcmV0dXJuIDxMYXVuY2hVaUNvbXBvbmVudCB0YXJnZXRVcmk9e3RoaXMuZ2V0VGFyZ2V0VXJpKCl9IC8+O1xuICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnQXR0YWNoJykge1xuICAgICAgcmV0dXJuIDxBdHRhY2hVaUNvbXBvbmVudCB0YXJnZXRVcmk9e3RoaXMuZ2V0VGFyZ2V0VXJpKCl9IC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnZhcmlhbnQoZmFsc2UsICdVbnJlY29nbml6ZWQgYWN0aW9uIGZvciBjb21wb25lbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHt9XG59XG4iXX0=