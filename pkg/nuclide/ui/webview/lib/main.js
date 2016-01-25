Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var Webview = (function (_React$Component) {
  _inherits(Webview, _React$Component);

  function Webview(props) {
    _classCallCheck(this, Webview);

    _get(Object.getPrototypeOf(Webview.prototype), 'constructor', this).call(this, props);
    this._handleDidFinishLoad = this._handleDidFinishLoad.bind(this);
    this._disposables = new _atom.CompositeDisposable();
  }

  _createClass(Webview, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var element = _reactForAtom2['default'].findDOMNode(this);

      // Add event listeners. This has the drawbacks of 1) adding an event listener even when we don't
      // have a callback for it and 2) needing to add explicit support for each event type we want to
      // support. However, those costs aren't great enough to justify a new abstraction for managing
      // it at this time.
      element.addEventListener('did-finish-load', this._handleDidFinishLoad);
      this._disposables.add(new _atom.Disposable(function () {
        return element.removeEventListener('did-finish-load', _this._handleDidFinishLoad);
      }));

      this.updateAttributes({});
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      this.updateAttributes(prevProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom2['default'].createElement('webview', { className: this.props.className, style: this.props.style });
    }

    /**
     * Update the attributes on the current element. Custom attributes won't be added by React because
     * "webview" isn't a valid custom element name (custom elements need a dash), so we set the
     * attributes ourselves. But not "className" or "style" because React has special rules for those.
     * *sigh*
     */
  }, {
    key: 'updateAttributes',
    value: function updateAttributes(prevProps) {
      var _this2 = this;

      var element = _reactForAtom2['default'].findDOMNode(this);
      var specialProps = ['className', 'style', 'onDidFinishLoad'];
      var normalProps = Object.keys(this.props).filter(function (prop) {
        return specialProps.indexOf(prop) === -1;
      });
      normalProps.forEach(function (prop) {
        var value = _this2.props[prop];
        var prevValue = prevProps[prop];
        var valueChanged = value !== prevValue;
        if (valueChanged) {
          element[prop] = value;
        }
      });
    }
  }, {
    key: '_handleDidFinishLoad',
    value: function _handleDidFinishLoad(event) {
      if (this.props.onDidFinishLoad) {
        this.props.onDidFinishLoad(event);
      }
    }
  }]);

  return Webview;
})(_reactForAtom2['default'].Component);

exports['default'] = Webview;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWE4QyxNQUFNOzs0QkFDbEMsZ0JBQWdCOzs7O0lBVWIsT0FBTztZQUFQLE9BQU87O0FBRWYsV0FGUSxPQUFPLENBRWQsS0FBYSxFQUFFOzBCQUZSLE9BQU87O0FBR3hCLCtCQUhpQixPQUFPLDZDQUdsQixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRSxRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0dBQy9DOztlQU5rQixPQUFPOztXQVFULDZCQUFHOzs7QUFDbEIsVUFBTSxPQUFPLEdBQUcsMEJBQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNeEMsYUFBTyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixxQkFDRTtlQUFNLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxNQUFLLG9CQUFvQixDQUFDO09BQUEsQ0FDaEYsQ0FDRixDQUFDOztBQUVGLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMzQjs7O1dBRWlCLDRCQUFDLFNBQWdCLEVBQVE7QUFDekMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2xDOzs7V0FFbUIsZ0NBQUc7QUFDckIsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRUssa0JBQWtCO0FBQ3RCLGFBQ0UscURBQVMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxBQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDLEdBQUcsQ0FDckU7S0FDSDs7Ozs7Ozs7OztXQVFlLDBCQUFDLFNBQWlCLEVBQVE7OztBQUN4QyxVQUFNLE9BQU8sR0FBRywwQkFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsVUFBTSxZQUFZLEdBQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFDL0QsVUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtlQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQzlGLGlCQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzFCLFlBQU0sS0FBSyxHQUFHLE9BQUssS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLFlBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxZQUFNLFlBQVksR0FBRyxLQUFLLEtBQUssU0FBUyxDQUFDO0FBQ3pDLFlBQUksWUFBWSxFQUFFO0FBQ2hCLGlCQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3ZCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVtQiw4QkFBQyxLQUFZLEVBQVE7QUFDdkMsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRTtBQUM5QixZQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNuQztLQUNGOzs7U0EvRGtCLE9BQU87R0FBUywwQkFBTSxTQUFTOztxQkFBL0IsT0FBTyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyplc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjbGFzc05hbWU6ID9zdHJpbmc7XG4gIG5vZGVpbnRlZ3JhdGlvbjogP2Jvb2xlYW47XG4gIG9uRGlkRmluaXNoTG9hZDogKGV2ZW50OiBFdmVudCkgPT4gbWl4ZWQ7XG4gIHNyYzogc3RyaW5nO1xuICBzdHlsZTogP09iamVjdDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYnZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHM+IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2hhbmRsZURpZEZpbmlzaExvYWQgPSB0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMpO1xuXG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycy4gVGhpcyBoYXMgdGhlIGRyYXdiYWNrcyBvZiAxKSBhZGRpbmcgYW4gZXZlbnQgbGlzdGVuZXIgZXZlbiB3aGVuIHdlIGRvbid0XG4gICAgLy8gaGF2ZSBhIGNhbGxiYWNrIGZvciBpdCBhbmQgMikgbmVlZGluZyB0byBhZGQgZXhwbGljaXQgc3VwcG9ydCBmb3IgZWFjaCBldmVudCB0eXBlIHdlIHdhbnQgdG9cbiAgICAvLyBzdXBwb3J0LiBIb3dldmVyLCB0aG9zZSBjb3N0cyBhcmVuJ3QgZ3JlYXQgZW5vdWdoIHRvIGp1c3RpZnkgYSBuZXcgYWJzdHJhY3Rpb24gZm9yIG1hbmFnaW5nXG4gICAgLy8gaXQgYXQgdGhpcyB0aW1lLlxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGlkLWZpbmlzaC1sb2FkJywgdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoXG4gICAgICAgICgpID0+IGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGlkLWZpbmlzaC1sb2FkJywgdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZCksXG4gICAgICApLFxuICAgICk7XG5cbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoe30pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMocHJldlByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPHdlYnZpZXcgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0gc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9IC8+XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGF0dHJpYnV0ZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudC4gQ3VzdG9tIGF0dHJpYnV0ZXMgd29uJ3QgYmUgYWRkZWQgYnkgUmVhY3QgYmVjYXVzZVxuICAgKiBcIndlYnZpZXdcIiBpc24ndCBhIHZhbGlkIGN1c3RvbSBlbGVtZW50IG5hbWUgKGN1c3RvbSBlbGVtZW50cyBuZWVkIGEgZGFzaCksIHNvIHdlIHNldCB0aGVcbiAgICogYXR0cmlidXRlcyBvdXJzZWx2ZXMuIEJ1dCBub3QgXCJjbGFzc05hbWVcIiBvciBcInN0eWxlXCIgYmVjYXVzZSBSZWFjdCBoYXMgc3BlY2lhbCBydWxlcyBmb3IgdGhvc2UuXG4gICAqICpzaWdoKlxuICAgKi9cbiAgdXBkYXRlQXR0cmlidXRlcyhwcmV2UHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCBzcGVjaWFsUHJvcHMgPSBbJ2NsYXNzTmFtZScsICdzdHlsZScsICdvbkRpZEZpbmlzaExvYWQnXTtcbiAgICBjb25zdCBub3JtYWxQcm9wcyA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMpLmZpbHRlcihwcm9wID0+IHNwZWNpYWxQcm9wcy5pbmRleE9mKHByb3ApID09PSAtMSk7XG4gICAgbm9ybWFsUHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wcm9wc1twcm9wXTtcbiAgICAgIGNvbnN0IHByZXZWYWx1ZSA9IHByZXZQcm9wc1twcm9wXTtcbiAgICAgIGNvbnN0IHZhbHVlQ2hhbmdlZCA9IHZhbHVlICE9PSBwcmV2VmFsdWU7XG4gICAgICBpZiAodmFsdWVDaGFuZ2VkKSB7XG4gICAgICAgIGVsZW1lbnRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVEaWRGaW5pc2hMb2FkKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLm9uRGlkRmluaXNoTG9hZCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZEZpbmlzaExvYWQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=