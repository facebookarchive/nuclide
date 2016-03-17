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

var _reactForAtom = require('react-for-atom');

var _FileTree = require('./FileTree');

var _FileTree2 = _interopRequireDefault(_FileTree);

var _FileTreeToolbarComponent = require('./FileTreeToolbarComponent');

var _libFileTreeStore = require('../lib/FileTreeStore');

var _libFileTreeStore2 = _interopRequireDefault(_libFileTreeStore);

var _atom = require('atom');

var FileTreeSidebarComponent = (function (_React$Component) {
  _inherits(FileTreeSidebarComponent, _React$Component);

  function FileTreeSidebarComponent(props) {
    _classCallCheck(this, FileTreeSidebarComponent);

    _get(Object.getPrototypeOf(FileTreeSidebarComponent.prototype), 'constructor', this).call(this, props);

    this._store = _libFileTreeStore2['default'].getInstance();
    this.state = {
      shouldRenderToolbar: false
    };
    this._disposables = new _atom.CompositeDisposable();
    this._handleFocus = this._handleFocus.bind(this);
  }

  _createClass(FileTreeSidebarComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._processExternalUpdate();
      this._disposables.add(this._store.subscribe(this._processExternalUpdate.bind(this)));
      this._disposables.add(atom.project.onDidChangePaths(this._processExternalUpdate.bind(this)));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: '_handleFocus',
    value: function _handleFocus(event) {
      // Delegate focus to the FileTree component if this component gains focus because the FileTree
      // matches the selectors targeted by themes to show the containing panel has focus.
      if (event.target === _reactForAtom.ReactDOM.findDOMNode(this)) {
        _reactForAtom.ReactDOM.findDOMNode(this.refs['fileTree']).focus();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var workingSetsStore = this._store.getWorkingSetsStore();
      var toolbar = undefined;
      if (this.state.shouldRenderToolbar && workingSetsStore != null) {
        toolbar = _reactForAtom.React.createElement(_FileTreeToolbarComponent.FileTreeToolbarComponent, { workingSetsStore: workingSetsStore });
      }

      // Include `tabIndex` so this component can be focused by calling its native `focus` method.
      return _reactForAtom.React.createElement(
        'div',
        {
          className: 'nuclide-file-tree-toolbar-container',
          onFocus: this._handleFocus,
          tabIndex: 0 },
        toolbar,
        _reactForAtom.React.createElement(_FileTree2['default'], { nodeToKeepInView: this._store.getTrackedNode(), ref: 'fileTree' })
      );
    }
  }, {
    key: '_processExternalUpdate',
    value: function _processExternalUpdate() {
      var shouldRenderToolbar = this._store.getRootKeys().length !== 0;

      if (shouldRenderToolbar !== this.state.shouldRenderToolbar) {
        this.setState({ shouldRenderToolbar: shouldRenderToolbar });
      } else {
        // Note: It's safe to call forceUpdate here because the change events are de-bounced.
        this.forceUpdate();
      }
    }
  }]);

  return FileTreeSidebarComponent;
})(_reactForAtom.React.Component);

module.exports = FileTreeSidebarComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlU2lkZWJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBY08sZ0JBQWdCOzt3QkFDRixZQUFZOzs7O3dDQUNNLDRCQUE0Qjs7Z0NBQ3pDLHNCQUFzQjs7OztvQkFDZCxNQUFNOztJQU1sQyx3QkFBd0I7WUFBeEIsd0JBQXdCOztBQUtqQixXQUxQLHdCQUF3QixDQUtoQixLQUFhLEVBQUU7MEJBTHZCLHdCQUF3Qjs7QUFNMUIsK0JBTkUsd0JBQXdCLDZDQU1wQixLQUFLLEVBQUU7O0FBRWIsUUFBSSxDQUFDLE1BQU0sR0FBRyw4QkFBYyxXQUFXLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gseUJBQW1CLEVBQUUsS0FBSztLQUMzQixDQUFDO0FBQ0YsUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztBQUM5QyxBQUFDLFFBQUksQ0FBTyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDekQ7O2VBZEcsd0JBQXdCOztXQWdCWCw2QkFBUztBQUN4QixVQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztBQUM5QixVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUM5RCxDQUFDO0FBQ0YsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM5Rjs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVXLHNCQUFDLEtBQXFCLEVBQVE7OztBQUd4QyxVQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssdUJBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQy9DLCtCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDckQ7S0FDRjs7O1dBRUssa0JBQUc7QUFDUCxVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzRCxVQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixJQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM5RCxlQUFPLEdBQUcsd0ZBQTBCLGdCQUFnQixFQUFFLGdCQUFnQixBQUFDLEdBQUcsQ0FBQztPQUM1RTs7O0FBR0QsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBQyxxQ0FBcUM7QUFDL0MsaUJBQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxBQUFDO0FBQzNCLGtCQUFRLEVBQUUsQ0FBQyxBQUFDO1FBQ1gsT0FBTztRQUNSLDJEQUFVLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEFBQUMsRUFBQyxHQUFHLEVBQUMsVUFBVSxHQUFHO09BQ3ZFLENBQ047S0FDSDs7O1dBRXFCLGtDQUFTO0FBQzdCLFVBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDOztBQUVuRSxVQUFJLG1CQUFtQixLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7QUFDMUQsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLG1CQUFtQixFQUFuQixtQkFBbUIsRUFBQyxDQUFDLENBQUM7T0FDdEMsTUFBTTs7QUFFTCxZQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDcEI7S0FDRjs7O1NBaEVHLHdCQUF3QjtHQUFTLG9CQUFNLFNBQVM7O0FBbUV0RCxNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IkZpbGVUcmVlU2lkZWJhckNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IEZpbGVUcmVlIGZyb20gJy4vRmlsZVRyZWUnO1xuaW1wb3J0IHtGaWxlVHJlZVRvb2xiYXJDb21wb25lbnR9IGZyb20gJy4vRmlsZVRyZWVUb29sYmFyQ29tcG9uZW50JztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHNob3VsZFJlbmRlclRvb2xiYXI6IGJvb2xlYW47XG59XG5cbmNsYXNzIEZpbGVUcmVlU2lkZWJhckNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzaG91bGRSZW5kZXJUb29sYmFyOiBmYWxzZSxcbiAgICB9O1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlRm9jdXMgPSB0aGlzLl9oYW5kbGVGb2N1cy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvY2Vzc0V4dGVybmFsVXBkYXRlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgdGhpcy5fc3RvcmUuc3Vic2NyaWJlKHRoaXMuX3Byb2Nlc3NFeHRlcm5hbFVwZGF0ZS5iaW5kKHRoaXMpKVxuICAgICk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMuX3Byb2Nlc3NFeHRlcm5hbFVwZGF0ZS5iaW5kKHRoaXMpKSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfaGFuZGxlRm9jdXMoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgLy8gRGVsZWdhdGUgZm9jdXMgdG8gdGhlIEZpbGVUcmVlIGNvbXBvbmVudCBpZiB0aGlzIGNvbXBvbmVudCBnYWlucyBmb2N1cyBiZWNhdXNlIHRoZSBGaWxlVHJlZVxuICAgIC8vIG1hdGNoZXMgdGhlIHNlbGVjdG9ycyB0YXJnZXRlZCBieSB0aGVtZXMgdG8gc2hvdyB0aGUgY29udGFpbmluZyBwYW5lbCBoYXMgZm9jdXMuXG4gICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcykpIHtcbiAgICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snZmlsZVRyZWUnXSkuZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qgd29ya2luZ1NldHNTdG9yZSA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXRzU3RvcmUoKTtcbiAgICBsZXQgdG9vbGJhcjtcbiAgICBpZiAodGhpcy5zdGF0ZS5zaG91bGRSZW5kZXJUb29sYmFyICYmIHdvcmtpbmdTZXRzU3RvcmUgIT0gbnVsbCkge1xuICAgICAgdG9vbGJhciA9IDxGaWxlVHJlZVRvb2xiYXJDb21wb25lbnQgd29ya2luZ1NldHNTdG9yZT17d29ya2luZ1NldHNTdG9yZX0gLz47XG4gICAgfVxuXG4gICAgLy8gSW5jbHVkZSBgdGFiSW5kZXhgIHNvIHRoaXMgY29tcG9uZW50IGNhbiBiZSBmb2N1c2VkIGJ5IGNhbGxpbmcgaXRzIG5hdGl2ZSBgZm9jdXNgIG1ldGhvZC5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWNvbnRhaW5lclwiXG4gICAgICAgIG9uRm9jdXM9e3RoaXMuX2hhbmRsZUZvY3VzfVxuICAgICAgICB0YWJJbmRleD17MH0+XG4gICAgICAgIHt0b29sYmFyfVxuICAgICAgICA8RmlsZVRyZWUgbm9kZVRvS2VlcEluVmlldz17dGhpcy5fc3RvcmUuZ2V0VHJhY2tlZE5vZGUoKX0gcmVmPVwiZmlsZVRyZWVcIiAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9wcm9jZXNzRXh0ZXJuYWxVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgc2hvdWxkUmVuZGVyVG9vbGJhciA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCkubGVuZ3RoICE9PSAwO1xuXG4gICAgaWYgKHNob3VsZFJlbmRlclRvb2xiYXIgIT09IHRoaXMuc3RhdGUuc2hvdWxkUmVuZGVyVG9vbGJhcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvdWxkUmVuZGVyVG9vbGJhcn0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOb3RlOiBJdCdzIHNhZmUgdG8gY2FsbCBmb3JjZVVwZGF0ZSBoZXJlIGJlY2F1c2UgdGhlIGNoYW5nZSBldmVudHMgYXJlIGRlLWJvdW5jZWQuXG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVTaWRlYmFyQ29tcG9uZW50O1xuIl19