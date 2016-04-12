Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

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

      var element = _reactForAtom.ReactDOM.findDOMNode(this);

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
      return _reactForAtom.React.createElement('webview', { className: this.props.className, style: this.props.style });
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

      var element = _reactForAtom.ReactDOM.findDOMNode(this);
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
})(_reactForAtom.React.Component);

exports.Webview = Webview;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldlYnZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBVzhDLE1BQU07OzRCQUk3QyxnQkFBZ0I7O0lBVVYsT0FBTztZQUFQLE9BQU87O0FBS1AsV0FMQSxPQUFPLENBS04sS0FBYSxFQUFFOzBCQUxoQixPQUFPOztBQU1oQiwrQkFOUyxPQUFPLDZDQU1WLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEUsUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztHQUMvQzs7ZUFUVSxPQUFPOztXQVdELDZCQUFHOzs7QUFDbEIsVUFBTSxPQUFPLEdBQUcsdUJBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNM0MsYUFBTyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixxQkFDRTtlQUFNLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxNQUFLLG9CQUFvQixDQUFDO09BQUEsQ0FDaEYsQ0FDRixDQUFDOztBQUVGLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMzQjs7O1dBRWlCLDRCQUFDLFNBQWdCLEVBQVE7QUFDekMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2xDOzs7V0FFbUIsZ0NBQUc7QUFDckIsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRUssa0JBQWtCO0FBQ3RCLGFBQ0UsK0NBQVMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxBQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDLEdBQUcsQ0FDckU7S0FDSDs7Ozs7Ozs7OztXQVFlLDBCQUFDLFNBQWlCLEVBQVE7OztBQUN4QyxVQUFNLE9BQU8sR0FBRyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsVUFBTSxZQUFZLEdBQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFDL0QsVUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtlQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQzlGLGlCQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzFCLFlBQU0sS0FBSyxHQUFHLE9BQUssS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLFlBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxZQUFNLFlBQVksR0FBRyxLQUFLLEtBQUssU0FBUyxDQUFDO0FBQ3pDLFlBQUksWUFBWSxFQUFFO0FBQ2hCLGlCQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3ZCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVtQiw4QkFBQyxLQUFZLEVBQVE7QUFDdkMsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRTtBQUM5QixZQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNuQztLQUNGOzs7U0FsRVUsT0FBTztHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiV2Vidmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgY2xhc3NOYW1lOiA/c3RyaW5nO1xuICBub2RlaW50ZWdyYXRpb24/OiBib29sZWFuO1xuICBvbkRpZEZpbmlzaExvYWQ6IChldmVudDogRXZlbnQpID0+IG1peGVkO1xuICBzcmM6IHN0cmluZztcbiAgc3R5bGU6ID9PYmplY3Q7XG59O1xuXG5leHBvcnQgY2xhc3MgV2VidmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZURpZEZpbmlzaExvYWQgPSB0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuXG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycy4gVGhpcyBoYXMgdGhlIGRyYXdiYWNrcyBvZiAxKSBhZGRpbmcgYW4gZXZlbnQgbGlzdGVuZXIgZXZlbiB3aGVuIHdlIGRvbid0XG4gICAgLy8gaGF2ZSBhIGNhbGxiYWNrIGZvciBpdCBhbmQgMikgbmVlZGluZyB0byBhZGQgZXhwbGljaXQgc3VwcG9ydCBmb3IgZWFjaCBldmVudCB0eXBlIHdlIHdhbnQgdG9cbiAgICAvLyBzdXBwb3J0LiBIb3dldmVyLCB0aG9zZSBjb3N0cyBhcmVuJ3QgZ3JlYXQgZW5vdWdoIHRvIGp1c3RpZnkgYSBuZXcgYWJzdHJhY3Rpb24gZm9yIG1hbmFnaW5nXG4gICAgLy8gaXQgYXQgdGhpcyB0aW1lLlxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGlkLWZpbmlzaC1sb2FkJywgdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoXG4gICAgICAgICgpID0+IGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGlkLWZpbmlzaC1sb2FkJywgdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZCksXG4gICAgICApLFxuICAgICk7XG5cbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoe30pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMocHJldlByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPHdlYnZpZXcgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0gc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9IC8+XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGF0dHJpYnV0ZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudC4gQ3VzdG9tIGF0dHJpYnV0ZXMgd29uJ3QgYmUgYWRkZWQgYnkgUmVhY3QgYmVjYXVzZVxuICAgKiBcIndlYnZpZXdcIiBpc24ndCBhIHZhbGlkIGN1c3RvbSBlbGVtZW50IG5hbWUgKGN1c3RvbSBlbGVtZW50cyBuZWVkIGEgZGFzaCksIHNvIHdlIHNldCB0aGVcbiAgICogYXR0cmlidXRlcyBvdXJzZWx2ZXMuIEJ1dCBub3QgXCJjbGFzc05hbWVcIiBvciBcInN0eWxlXCIgYmVjYXVzZSBSZWFjdCBoYXMgc3BlY2lhbCBydWxlcyBmb3IgdGhvc2UuXG4gICAqICpzaWdoKlxuICAgKi9cbiAgdXBkYXRlQXR0cmlidXRlcyhwcmV2UHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCBzcGVjaWFsUHJvcHMgPSBbJ2NsYXNzTmFtZScsICdzdHlsZScsICdvbkRpZEZpbmlzaExvYWQnXTtcbiAgICBjb25zdCBub3JtYWxQcm9wcyA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMpLmZpbHRlcihwcm9wID0+IHNwZWNpYWxQcm9wcy5pbmRleE9mKHByb3ApID09PSAtMSk7XG4gICAgbm9ybWFsUHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wcm9wc1twcm9wXTtcbiAgICAgIGNvbnN0IHByZXZWYWx1ZSA9IHByZXZQcm9wc1twcm9wXTtcbiAgICAgIGNvbnN0IHZhbHVlQ2hhbmdlZCA9IHZhbHVlICE9PSBwcmV2VmFsdWU7XG4gICAgICBpZiAodmFsdWVDaGFuZ2VkKSB7XG4gICAgICAgIGVsZW1lbnRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVEaWRGaW5pc2hMb2FkKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLm9uRGlkRmluaXNoTG9hZCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZEZpbmlzaExvYWQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=