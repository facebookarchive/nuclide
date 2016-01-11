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

var BuckToolbar = require('../../buck/toolbar');
var React = require('react-for-atom');

var _require = require('atom');

var Disposable = _require.Disposable;
var PropTypes = React.PropTypes;

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
        var HhvmToolbar = require('../../hhvm-toolbar');
        return React.createElement(
          'div',
          { className: 'tool-panel padded nuclide-toolbar' },
          React.createElement(HhvmToolbar, {
            ref: 'hhvmToolbar',
            targetFilePath: this.state.currentFilePath
          })
        );
      } else if (this.state.projectType === 'Buck') {
        return React.createElement(
          'div',
          { className: 'tool-panel padded nuclide-toolbar' },
          React.createElement(BuckToolbar, {
            initialBuildTarget: this.props.initialBuildTarget,
            onBuildTargetChange: this.props.onBuildTargetChange,
            initialIsReactNativeServerMode: this.props.initialIsReactNativeServerMode,
            onIsReactNativeServerModeChange: this.props.onIsReactNativeServerModeChange
          })
        );
      } else {
        // Hide toolbar.
        return null;
      }
    }
  }]);

  return NuclideToolbar;
})(React.Component);

NuclideToolbar.propTypes = {
  initialBuildTarget: PropTypes.string.isRequired,
  onBuildTargetChange: PropTypes.func.isRequired,
  initialIsReactNativeServerMode: PropTypes.bool.isRequired,
  onIsReactNativeServerModeChange: PropTypes.func.isRequired,
  projectStore: React.PropTypes.instanceOf(ProjectStore).isRequired
};

module.exports = NuclideToolbar;
//# sourceMappingURL=data:application/json;base64,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QixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUN6RCxpQ0FBK0IsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDMUQsY0FBWSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFVBQVU7Q0FDbEUsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJOdWNsaWRlVG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEJ1Y2tUb29sYmFyID0gcmVxdWlyZSgnLi4vLi4vYnVjay90b29sYmFyJyk7XG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3QgUHJvamVjdFN0b3JlID0gcmVxdWlyZSgnLi9Qcm9qZWN0U3RvcmUnKTtcblxuY2xhc3MgTnVjbGlkZVRvb2xiYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBfZGlzcG9zYWJsZTogP0Rpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjdXJyZW50RmlsZVBhdGg6ICcnLFxuICAgICAgcHJvamVjdFR5cGU6ICdPdGhlcicsXG4gICAgfTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlID0gbnVsbDtcbiAgICB0aGlzLl91cGRhdGVTdGF0ZUZyb21TdG9yZSA9IHRoaXMuX3VwZGF0ZVN0YXRlRnJvbVN0b3JlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZSA9IHRoaXMucHJvcHMucHJvamVjdFN0b3JlLm9uQ2hhbmdlKHRoaXMuX3VwZGF0ZVN0YXRlRnJvbVN0b3JlKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVTdGF0ZUZyb21TdG9yZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRGaWxlUGF0aDogdGhpcy5wcm9wcy5wcm9qZWN0U3RvcmUuZ2V0Q3VycmVudEZpbGVQYXRoKCksXG4gICAgICBwcm9qZWN0VHlwZTogdGhpcy5wcm9wcy5wcm9qZWN0U3RvcmUuZ2V0UHJvamVjdFR5cGUoKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBpZiAodGhpcy5zdGF0ZS5wcm9qZWN0VHlwZSA9PT0gJ0hodm0nKSB7XG4gICAgICBjb25zdCBIaHZtVG9vbGJhciA9IHJlcXVpcmUoJy4uLy4uL2hodm0tdG9vbGJhcicpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b29sLXBhbmVsIHBhZGRlZCBudWNsaWRlLXRvb2xiYXJcIj5cbiAgICAgICAgICA8SGh2bVRvb2xiYXJcbiAgICAgICAgICAgIHJlZj1cImhodm1Ub29sYmFyXCJcbiAgICAgICAgICAgIHRhcmdldEZpbGVQYXRoPXt0aGlzLnN0YXRlLmN1cnJlbnRGaWxlUGF0aH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnByb2plY3RUeXBlID09PSAnQnVjaycpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9vbC1wYW5lbCBwYWRkZWQgbnVjbGlkZS10b29sYmFyXCI+XG4gICAgICAgICAgPEJ1Y2tUb29sYmFyXG4gICAgICAgICAgICBpbml0aWFsQnVpbGRUYXJnZXQ9e3RoaXMucHJvcHMuaW5pdGlhbEJ1aWxkVGFyZ2V0fVxuICAgICAgICAgICAgb25CdWlsZFRhcmdldENoYW5nZT17dGhpcy5wcm9wcy5vbkJ1aWxkVGFyZ2V0Q2hhbmdlfVxuICAgICAgICAgICAgaW5pdGlhbElzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlPXt0aGlzLnByb3BzLmluaXRpYWxJc1JlYWN0TmF0aXZlU2VydmVyTW9kZX1cbiAgICAgICAgICAgIG9uSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2U9e3RoaXMucHJvcHMub25Jc1JlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhpZGUgdG9vbGJhci5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5OdWNsaWRlVG9vbGJhci5wcm9wVHlwZXMgPSB7XG4gIGluaXRpYWxCdWlsZFRhcmdldDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBvbkJ1aWxkVGFyZ2V0Q2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICBpbml0aWFsSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIG9uSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIHByb2plY3RTdG9yZTogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoUHJvamVjdFN0b3JlKS5pc1JlcXVpcmVkLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlVG9vbGJhcjtcbiJdfQ==