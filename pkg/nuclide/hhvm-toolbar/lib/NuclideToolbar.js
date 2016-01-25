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

var React = require('react-for-atom');

var _require = require('atom');

var Disposable = _require.Disposable;

var ProjectStore = require('./ProjectStore');

var NuclideToolbar = (function (_React$Component) {
  _inherits(NuclideToolbar, _React$Component);

  function NuclideToolbar(props) {
    _classCallCheck(this, NuclideToolbar);

    _get(Object.getPrototypeOf(NuclideToolbar.prototype), 'constructor', this).call(this, props);
    this.state = {
      currentFilePath: '',
      projectType: 'Other'
    };
    this._disposable = null;
    this._updateStateFromStore = this._updateStateFromStore.bind(this);
  }

  _createClass(NuclideToolbar, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this._disposable = this.props.projectStore.onChange(this._updateStateFromStore);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._disposable) {
        this._disposable.dispose();
        this._disposable = null;
      }
    }
  }, {
    key: '_updateStateFromStore',
    value: function _updateStateFromStore() {
      this.setState({
        currentFilePath: this.props.projectStore.getCurrentFilePath(),
        projectType: this.props.projectStore.getProjectType()
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.projectType === 'Hhvm') {
        var HhvmToolbar = require('./HhvmToolbar');
        return React.createElement(HhvmToolbar, {
          ref: 'hhvmToolbar',
          targetFilePath: this.state.currentFilePath
        });
      } else {
        // Hide toolbar.
        return null;
      }
    }
  }]);

  return NuclideToolbar;
})(React.Component);

NuclideToolbar.propTypes = {
  projectStore: React.PropTypes.instanceOf(ProjectStore).isRequired
};

module.exports = NuclideToolbar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVUb29sYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7ZUFDbkIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxZQUFWLFVBQVU7O0FBQ2pCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztJQUV6QyxjQUFjO1lBQWQsY0FBYzs7QUFHUCxXQUhQLGNBQWMsQ0FHTixLQUFZLEVBQUU7MEJBSHRCLGNBQWM7O0FBSWhCLCtCQUpFLGNBQWMsNkNBSVYsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHFCQUFlLEVBQUUsRUFBRTtBQUNuQixpQkFBVyxFQUFFLE9BQU87S0FDckIsQ0FBQztBQUNGLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BFOztlQVhHLGNBQWM7O1dBYUEsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDakY7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzQixZQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztPQUN6QjtLQUNGOzs7V0FFb0IsaUNBQUc7QUFDdEIsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHVCQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUU7QUFDN0QsbUJBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUU7T0FDdEQsQ0FBQyxDQUFDO0tBQ0o7OztXQUVLLGtCQUFrQjtBQUN0QixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRTtBQUNyQyxZQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDN0MsZUFDRSxvQkFBQyxXQUFXO0FBQ1YsYUFBRyxFQUFDLGFBQWE7QUFDakIsd0JBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQUFBQztVQUMzQyxDQUNGO09BQ0gsTUFBTTs7QUFFTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztTQTVDRyxjQUFjO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBK0M1QyxjQUFjLENBQUMsU0FBUyxHQUFHO0FBQ3pCLGNBQVksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxVQUFVO0NBQ2xFLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoiTnVjbGlkZVRvb2xiYXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBQcm9qZWN0U3RvcmUgPSByZXF1aXJlKCcuL1Byb2plY3RTdG9yZScpO1xuXG5jbGFzcyBOdWNsaWRlVG9vbGJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9kaXNwb3NhYmxlOiA/RGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGN1cnJlbnRGaWxlUGF0aDogJycsXG4gICAgICBwcm9qZWN0VHlwZTogJ090aGVyJyxcbiAgICB9O1xuICAgIHRoaXMuX2Rpc3Bvc2FibGUgPSBudWxsO1xuICAgIHRoaXMuX3VwZGF0ZVN0YXRlRnJvbVN0b3JlID0gdGhpcy5fdXBkYXRlU3RhdGVGcm9tU3RvcmUuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlID0gdGhpcy5wcm9wcy5wcm9qZWN0U3RvcmUub25DaGFuZ2UodGhpcy5fdXBkYXRlU3RhdGVGcm9tU3RvcmUpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZVN0YXRlRnJvbVN0b3JlKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudEZpbGVQYXRoOiB0aGlzLnByb3BzLnByb2plY3RTdG9yZS5nZXRDdXJyZW50RmlsZVBhdGgoKSxcbiAgICAgIHByb2plY3RUeXBlOiB0aGlzLnByb3BzLnByb2plY3RTdG9yZS5nZXRQcm9qZWN0VHlwZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIGlmICh0aGlzLnN0YXRlLnByb2plY3RUeXBlID09PSAnSGh2bScpIHtcbiAgICAgIGNvbnN0IEhodm1Ub29sYmFyID0gcmVxdWlyZSgnLi9IaHZtVG9vbGJhcicpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPEhodm1Ub29sYmFyXG4gICAgICAgICAgcmVmPVwiaGh2bVRvb2xiYXJcIlxuICAgICAgICAgIHRhcmdldEZpbGVQYXRoPXt0aGlzLnN0YXRlLmN1cnJlbnRGaWxlUGF0aH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhpZGUgdG9vbGJhci5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5OdWNsaWRlVG9vbGJhci5wcm9wVHlwZXMgPSB7XG4gIHByb2plY3RTdG9yZTogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoUHJvamVjdFN0b3JlKS5pc1JlcXVpcmVkLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlVG9vbGJhcjtcbiJdfQ==