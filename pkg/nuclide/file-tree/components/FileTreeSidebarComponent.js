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
        _reactForAtom.React.createElement(_FileTree2['default'], { nodeToKeepInView: this._store.getTrackedNode() })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlU2lkZWJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFhb0IsZ0JBQWdCOzt3QkFDZixZQUFZOzs7O3dDQUNNLDRCQUE0Qjs7Z0NBQ3pDLHNCQUFzQjs7OztvQkFDZCxNQUFNOztJQU1sQyx3QkFBd0I7WUFBeEIsd0JBQXdCOztBQUtqQixXQUxQLHdCQUF3QixDQUtoQixLQUFhLEVBQUU7MEJBTHZCLHdCQUF3Qjs7QUFNMUIsK0JBTkUsd0JBQXdCLDZDQU1wQixLQUFLLEVBQUU7O0FBRWIsUUFBSSxDQUFDLE1BQU0sR0FBRyw4QkFBYyxXQUFXLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gseUJBQW1CLEVBQUUsS0FBSztLQUMzQixDQUFDO0FBQ0YsUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztHQUMvQzs7ZUFiRyx3QkFBd0I7O1dBZVgsNkJBQVM7QUFDeEIsVUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDOUQsQ0FBQztBQUNGLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUY7OztXQUVtQixnQ0FBUztBQUMzQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFSyxrQkFBRztBQUNQLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNELFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLElBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQzlELGVBQU8sR0FBRyx3RkFBMEIsZ0JBQWdCLEVBQUUsZ0JBQWdCLEFBQUMsR0FBRyxDQUFDO09BQzVFOztBQUdELGFBQ0U7O1VBQUssU0FBUyxFQUFDLHFDQUFxQztRQUNqRCxPQUFPO1FBQ1IsMkRBQVUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQUFBQyxHQUFHO09BQ3hELENBQ047S0FDSDs7O1dBRXFCLGtDQUFTO0FBQzdCLFVBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDOztBQUVuRSxVQUFJLG1CQUFtQixLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7QUFDMUQsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLG1CQUFtQixFQUFuQixtQkFBbUIsRUFBQyxDQUFDLENBQUM7T0FDdEMsTUFBTTs7QUFFTCxZQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDcEI7S0FDRjs7O1NBcERHLHdCQUF3QjtHQUFTLG9CQUFNLFNBQVM7O0FBdUR0RCxNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IkZpbGVUcmVlU2lkZWJhckNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgRmlsZVRyZWUgZnJvbSAnLi9GaWxlVHJlZSc7XG5pbXBvcnQge0ZpbGVUcmVlVG9vbGJhckNvbXBvbmVudH0gZnJvbSAnLi9GaWxlVHJlZVRvb2xiYXJDb21wb25lbnQnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2hvdWxkUmVuZGVyVG9vbGJhcjogYm9vbGVhbjtcbn1cblxuY2xhc3MgRmlsZVRyZWVTaWRlYmFyQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNob3VsZFJlbmRlclRvb2xiYXI6IGZhbHNlLFxuICAgIH07XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvY2Vzc0V4dGVybmFsVXBkYXRlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgdGhpcy5fc3RvcmUuc3Vic2NyaWJlKHRoaXMuX3Byb2Nlc3NFeHRlcm5hbFVwZGF0ZS5iaW5kKHRoaXMpKVxuICAgICk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMuX3Byb2Nlc3NFeHRlcm5hbFVwZGF0ZS5iaW5kKHRoaXMpKSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qgd29ya2luZ1NldHNTdG9yZSA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXRzU3RvcmUoKTtcbiAgICBsZXQgdG9vbGJhcjtcbiAgICBpZiAodGhpcy5zdGF0ZS5zaG91bGRSZW5kZXJUb29sYmFyICYmIHdvcmtpbmdTZXRzU3RvcmUgIT0gbnVsbCkge1xuICAgICAgdG9vbGJhciA9IDxGaWxlVHJlZVRvb2xiYXJDb21wb25lbnQgd29ya2luZ1NldHNTdG9yZT17d29ya2luZ1NldHNTdG9yZX0gLz47XG4gICAgfVxuXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWNvbnRhaW5lclwiPlxuICAgICAgICB7dG9vbGJhcn1cbiAgICAgICAgPEZpbGVUcmVlIG5vZGVUb0tlZXBJblZpZXc9e3RoaXMuX3N0b3JlLmdldFRyYWNrZWROb2RlKCl9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3Byb2Nlc3NFeHRlcm5hbFVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBzaG91bGRSZW5kZXJUb29sYmFyID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKS5sZW5ndGggIT09IDA7XG5cbiAgICBpZiAoc2hvdWxkUmVuZGVyVG9vbGJhciAhPT0gdGhpcy5zdGF0ZS5zaG91bGRSZW5kZXJUb29sYmFyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzaG91bGRSZW5kZXJUb29sYmFyfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vdGU6IEl0J3Mgc2FmZSB0byBjYWxsIGZvcmNlVXBkYXRlIGhlcmUgYmVjYXVzZSB0aGUgY2hhbmdlIGV2ZW50cyBhcmUgZGUtYm91bmNlZC5cbiAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZVNpZGViYXJDb21wb25lbnQ7XG4iXX0=