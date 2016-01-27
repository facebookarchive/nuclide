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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVUb29sYmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSzs7Z0JBQ1MsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxhQUFWLFVBQVU7O0FBQ2pCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3hDLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0lBRVYsY0FBYztZQUFkLGNBQWM7O2VBQWQsY0FBYzs7V0FHQztBQUNqQixrQkFBWSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsVUFBVTtLQUM1RDs7OztBQUVVLFdBUFAsY0FBYyxDQU9OLEtBQVksRUFBRTswQkFQdEIsY0FBYzs7QUFRaEIsK0JBUkUsY0FBYyw2Q0FRVixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gscUJBQWUsRUFBRSxFQUFFO0FBQ25CLGlCQUFXLEVBQUUsT0FBTztLQUNyQixDQUFDO0FBQ0YsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEU7O2VBZkcsY0FBYzs7V0FpQkEsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDakY7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzQixZQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztPQUN6QjtLQUNGOzs7V0FFb0IsaUNBQUc7QUFDdEIsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHVCQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUU7QUFDN0QsbUJBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUU7T0FDdEQsQ0FBQyxDQUFDO0tBQ0o7OztXQUVLLGtCQUFrQjtBQUN0QixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRTtBQUNyQyxZQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDN0MsZUFDRSxvQkFBQyxXQUFXO0FBQ1YsYUFBRyxFQUFDLGFBQWE7QUFDakIsd0JBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQUFBQztVQUMzQyxDQUNGO09BQ0gsTUFBTTs7QUFFTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztTQWhERyxjQUFjO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBbUQ1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJOdWNsaWRlVG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgUHJvamVjdFN0b3JlID0gcmVxdWlyZSgnLi9Qcm9qZWN0U3RvcmUnKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNsYXNzIE51Y2xpZGVUb29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX2Rpc3Bvc2FibGU6ID9EaXNwb3NhYmxlO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgcHJvamVjdFN0b3JlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihQcm9qZWN0U3RvcmUpLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjdXJyZW50RmlsZVBhdGg6ICcnLFxuICAgICAgcHJvamVjdFR5cGU6ICdPdGhlcicsXG4gICAgfTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlID0gbnVsbDtcbiAgICB0aGlzLl91cGRhdGVTdGF0ZUZyb21TdG9yZSA9IHRoaXMuX3VwZGF0ZVN0YXRlRnJvbVN0b3JlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZSA9IHRoaXMucHJvcHMucHJvamVjdFN0b3JlLm9uQ2hhbmdlKHRoaXMuX3VwZGF0ZVN0YXRlRnJvbVN0b3JlKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVTdGF0ZUZyb21TdG9yZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRGaWxlUGF0aDogdGhpcy5wcm9wcy5wcm9qZWN0U3RvcmUuZ2V0Q3VycmVudEZpbGVQYXRoKCksXG4gICAgICBwcm9qZWN0VHlwZTogdGhpcy5wcm9wcy5wcm9qZWN0U3RvcmUuZ2V0UHJvamVjdFR5cGUoKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBpZiAodGhpcy5zdGF0ZS5wcm9qZWN0VHlwZSA9PT0gJ0hodm0nKSB7XG4gICAgICBjb25zdCBIaHZtVG9vbGJhciA9IHJlcXVpcmUoJy4vSGh2bVRvb2xiYXInKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxIaHZtVG9vbGJhclxuICAgICAgICAgIHJlZj1cImhodm1Ub29sYmFyXCJcbiAgICAgICAgICB0YXJnZXRGaWxlUGF0aD17dGhpcy5zdGF0ZS5jdXJyZW50RmlsZVBhdGh9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBIaWRlIHRvb2xiYXIuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlVG9vbGJhcjtcbiJdfQ==