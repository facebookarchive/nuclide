var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var callDebugService = _asyncToGenerator(function* (processInfo) {
  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  var debuggerService = yield require('../../service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
  debuggerService.debugHhvm(processInfo);
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomInput = require('../../ui/atom-input');
var NuclideDropdown = require('../../ui/dropdown');

var _require = require('react-for-atom');

var React = _require.React;
var PropTypes = React.PropTypes;

var WEB_SERVER_OPTION = { label: 'WebServer', value: 0 };
var SCRIPT_OPTION = { label: 'Script', value: 1 };
var DEFAULT_OPTION_INDEX = WEB_SERVER_OPTION.value;

var DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];

var NO_LAUNCH_DEBUG_OPTIONS = [WEB_SERVER_OPTION];

var HhvmToolbar = (function (_React$Component) {
  _inherits(HhvmToolbar, _React$Component);

  _createClass(HhvmToolbar, null, [{
    key: 'propTypes',
    value: {
      targetFilePath: PropTypes.string.isRequired
    },
    enumerable: true
  }]);

  function HhvmToolbar(props) {
    _classCallCheck(this, HhvmToolbar);

    _get(Object.getPrototypeOf(HhvmToolbar.prototype), 'constructor', this).call(this, props);
    this.state = {
      selectedIndex: DEFAULT_OPTION_INDEX
    };
    this._debug = this._debug.bind(this);
    this._handleDropdownChange = this._handleDropdownChange.bind(this);
  }

  _createClass(HhvmToolbar, [{
    key: '_getMenuItems',
    value: function _getMenuItems() {
      return this._isTargetLaunchable(this.props.targetFilePath) ? DEBUG_OPTIONS : NO_LAUNCH_DEBUG_OPTIONS;
    }
  }, {
    key: '_isTargetLaunchable',
    value: function _isTargetLaunchable(targetFilePath) {
      return targetFilePath.endsWith('.php') || targetFilePath.endsWith('.hh');
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var selectedIndex = this.state.selectedIndex;
      // Reset selected item to DEFAULT_OPTION_INDEX if target is not launchable anymore.
      // TODO[jeffreytan]: this is ugly, refactor to make it more elegant.
      if (!this._isTargetLaunchable(nextProps.targetFilePath)) {
        selectedIndex = DEFAULT_OPTION_INDEX;
        this.setState({ selectedIndex: selectedIndex });
      }
      this.refs.debugTarget.setText(this._getDebugTarget(selectedIndex, nextProps.targetFilePath));
    }
  }, {
    key: 'render',
    value: function render() {
      var debugTarget = this._getDebugTarget(this.state.selectedIndex, this.props.targetFilePath);
      var isDebugScript = this._isDebugScript(this.state.selectedIndex);
      return React.createElement(
        'div',
        { className: 'buck-toolbar hhvm-toolbar block padded' },
        React.createElement(NuclideDropdown, {
          className: 'inline-block',
          menuItems: this._getMenuItems(),
          selectedIndex: this.state.selectedIndex,
          onSelectedChange: this._handleDropdownChange,
          ref: 'dropdown',
          size: 'sm'
        }),
        React.createElement(
          'div',
          { className: 'inline-block', style: { width: '500px' } },
          React.createElement(AtomInput, {
            ref: 'debugTarget',
            initialValue: debugTarget,
            disabled: !isDebugScript,
            size: 'sm' })
        ),
        React.createElement(
          'div',
          { className: 'btn-group btn-group-sm inline-block' },
          React.createElement(
            'button',
            {
              onClick: this._debug,
              className: 'btn' },
            isDebugScript ? 'Launch' : 'Attach'
          )
        )
      );
    }
  }, {
    key: '_isDebugScript',
    value: function _isDebugScript(index) {
      return index === SCRIPT_OPTION.value;
    }
  }, {
    key: '_getDebugTarget',
    value: function _getDebugTarget(index, targetFilePath) {
      var remoteUri = require('../../remote-uri');
      var hostName = remoteUri.getHostname(targetFilePath);
      var remoteFilePath = remoteUri.getPath(targetFilePath);
      return this._isDebugScript(index) ? remoteFilePath : hostName;
    }
  }, {
    key: '_handleDropdownChange',
    value: function _handleDropdownChange(newIndex) {
      var debugTarget = this._getDebugTarget(newIndex, this.props.targetFilePath);
      if (this.refs['debugTarget']) {
        this.refs['debugTarget'].setText(debugTarget);
      }
      this.setState({ selectedIndex: newIndex });
    }

    /**
     * Use void here to explictly disallow async function in react component.
     */
  }, {
    key: '_debug',
    value: function _debug() {
      // Stop any existing debugging sessions, as install hangs if an existing
      // app that's being overwritten is being debugged.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:stop-debugging');

      // TODO: is this.props.targetFilePath best one for targetUri?
      var processInfo = null;
      if (this._isDebugScript(this.state.selectedIndex)) {
        var scriptTarget = this.refs['debugTarget'].getText();

        var _require2 = require('../../debugger/hhvm/lib/LaunchProcessInfo');

        var LaunchProcessInfo = _require2.LaunchProcessInfo;

        processInfo = new LaunchProcessInfo(this.props.targetFilePath, scriptTarget);
      } else {
        var _require3 = require('../../debugger/hhvm/lib/AttachProcessInfo');

        var AttachProcessInfo = _require3.AttachProcessInfo;

        processInfo = new AttachProcessInfo(this.props.targetFilePath);
      }
      callDebugService(processInfo);
    }
  }]);

  return HhvmToolbar;
})(React.Component);

module.exports = HhvmToolbar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhodm1Ub29sYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUE4QmUsZ0JBQWdCLHFCQUEvQixXQUFnQyxXQUFnQyxFQUFXOztBQUV6RSxNQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQUNwRixNQUFNLGVBQWUsR0FBRyxNQUFNLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUMxRCxvQkFBb0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3JELGlCQUFlLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ3hDOzs7Ozs7Ozs7Ozs7Ozs7O0FBeEJELElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2pELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztlQUNyQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQWxDLEtBQUssWUFBTCxLQUFLO0lBQ0wsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7QUFFaEIsSUFBTSxpQkFBaUIsR0FBRyxFQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQyxDQUFDO0FBQ3pELElBQU0sYUFBYSxHQUFHLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDLENBQUM7QUFDbEQsSUFBTSxvQkFBb0IsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7O0FBRXJELElBQU0sYUFBYSxHQUFHLENBQ3BCLGlCQUFpQixFQUNqQixhQUFhLENBQ2QsQ0FBQzs7QUFFRixJQUFNLHVCQUF1QixHQUFHLENBQzlCLGlCQUFpQixDQUNsQixDQUFDOztJQVVJLFdBQVc7WUFBWCxXQUFXOztlQUFYLFdBQVc7O1dBQ0k7QUFDakIsb0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7S0FDNUM7Ozs7QUFFVSxXQUxQLFdBQVcsQ0FLSCxLQUFZLEVBQUU7MEJBTHRCLFdBQVc7O0FBTWIsK0JBTkUsV0FBVyw2Q0FNUCxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsbUJBQWEsRUFBRSxvQkFBb0I7S0FDcEMsQ0FBQztBQUNGLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEU7O2VBWkcsV0FBVzs7V0FjRix5QkFBMEM7QUFDckQsYUFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FDdEQsYUFBYSxHQUNiLHVCQUF1QixDQUFDO0tBQzdCOzs7V0FFa0IsNkJBQUMsY0FBc0IsRUFBVztBQUNuRCxhQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQ3BDLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEM7OztXQUV3QixtQ0FBQyxTQUFpQixFQUFFO0FBQzNDLFVBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDOzs7QUFHN0MsVUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEVBQUU7QUFDdkQscUJBQWEsR0FBRyxvQkFBb0IsQ0FBQztBQUNyQyxZQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsYUFBYSxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7T0FDL0M7QUFDRCxVQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7S0FDOUY7OztXQUVLLGtCQUFpQjtBQUNyQixVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUYsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3BFLGFBQ0U7O1VBQUssU0FBUyxFQUFDLHdDQUF3QztRQUNyRCxvQkFBQyxlQUFlO0FBQ2QsbUJBQVMsRUFBQyxjQUFjO0FBQ3hCLG1CQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxBQUFDO0FBQ2hDLHVCQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEFBQUM7QUFDeEMsMEJBQWdCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixBQUFDO0FBQzdDLGFBQUcsRUFBQyxVQUFVO0FBQ2QsY0FBSSxFQUFDLElBQUk7VUFDVDtRQUNGOztZQUFLLFNBQVMsRUFBQyxjQUFjLEVBQUMsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxBQUFDO1VBQ3BELG9CQUFDLFNBQVM7QUFDUixlQUFHLEVBQUMsYUFBYTtBQUNqQix3QkFBWSxFQUFFLFdBQVcsQUFBQztBQUMxQixvQkFBUSxFQUFFLENBQUMsYUFBYSxBQUFDO0FBQ3pCLGdCQUFJLEVBQUMsSUFBSSxHQUFFO1NBQ1Q7UUFDTjs7WUFBSyxTQUFTLEVBQUMscUNBQXFDO1VBQ2xEOzs7QUFDRSxxQkFBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEFBQUM7QUFDckIsdUJBQVMsRUFBQyxLQUFLO1lBQ2QsYUFBYSxHQUFHLFFBQVEsR0FBRyxRQUFRO1dBQzdCO1NBQ0w7T0FDRixDQUNOO0tBQ0g7OztXQUVhLHdCQUFDLEtBQWEsRUFBUTtBQUNsQyxhQUFPLEtBQUssS0FBSyxhQUFhLENBQUMsS0FBSyxDQUFDO0tBQ3RDOzs7V0FFYyx5QkFBQyxLQUFhLEVBQUUsY0FBc0IsRUFBVTtBQUM3RCxVQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM5QyxVQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3ZELFVBQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDekQsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLGNBQWMsR0FBRyxRQUFRLENBQUM7S0FDL0Q7OztXQUVvQiwrQkFBQyxRQUFnQixFQUFFO0FBQ3RDLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUUsVUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQzVCLFlBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQy9DO0FBQ0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQzFDOzs7Ozs7O1dBS0ssa0JBQVM7OztBQUdiLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQ2xDLGlDQUFpQyxDQUFDLENBQUM7OztBQUdyQyxVQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDdkIsVUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDakQsWUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7d0JBQzVCLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQzs7WUFBekUsaUJBQWlCLGFBQWpCLGlCQUFpQjs7QUFDeEIsbUJBQVcsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO09BQzlFLE1BQU07d0JBQ3VCLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQzs7WUFBekUsaUJBQWlCLGFBQWpCLGlCQUFpQjs7QUFDeEIsbUJBQVcsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7T0FDaEU7QUFDRCxzQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMvQjs7O1NBM0dHLFdBQVc7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUE4R3pDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6Ikhodm1Ub29sYmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mbyBmcm9tICcuLi8uLi9EZWJ1Z2dlci9hdG9tL2xpYi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcbmNvbnN0IEF0b21JbnB1dCA9IHJlcXVpcmUoJy4uLy4uL3VpL2F0b20taW5wdXQnKTtcbmNvbnN0IE51Y2xpZGVEcm9wZG93biA9IHJlcXVpcmUoJy4uLy4uL3VpL2Ryb3Bkb3duJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IFdFQl9TRVJWRVJfT1BUSU9OID0ge2xhYmVsOiAnV2ViU2VydmVyJywgdmFsdWU6IDB9O1xuY29uc3QgU0NSSVBUX09QVElPTiA9IHtsYWJlbDogJ1NjcmlwdCcsIHZhbHVlOiAxfTtcbmNvbnN0IERFRkFVTFRfT1BUSU9OX0lOREVYID0gV0VCX1NFUlZFUl9PUFRJT04udmFsdWU7XG5cbmNvbnN0IERFQlVHX09QVElPTlMgPSBbXG4gIFdFQl9TRVJWRVJfT1BUSU9OLFxuICBTQ1JJUFRfT1BUSU9OLFxuXTtcblxuY29uc3QgTk9fTEFVTkNIX0RFQlVHX09QVElPTlMgPSBbXG4gIFdFQl9TRVJWRVJfT1BUSU9OLFxuXTtcblxuYXN5bmMgZnVuY3Rpb24gY2FsbERlYnVnU2VydmljZShwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbyk6IFByb21pc2Uge1xuICAvLyBVc2UgY29tbWFuZHMgaGVyZSB0byB0cmlnZ2VyIHBhY2thZ2UgYWN0aXZhdGlvbi5cbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93Jyk7XG4gIGNvbnN0IGRlYnVnZ2VyU2VydmljZSA9IGF3YWl0IHJlcXVpcmUoJy4uLy4uL3NlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpO1xuICBkZWJ1Z2dlclNlcnZpY2UuZGVidWdIaHZtKHByb2Nlc3NJbmZvKTtcbn1cblxuY2xhc3MgSGh2bVRvb2xiYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHRhcmdldEZpbGVQYXRoOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZEluZGV4OiBERUZBVUxUX09QVElPTl9JTkRFWCxcbiAgICB9O1xuICAgIHRoaXMuX2RlYnVnID0gdGhpcy5fZGVidWcuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVEcm9wZG93bkNoYW5nZSA9IHRoaXMuX2hhbmRsZURyb3Bkb3duQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBfZ2V0TWVudUl0ZW1zKCk6IEFycmF5PHtsYWJlbDogc3RyaW5nLCB2YWx1ZTogbnVtYmVyfT4ge1xuICAgIHJldHVybiB0aGlzLl9pc1RhcmdldExhdW5jaGFibGUodGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aClcbiAgICAgID8gREVCVUdfT1BUSU9OU1xuICAgICAgOiBOT19MQVVOQ0hfREVCVUdfT1BUSU9OUztcbiAgfVxuXG4gIF9pc1RhcmdldExhdW5jaGFibGUodGFyZ2V0RmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0YXJnZXRGaWxlUGF0aC5lbmRzV2l0aCgnLnBocCcpIHx8XG4gICAgICB0YXJnZXRGaWxlUGF0aC5lbmRzV2l0aCgnLmhoJyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KSB7XG4gICAgbGV0IHNlbGVjdGVkSW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXg7XG4gICAgLy8gUmVzZXQgc2VsZWN0ZWQgaXRlbSB0byBERUZBVUxUX09QVElPTl9JTkRFWCBpZiB0YXJnZXQgaXMgbm90IGxhdW5jaGFibGUgYW55bW9yZS5cbiAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiB0aGlzIGlzIHVnbHksIHJlZmFjdG9yIHRvIG1ha2UgaXQgbW9yZSBlbGVnYW50LlxuICAgIGlmICghdGhpcy5faXNUYXJnZXRMYXVuY2hhYmxlKG5leHRQcm9wcy50YXJnZXRGaWxlUGF0aCkpIHtcbiAgICAgIHNlbGVjdGVkSW5kZXggPSBERUZBVUxUX09QVElPTl9JTkRFWDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IHNlbGVjdGVkSW5kZXh9KTtcbiAgICB9XG4gICAgdGhpcy5yZWZzLmRlYnVnVGFyZ2V0LnNldFRleHQodGhpcy5fZ2V0RGVidWdUYXJnZXQoc2VsZWN0ZWRJbmRleCwgbmV4dFByb3BzLnRhcmdldEZpbGVQYXRoKSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBkZWJ1Z1RhcmdldCA9IHRoaXMuX2dldERlYnVnVGFyZ2V0KHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCwgdGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aCk7XG4gICAgY29uc3QgaXNEZWJ1Z1NjcmlwdCA9IHRoaXMuX2lzRGVidWdTY3JpcHQodGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJidWNrLXRvb2xiYXIgaGh2bS10b29sYmFyIGJsb2NrIHBhZGRlZFwiPlxuICAgICAgICA8TnVjbGlkZURyb3Bkb3duXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICBtZW51SXRlbXM9e3RoaXMuX2dldE1lbnVJdGVtcygpfVxuICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleH1cbiAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVEcm9wZG93bkNoYW5nZX1cbiAgICAgICAgICByZWY9XCJkcm9wZG93blwiXG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIiBzdHlsZT17e3dpZHRoOiAnNTAwcHgnfX0+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgcmVmPVwiZGVidWdUYXJnZXRcIlxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXtkZWJ1Z1RhcmdldH1cbiAgICAgICAgICAgIGRpc2FibGVkPXshaXNEZWJ1Z1NjcmlwdH1cbiAgICAgICAgICAgIHNpemU9XCJzbVwiLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9kZWJ1Z31cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0blwiPlxuICAgICAgICAgICAge2lzRGVidWdTY3JpcHQgPyAnTGF1bmNoJyA6ICdBdHRhY2gnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaXNEZWJ1Z1NjcmlwdChpbmRleDogbnVtYmVyKTogYm9vbCB7XG4gICAgcmV0dXJuIGluZGV4ID09PSBTQ1JJUFRfT1BUSU9OLnZhbHVlO1xuICB9XG5cbiAgX2dldERlYnVnVGFyZ2V0KGluZGV4OiBudW1iZXIsIHRhcmdldEZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS11cmknKTtcbiAgICBjb25zdCBob3N0TmFtZSA9IHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0YXJnZXRGaWxlUGF0aCk7XG4gICAgY29uc3QgcmVtb3RlRmlsZVBhdGggPSByZW1vdGVVcmkuZ2V0UGF0aCh0YXJnZXRGaWxlUGF0aCk7XG4gICAgcmV0dXJuIHRoaXMuX2lzRGVidWdTY3JpcHQoaW5kZXgpID8gcmVtb3RlRmlsZVBhdGggOiBob3N0TmFtZTtcbiAgfVxuXG4gIF9oYW5kbGVEcm9wZG93bkNoYW5nZShuZXdJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgZGVidWdUYXJnZXQgPSB0aGlzLl9nZXREZWJ1Z1RhcmdldChuZXdJbmRleCwgdGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aCk7XG4gICAgaWYgKHRoaXMucmVmc1snZGVidWdUYXJnZXQnXSkge1xuICAgICAgdGhpcy5yZWZzWydkZWJ1Z1RhcmdldCddLnNldFRleHQoZGVidWdUYXJnZXQpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiBuZXdJbmRleH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB2b2lkIGhlcmUgdG8gZXhwbGljdGx5IGRpc2FsbG93IGFzeW5jIGZ1bmN0aW9uIGluIHJlYWN0IGNvbXBvbmVudC5cbiAgICovXG4gIF9kZWJ1ZygpOiB2b2lkIHtcbiAgICAvLyBTdG9wIGFueSBleGlzdGluZyBkZWJ1Z2dpbmcgc2Vzc2lvbnMsIGFzIGluc3RhbGwgaGFuZ3MgaWYgYW4gZXhpc3RpbmdcbiAgICAvLyBhcHAgdGhhdCdzIGJlaW5nIG92ZXJ3cml0dGVuIGlzIGJlaW5nIGRlYnVnZ2VkLlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RvcC1kZWJ1Z2dpbmcnKTtcblxuICAgIC8vIFRPRE86IGlzIHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGggYmVzdCBvbmUgZm9yIHRhcmdldFVyaT9cbiAgICBsZXQgcHJvY2Vzc0luZm8gPSBudWxsO1xuICAgIGlmICh0aGlzLl9pc0RlYnVnU2NyaXB0KHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCkpIHtcbiAgICAgIGNvbnN0IHNjcmlwdFRhcmdldCA9IHRoaXMucmVmc1snZGVidWdUYXJnZXQnXS5nZXRUZXh0KCk7XG4gICAgICBjb25zdCB7TGF1bmNoUHJvY2Vzc0luZm99ID0gcmVxdWlyZSgnLi4vLi4vZGVidWdnZXIvaGh2bS9saWIvTGF1bmNoUHJvY2Vzc0luZm8nKTtcbiAgICAgIHByb2Nlc3NJbmZvID0gbmV3IExhdW5jaFByb2Nlc3NJbmZvKHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgsIHNjcmlwdFRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHtBdHRhY2hQcm9jZXNzSW5mb30gPSByZXF1aXJlKCcuLi8uLi9kZWJ1Z2dlci9oaHZtL2xpYi9BdHRhY2hQcm9jZXNzSW5mbycpO1xuICAgICAgcHJvY2Vzc0luZm8gPSBuZXcgQXR0YWNoUHJvY2Vzc0luZm8odGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aCk7XG4gICAgfVxuICAgIGNhbGxEZWJ1Z1NlcnZpY2UocHJvY2Vzc0luZm8pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGh2bVRvb2xiYXI7XG4iXX0=