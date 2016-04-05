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

var _nuclideUiLibPanelComponentScroller = require('../../nuclide-ui/lib/PanelComponentScroller');

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
        _reactForAtom.React.createElement(
          _nuclideUiLibPanelComponentScroller.PanelComponentScroller,
          null,
          _reactForAtom.React.createElement(_FileTree2['default'], { nodeToKeepInView: this._store.getTrackedNode(), ref: 'fileTree' })
        )
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlU2lkZWJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBY08sZ0JBQWdCOzt3QkFDRixZQUFZOzs7O3dDQUNNLDRCQUE0Qjs7Z0NBQ3pDLHNCQUFzQjs7OztvQkFDZCxNQUFNOztrREFDSCw2Q0FBNkM7O0lBTTVFLHdCQUF3QjtZQUF4Qix3QkFBd0I7O0FBS2pCLFdBTFAsd0JBQXdCLENBS2hCLEtBQWEsRUFBRTswQkFMdkIsd0JBQXdCOztBQU0xQiwrQkFORSx3QkFBd0IsNkNBTXBCLEtBQUssRUFBRTs7QUFFYixRQUFJLENBQUMsTUFBTSxHQUFHLDhCQUFjLFdBQVcsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCx5QkFBbUIsRUFBRSxLQUFLO0tBQzNCLENBQUM7QUFDRixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0FBQzlDLEFBQUMsUUFBSSxDQUFPLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN6RDs7ZUFkRyx3QkFBd0I7O1dBZ0JYLDZCQUFTO0FBQ3hCLFVBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQzlELENBQUM7QUFDRixVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlGOzs7V0FFbUIsZ0NBQVM7QUFDM0IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRVcsc0JBQUMsS0FBcUIsRUFBUTs7O0FBR3hDLFVBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDL0MsK0JBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNyRDtLQUNGOzs7V0FFSyxrQkFBRztBQUNQLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNELFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLElBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQzlELGVBQU8sR0FBRyx3RkFBMEIsZ0JBQWdCLEVBQUUsZ0JBQWdCLEFBQUMsR0FBRyxDQUFDO09BQzVFOzs7QUFHRCxhQUNFOzs7QUFDRSxtQkFBUyxFQUFDLHFDQUFxQztBQUMvQyxpQkFBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7QUFDM0Isa0JBQVEsRUFBRSxDQUFDLEFBQUM7UUFDWCxPQUFPO1FBQ1I7OztVQUNFLDJEQUFVLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEFBQUMsRUFBQyxHQUFHLEVBQUMsVUFBVSxHQUFHO1NBQ3BEO09BQ3JCLENBQ047S0FDSDs7O1dBRXFCLGtDQUFTO0FBQzdCLFVBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDOztBQUVuRSxVQUFJLG1CQUFtQixLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7QUFDMUQsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLG1CQUFtQixFQUFuQixtQkFBbUIsRUFBQyxDQUFDLENBQUM7T0FDdEMsTUFBTTs7QUFFTCxZQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDcEI7S0FDRjs7O1NBbEVHLHdCQUF3QjtHQUFTLG9CQUFNLFNBQVM7O0FBcUV0RCxNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IkZpbGVUcmVlU2lkZWJhckNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IEZpbGVUcmVlIGZyb20gJy4vRmlsZVRyZWUnO1xuaW1wb3J0IHtGaWxlVHJlZVRvb2xiYXJDb21wb25lbnR9IGZyb20gJy4vRmlsZVRyZWVUb29sYmFyQ29tcG9uZW50JztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1BhbmVsQ29tcG9uZW50U2Nyb2xsZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1BhbmVsQ29tcG9uZW50U2Nyb2xsZXInO1xuXG50eXBlIFN0YXRlID0ge1xuICBzaG91bGRSZW5kZXJUb29sYmFyOiBib29sZWFuO1xufVxuXG5jbGFzcyBGaWxlVHJlZVNpZGViYXJDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2hvdWxkUmVuZGVyVG9vbGJhcjogZmFsc2UsXG4gICAgfTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUZvY3VzID0gdGhpcy5faGFuZGxlRm9jdXMuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3Byb2Nlc3NFeHRlcm5hbFVwZGF0ZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMuX3N0b3JlLnN1YnNjcmliZSh0aGlzLl9wcm9jZXNzRXh0ZXJuYWxVcGRhdGUuYmluZCh0aGlzKSlcbiAgICApO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyh0aGlzLl9wcm9jZXNzRXh0ZXJuYWxVcGRhdGUuYmluZCh0aGlzKSkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2hhbmRsZUZvY3VzKGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIC8vIERlbGVnYXRlIGZvY3VzIHRvIHRoZSBGaWxlVHJlZSBjb21wb25lbnQgaWYgdGhpcyBjb21wb25lbnQgZ2FpbnMgZm9jdXMgYmVjYXVzZSB0aGUgRmlsZVRyZWVcbiAgICAvLyBtYXRjaGVzIHRoZSBzZWxlY3RvcnMgdGFyZ2V0ZWQgYnkgdGhlbWVzIHRvIHNob3cgdGhlIGNvbnRhaW5pbmcgcGFuZWwgaGFzIGZvY3VzLlxuICAgIGlmIChldmVudC50YXJnZXQgPT09IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpKSB7XG4gICAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2ZpbGVUcmVlJ10pLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHdvcmtpbmdTZXRzU3RvcmUgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0c1N0b3JlKCk7XG4gICAgbGV0IHRvb2xiYXI7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2hvdWxkUmVuZGVyVG9vbGJhciAmJiB3b3JraW5nU2V0c1N0b3JlICE9IG51bGwpIHtcbiAgICAgIHRvb2xiYXIgPSA8RmlsZVRyZWVUb29sYmFyQ29tcG9uZW50IHdvcmtpbmdTZXRzU3RvcmU9e3dvcmtpbmdTZXRzU3RvcmV9IC8+O1xuICAgIH1cblxuICAgIC8vIEluY2x1ZGUgYHRhYkluZGV4YCBzbyB0aGlzIGNvbXBvbmVudCBjYW4gYmUgZm9jdXNlZCBieSBjYWxsaW5nIGl0cyBuYXRpdmUgYGZvY3VzYCBtZXRob2QuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1jb250YWluZXJcIlxuICAgICAgICBvbkZvY3VzPXt0aGlzLl9oYW5kbGVGb2N1c31cbiAgICAgICAgdGFiSW5kZXg9ezB9PlxuICAgICAgICB7dG9vbGJhcn1cbiAgICAgICAgPFBhbmVsQ29tcG9uZW50U2Nyb2xsZXI+XG4gICAgICAgICAgPEZpbGVUcmVlIG5vZGVUb0tlZXBJblZpZXc9e3RoaXMuX3N0b3JlLmdldFRyYWNrZWROb2RlKCl9IHJlZj1cImZpbGVUcmVlXCIgLz5cbiAgICAgICAgPC9QYW5lbENvbXBvbmVudFNjcm9sbGVyPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9wcm9jZXNzRXh0ZXJuYWxVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgc2hvdWxkUmVuZGVyVG9vbGJhciA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCkubGVuZ3RoICE9PSAwO1xuXG4gICAgaWYgKHNob3VsZFJlbmRlclRvb2xiYXIgIT09IHRoaXMuc3RhdGUuc2hvdWxkUmVuZGVyVG9vbGJhcikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvdWxkUmVuZGVyVG9vbGJhcn0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOb3RlOiBJdCdzIHNhZmUgdG8gY2FsbCBmb3JjZVVwZGF0ZSBoZXJlIGJlY2F1c2UgdGhlIGNoYW5nZSBldmVudHMgYXJlIGRlLWJvdW5jZWQuXG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVTaWRlYmFyQ29tcG9uZW50O1xuIl19