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

/*eslint-disable react/prop-types */

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
    key: 'render',
    value: function render() {
      var workingSetsStore = this._store.getWorkingSetsStore();
      var toolbar = undefined;
      if (this.state.shouldRenderToolbar && workingSetsStore != null) {
        toolbar = _reactForAtom.React.createElement(_FileTreeToolbarComponent.FileTreeToolbarComponent, { workingSetsStore: workingSetsStore });
      }

      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-file-tree-toolbar-container' },
        toolbar,
        _reactForAtom.React.createElement(_FileTree2['default'], null)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlU2lkZWJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFhb0IsZ0JBQWdCOzt3QkFDZixZQUFZOzs7O3dDQUNNLDRCQUE0Qjs7Z0NBQ3pDLHNCQUFzQjs7OztvQkFDZCxNQUFNOztJQU1sQyx3QkFBd0I7WUFBeEIsd0JBQXdCOztBQUtqQixXQUxQLHdCQUF3QixDQUtoQixLQUFhLEVBQUU7MEJBTHZCLHdCQUF3Qjs7QUFNMUIsK0JBTkUsd0JBQXdCLDZDQU1wQixLQUFLLEVBQUU7O0FBRWIsUUFBSSxDQUFDLE1BQU0sR0FBRyw4QkFBYyxXQUFXLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gseUJBQW1CLEVBQUUsS0FBSztLQUMzQixDQUFDO0FBQ0YsUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztHQUMvQzs7ZUFiRyx3QkFBd0I7O1dBZVgsNkJBQVM7QUFDeEIsVUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDOUQsQ0FBQztBQUNGLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUY7OztXQUVtQixnQ0FBUztBQUMzQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFSyxrQkFBRztBQUNQLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNELFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLElBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQzlELGVBQU8sR0FBRyx3RkFBMEIsZ0JBQWdCLEVBQUUsZ0JBQWdCLEFBQUMsR0FBRyxDQUFDO09BQzVFOztBQUdELGFBQ0U7O1VBQUssU0FBUyxFQUFDLHFDQUFxQztRQUNqRCxPQUFPO1FBQ1IsOERBQVk7T0FDUixDQUNOO0tBQ0g7OztXQUVxQixrQ0FBUztBQUM3QixVQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQzs7QUFFbkUsVUFBSSxtQkFBbUIsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFO0FBQzFELFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxtQkFBbUIsRUFBbkIsbUJBQW1CLEVBQUMsQ0FBQyxDQUFDO09BQ3RDLE1BQU07O0FBRUwsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ3BCO0tBQ0Y7OztTQXBERyx3QkFBd0I7R0FBUyxvQkFBTSxTQUFTOztBQXVEdEQsTUFBTSxDQUFDLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZVNpZGViYXJDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKmVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IEZpbGVUcmVlIGZyb20gJy4vRmlsZVRyZWUnO1xuaW1wb3J0IHtGaWxlVHJlZVRvb2xiYXJDb21wb25lbnR9IGZyb20gJy4vRmlsZVRyZWVUb29sYmFyQ29tcG9uZW50JztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHNob3VsZFJlbmRlclRvb2xiYXI6IGJvb2xlYW47XG59XG5cbmNsYXNzIEZpbGVUcmVlU2lkZWJhckNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzaG91bGRSZW5kZXJUb29sYmFyOiBmYWxzZSxcbiAgICB9O1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3Byb2Nlc3NFeHRlcm5hbFVwZGF0ZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMuX3N0b3JlLnN1YnNjcmliZSh0aGlzLl9wcm9jZXNzRXh0ZXJuYWxVcGRhdGUuYmluZCh0aGlzKSlcbiAgICApO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyh0aGlzLl9wcm9jZXNzRXh0ZXJuYWxVcGRhdGUuYmluZCh0aGlzKSkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHdvcmtpbmdTZXRzU3RvcmUgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0c1N0b3JlKCk7XG4gICAgbGV0IHRvb2xiYXI7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2hvdWxkUmVuZGVyVG9vbGJhciAmJiB3b3JraW5nU2V0c1N0b3JlICE9IG51bGwpIHtcbiAgICAgIHRvb2xiYXIgPSA8RmlsZVRyZWVUb29sYmFyQ29tcG9uZW50IHdvcmtpbmdTZXRzU3RvcmU9e3dvcmtpbmdTZXRzU3RvcmV9IC8+O1xuICAgIH1cblxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1jb250YWluZXJcIj5cbiAgICAgICAge3Rvb2xiYXJ9XG4gICAgICAgIDxGaWxlVHJlZSAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9wcm9jZXNzRXh0ZXJuYWxVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgc2hvdWxkUmVuZGVyVG9vbGJhciA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCkubGVuZ3RoICE9PSAwO1xuXG4gICAgaWYgKHNob3VsZFJlbmRlclRvb2xiYXIgIT09IHRoaXMuc3RhdGUuc2hvdWxkUmVuZGVyVG9vbGJhcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvdWxkUmVuZGVyVG9vbGJhcn0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOb3RlOiBJdCdzIHNhZmUgdG8gY2FsbCBmb3JjZVVwZGF0ZSBoZXJlIGJlY2F1c2UgdGhlIGNoYW5nZSBldmVudHMgYXJlIGRlLWJvdW5jZWQuXG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVTaWRlYmFyQ29tcG9uZW50O1xuIl19