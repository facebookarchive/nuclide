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

var _atom = require('atom');

var _nuclideUiLibPanelComponentScroller = require('../../nuclide-ui/lib/PanelComponentScroller');

var FileTreeSidebarComponent = (function (_React$Component) {
  _inherits(FileTreeSidebarComponent, _React$Component);

  function FileTreeSidebarComponent(props) {
    _classCallCheck(this, FileTreeSidebarComponent);

    _get(Object.getPrototypeOf(FileTreeSidebarComponent.prototype), 'constructor', this).call(this, props);

    this._store = _libFileTreeStore.FileTreeStore.getInstance();
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
        _reactForAtom.React.createElement(
          _nuclideUiLibPanelComponentScroller.PanelComponentScroller,
          null,
          _reactForAtom.React.createElement(_FileTree2['default'], { ref: 'fileTree' })
        )
      );
    }
  }, {
    key: '_processExternalUpdate',
    value: function _processExternalUpdate() {
      var shouldRenderToolbar = !this._store.roots.isEmpty();

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlU2lkZWJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBY08sZ0JBQWdCOzt3QkFDRixZQUFZOzs7O3dDQUNNLDRCQUE0Qjs7Z0NBQ3ZDLHNCQUFzQjs7b0JBQ2hCLE1BQU07O2tEQUNILDZDQUE2Qzs7SUFNNUUsd0JBQXdCO1lBQXhCLHdCQUF3Qjs7QUFLakIsV0FMUCx3QkFBd0IsQ0FLaEIsS0FBYSxFQUFFOzBCQUx2Qix3QkFBd0I7O0FBTTFCLCtCQU5FLHdCQUF3Qiw2Q0FNcEIsS0FBSyxFQUFFOztBQUViLFFBQUksQ0FBQyxNQUFNLEdBQUcsZ0NBQWMsV0FBVyxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHlCQUFtQixFQUFFLEtBQUs7S0FDM0IsQ0FBQztBQUNGLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsQUFBQyxRQUFJLENBQU8sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3pEOztlQWRHLHdCQUF3Qjs7V0FnQlgsNkJBQVM7QUFDeEIsVUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDOUQsQ0FBQztBQUNGLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUY7OztXQUVtQixnQ0FBUztBQUMzQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFVyxzQkFBQyxLQUFxQixFQUFROzs7QUFHeEMsVUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMvQywrQkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ3JEO0tBQ0Y7OztXQUVLLGtCQUFHO0FBQ1AsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0QsVUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsSUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEVBQUU7QUFDOUQsZUFBTyxHQUFHLHdGQUEwQixnQkFBZ0IsRUFBRSxnQkFBZ0IsQUFBQyxHQUFHLENBQUM7T0FDNUU7OztBQUdELGFBQ0U7OztBQUNFLG1CQUFTLEVBQUMscUNBQXFDO0FBQy9DLGlCQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQUFBQztBQUMzQixrQkFBUSxFQUFFLENBQUMsQUFBQztRQUNYLE9BQU87UUFDUjs7O1VBQ0UsMkRBQVUsR0FBRyxFQUFDLFVBQVUsR0FBRztTQUNKO09BQ3JCLENBQ047S0FDSDs7O1dBRXFCLGtDQUFTO0FBQzdCLFVBQU0sbUJBQW1CLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFekQsVUFBSSxtQkFBbUIsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFO0FBQzFELFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxtQkFBbUIsRUFBbkIsbUJBQW1CLEVBQUMsQ0FBQyxDQUFDO09BQ3RDLE1BQU07O0FBRUwsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ3BCO0tBQ0Y7OztTQWxFRyx3QkFBd0I7R0FBUyxvQkFBTSxTQUFTOztBQXFFdEQsTUFBTSxDQUFDLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZVNpZGViYXJDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBGaWxlVHJlZSBmcm9tICcuL0ZpbGVUcmVlJztcbmltcG9ydCB7RmlsZVRyZWVUb29sYmFyQ29tcG9uZW50fSBmcm9tICcuL0ZpbGVUcmVlVG9vbGJhckNvbXBvbmVudCc7XG5pbXBvcnQge0ZpbGVUcmVlU3RvcmV9IGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1BhbmVsQ29tcG9uZW50U2Nyb2xsZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1BhbmVsQ29tcG9uZW50U2Nyb2xsZXInO1xuXG50eXBlIFN0YXRlID0ge1xuICBzaG91bGRSZW5kZXJUb29sYmFyOiBib29sZWFuO1xufTtcblxuY2xhc3MgRmlsZVRyZWVTaWRlYmFyQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNob3VsZFJlbmRlclRvb2xiYXI6IGZhbHNlLFxuICAgIH07XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVGb2N1cyA9IHRoaXMuX2hhbmRsZUZvY3VzLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9wcm9jZXNzRXh0ZXJuYWxVcGRhdGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICB0aGlzLl9zdG9yZS5zdWJzY3JpYmUodGhpcy5fcHJvY2Vzc0V4dGVybmFsVXBkYXRlLmJpbmQodGhpcykpXG4gICAgKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHModGhpcy5fcHJvY2Vzc0V4dGVybmFsVXBkYXRlLmJpbmQodGhpcykpKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9oYW5kbGVGb2N1cyhldmVudDogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBEZWxlZ2F0ZSBmb2N1cyB0byB0aGUgRmlsZVRyZWUgY29tcG9uZW50IGlmIHRoaXMgY29tcG9uZW50IGdhaW5zIGZvY3VzIGJlY2F1c2UgdGhlIEZpbGVUcmVlXG4gICAgLy8gbWF0Y2hlcyB0aGUgc2VsZWN0b3JzIHRhcmdldGVkIGJ5IHRoZW1lcyB0byBzaG93IHRoZSBjb250YWluaW5nIHBhbmVsIGhhcyBmb2N1cy5cbiAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKSkge1xuICAgICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydmaWxlVHJlZSddKS5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB3b3JraW5nU2V0c1N0b3JlID0gdGhpcy5fc3RvcmUuZ2V0V29ya2luZ1NldHNTdG9yZSgpO1xuICAgIGxldCB0b29sYmFyO1xuICAgIGlmICh0aGlzLnN0YXRlLnNob3VsZFJlbmRlclRvb2xiYXIgJiYgd29ya2luZ1NldHNTdG9yZSAhPSBudWxsKSB7XG4gICAgICB0b29sYmFyID0gPEZpbGVUcmVlVG9vbGJhckNvbXBvbmVudCB3b3JraW5nU2V0c1N0b3JlPXt3b3JraW5nU2V0c1N0b3JlfSAvPjtcbiAgICB9XG5cbiAgICAvLyBJbmNsdWRlIGB0YWJJbmRleGAgc28gdGhpcyBjb21wb25lbnQgY2FuIGJlIGZvY3VzZWQgYnkgY2FsbGluZyBpdHMgbmF0aXZlIGBmb2N1c2AgbWV0aG9kLlxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItY29udGFpbmVyXCJcbiAgICAgICAgb25Gb2N1cz17dGhpcy5faGFuZGxlRm9jdXN9XG4gICAgICAgIHRhYkluZGV4PXswfT5cbiAgICAgICAge3Rvb2xiYXJ9XG4gICAgICAgIDxQYW5lbENvbXBvbmVudFNjcm9sbGVyPlxuICAgICAgICAgIDxGaWxlVHJlZSByZWY9XCJmaWxlVHJlZVwiIC8+XG4gICAgICAgIDwvUGFuZWxDb21wb25lbnRTY3JvbGxlcj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcHJvY2Vzc0V4dGVybmFsVXBkYXRlKCk6IHZvaWQge1xuICAgIGNvbnN0IHNob3VsZFJlbmRlclRvb2xiYXIgPSAhdGhpcy5fc3RvcmUucm9vdHMuaXNFbXB0eSgpO1xuXG4gICAgaWYgKHNob3VsZFJlbmRlclRvb2xiYXIgIT09IHRoaXMuc3RhdGUuc2hvdWxkUmVuZGVyVG9vbGJhcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvdWxkUmVuZGVyVG9vbGJhcn0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOb3RlOiBJdCdzIHNhZmUgdG8gY2FsbCBmb3JjZVVwZGF0ZSBoZXJlIGJlY2F1c2UgdGhlIGNoYW5nZSBldmVudHMgYXJlIGRlLWJvdW5jZWQuXG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVTaWRlYmFyQ29tcG9uZW50O1xuIl19