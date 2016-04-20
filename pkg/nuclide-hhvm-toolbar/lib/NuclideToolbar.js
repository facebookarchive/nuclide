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

var _require = require('react-for-atom');

var React = _require.React;

var _require2 = require('atom');

var Disposable = _require2.Disposable;

var ProjectStore = require('./ProjectStore');
var PropTypes = React.PropTypes;

var NuclideToolbar = (function (_React$Component) {
  _inherits(NuclideToolbar, _React$Component);

  _createClass(NuclideToolbar, null, [{
    key: 'propTypes',
    value: {
      projectStore: PropTypes.instanceOf(ProjectStore).isRequired
    },
    enumerable: true
  }]);

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

module.exports = NuclideToolbar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVUb29sYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSzs7Z0JBQ1MsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxhQUFWLFVBQVU7O0FBQ2pCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3hDLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0lBRVYsY0FBYztZQUFkLGNBQWM7O2VBQWQsY0FBYzs7V0FRQztBQUNqQixrQkFBWSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsVUFBVTtLQUM1RDs7OztBQUVVLFdBWlAsY0FBYyxDQVlOLEtBQVksRUFBRTswQkFadEIsY0FBYzs7QUFhaEIsK0JBYkUsY0FBYyw2Q0FhVixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gscUJBQWUsRUFBRSxFQUFFO0FBQ25CLGlCQUFXLEVBQUUsT0FBTztLQUNyQixDQUFDO0FBQ0YsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsQUFBQyxRQUFJLENBQU8scUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMzRTs7ZUFwQkcsY0FBYzs7V0FzQkEsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDakY7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzQixZQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztPQUN6QjtLQUNGOzs7V0FFb0IsaUNBQUc7QUFDdEIsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHVCQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUU7QUFDN0QsbUJBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUU7T0FDdEQsQ0FBQyxDQUFDO0tBQ0o7OztXQUVLLGtCQUFtQjtBQUN2QixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRTtBQUNyQyxZQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDN0MsZUFDRSxvQkFBQyxXQUFXO0FBQ1YsYUFBRyxFQUFDLGFBQWE7QUFDakIsd0JBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQUFBQztVQUMzQyxDQUNGO09BQ0gsTUFBTTs7QUFFTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztTQXJERyxjQUFjO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBd0Q1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJOdWNsaWRlVG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgUHJvamVjdFN0b3JlID0gcmVxdWlyZSgnLi9Qcm9qZWN0U3RvcmUnKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNsYXNzIE51Y2xpZGVUb29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX2Rpc3Bvc2FibGU6ID9EaXNwb3NhYmxlO1xuXG4gIHN0YXRlOiB7XG4gICAgY3VycmVudEZpbGVQYXRoOiBzdHJpbmc7XG4gICAgcHJvamVjdFR5cGU6IHN0cmluZztcbiAgfTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHByb2plY3RTdG9yZTogUHJvcFR5cGVzLmluc3RhbmNlT2YoUHJvamVjdFN0b3JlKS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgY3VycmVudEZpbGVQYXRoOiAnJyxcbiAgICAgIHByb2plY3RUeXBlOiAnT3RoZXInLFxuICAgIH07XG4gICAgdGhpcy5fZGlzcG9zYWJsZSA9IG51bGw7XG4gICAgKHRoaXM6IGFueSkuX3VwZGF0ZVN0YXRlRnJvbVN0b3JlID0gdGhpcy5fdXBkYXRlU3RhdGVGcm9tU3RvcmUuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlID0gdGhpcy5wcm9wcy5wcm9qZWN0U3RvcmUub25DaGFuZ2UodGhpcy5fdXBkYXRlU3RhdGVGcm9tU3RvcmUpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZVN0YXRlRnJvbVN0b3JlKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudEZpbGVQYXRoOiB0aGlzLnByb3BzLnByb2plY3RTdG9yZS5nZXRDdXJyZW50RmlsZVBhdGgoKSxcbiAgICAgIHByb2plY3RUeXBlOiB0aGlzLnByb3BzLnByb2plY3RTdG9yZS5nZXRQcm9qZWN0VHlwZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAodGhpcy5zdGF0ZS5wcm9qZWN0VHlwZSA9PT0gJ0hodm0nKSB7XG4gICAgICBjb25zdCBIaHZtVG9vbGJhciA9IHJlcXVpcmUoJy4vSGh2bVRvb2xiYXInKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxIaHZtVG9vbGJhclxuICAgICAgICAgIHJlZj1cImhodm1Ub29sYmFyXCJcbiAgICAgICAgICB0YXJnZXRGaWxlUGF0aD17dGhpcy5zdGF0ZS5jdXJyZW50RmlsZVBhdGh9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBIaWRlIHRvb2xiYXIuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlVG9vbGJhcjtcbiJdfQ==