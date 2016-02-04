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

/*eslint-disable react/prop-types */

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

exports['default'] = Webview;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFhOEMsTUFBTTs7NEJBSTdDLGdCQUFnQjs7SUFVRixPQUFPO1lBQVAsT0FBTzs7QUFFZixXQUZRLE9BQU8sQ0FFZCxLQUFhLEVBQUU7MEJBRlIsT0FBTzs7QUFHeEIsK0JBSGlCLE9BQU8sNkNBR2xCLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pFLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7R0FDL0M7O2VBTmtCLE9BQU87O1dBUVQsNkJBQUc7OztBQUNsQixVQUFNLE9BQU8sR0FBRyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7OztBQU0zQyxhQUFPLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDdkUsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ25CLHFCQUNFO2VBQU0sT0FBTyxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLE1BQUssb0JBQW9CLENBQUM7T0FBQSxDQUNoRixDQUNGLENBQUM7O0FBRUYsVUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNCOzs7V0FFaUIsNEJBQUMsU0FBZ0IsRUFBUTtBQUN6QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDbEM7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFSyxrQkFBa0I7QUFDdEIsYUFDRSwrQ0FBUyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEFBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEFBQUMsR0FBRyxDQUNyRTtLQUNIOzs7Ozs7Ozs7O1dBUWUsMEJBQUMsU0FBaUIsRUFBUTs7O0FBQ3hDLFVBQU0sT0FBTyxHQUFHLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxVQUFNLFlBQVksR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUMvRCxVQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJO2VBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDOUYsaUJBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDMUIsWUFBTSxLQUFLLEdBQUcsT0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsWUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFlBQU0sWUFBWSxHQUFHLEtBQUssS0FBSyxTQUFTLENBQUM7QUFDekMsWUFBSSxZQUFZLEVBQUU7QUFDaEIsaUJBQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDdkI7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRW1CLDhCQUFDLEtBQVksRUFBUTtBQUN2QyxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFO0FBQzlCLFlBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ25DO0tBQ0Y7OztTQS9Ea0IsT0FBTztHQUFTLG9CQUFNLFNBQVM7O3FCQUEvQixPQUFPIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKmVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjbGFzc05hbWU6ID9zdHJpbmc7XG4gIG5vZGVpbnRlZ3JhdGlvbjogP2Jvb2xlYW47XG4gIG9uRGlkRmluaXNoTG9hZDogKGV2ZW50OiBFdmVudCkgPT4gbWl4ZWQ7XG4gIHNyYzogc3RyaW5nO1xuICBzdHlsZTogP09iamVjdDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYnZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2hhbmRsZURpZEZpbmlzaExvYWQgPSB0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuXG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycy4gVGhpcyBoYXMgdGhlIGRyYXdiYWNrcyBvZiAxKSBhZGRpbmcgYW4gZXZlbnQgbGlzdGVuZXIgZXZlbiB3aGVuIHdlIGRvbid0XG4gICAgLy8gaGF2ZSBhIGNhbGxiYWNrIGZvciBpdCBhbmQgMikgbmVlZGluZyB0byBhZGQgZXhwbGljaXQgc3VwcG9ydCBmb3IgZWFjaCBldmVudCB0eXBlIHdlIHdhbnQgdG9cbiAgICAvLyBzdXBwb3J0LiBIb3dldmVyLCB0aG9zZSBjb3N0cyBhcmVuJ3QgZ3JlYXQgZW5vdWdoIHRvIGp1c3RpZnkgYSBuZXcgYWJzdHJhY3Rpb24gZm9yIG1hbmFnaW5nXG4gICAgLy8gaXQgYXQgdGhpcyB0aW1lLlxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGlkLWZpbmlzaC1sb2FkJywgdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoXG4gICAgICAgICgpID0+IGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGlkLWZpbmlzaC1sb2FkJywgdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZCksXG4gICAgICApLFxuICAgICk7XG5cbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoe30pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMocHJldlByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPHdlYnZpZXcgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0gc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9IC8+XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGF0dHJpYnV0ZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudC4gQ3VzdG9tIGF0dHJpYnV0ZXMgd29uJ3QgYmUgYWRkZWQgYnkgUmVhY3QgYmVjYXVzZVxuICAgKiBcIndlYnZpZXdcIiBpc24ndCBhIHZhbGlkIGN1c3RvbSBlbGVtZW50IG5hbWUgKGN1c3RvbSBlbGVtZW50cyBuZWVkIGEgZGFzaCksIHNvIHdlIHNldCB0aGVcbiAgICogYXR0cmlidXRlcyBvdXJzZWx2ZXMuIEJ1dCBub3QgXCJjbGFzc05hbWVcIiBvciBcInN0eWxlXCIgYmVjYXVzZSBSZWFjdCBoYXMgc3BlY2lhbCBydWxlcyBmb3IgdGhvc2UuXG4gICAqICpzaWdoKlxuICAgKi9cbiAgdXBkYXRlQXR0cmlidXRlcyhwcmV2UHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCBzcGVjaWFsUHJvcHMgPSBbJ2NsYXNzTmFtZScsICdzdHlsZScsICdvbkRpZEZpbmlzaExvYWQnXTtcbiAgICBjb25zdCBub3JtYWxQcm9wcyA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMpLmZpbHRlcihwcm9wID0+IHNwZWNpYWxQcm9wcy5pbmRleE9mKHByb3ApID09PSAtMSk7XG4gICAgbm9ybWFsUHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wcm9wc1twcm9wXTtcbiAgICAgIGNvbnN0IHByZXZWYWx1ZSA9IHByZXZQcm9wc1twcm9wXTtcbiAgICAgIGNvbnN0IHZhbHVlQ2hhbmdlZCA9IHZhbHVlICE9PSBwcmV2VmFsdWU7XG4gICAgICBpZiAodmFsdWVDaGFuZ2VkKSB7XG4gICAgICAgIGVsZW1lbnRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVEaWRGaW5pc2hMb2FkKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLm9uRGlkRmluaXNoTG9hZCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZEZpbmlzaExvYWQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=