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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFhOEMsTUFBTTs7NEJBSTdDLGdCQUFnQjs7SUFVRixPQUFPO1lBQVAsT0FBTzs7QUFHZixXQUhRLE9BQU8sQ0FHZCxLQUFhLEVBQUU7MEJBSFIsT0FBTzs7QUFJeEIsK0JBSmlCLE9BQU8sNkNBSWxCLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEUsUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztHQUMvQzs7ZUFQa0IsT0FBTzs7V0FTVCw2QkFBRzs7O0FBQ2xCLFVBQU0sT0FBTyxHQUFHLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTTNDLGFBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN2RSxVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FDbkIscUJBQ0U7ZUFBTSxPQUFPLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsTUFBSyxvQkFBb0IsQ0FBQztPQUFBLENBQ2hGLENBQ0YsQ0FBQzs7QUFFRixVQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDM0I7OztXQUVpQiw0QkFBQyxTQUFnQixFQUFRO0FBQ3pDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNsQzs7O1dBRW1CLGdDQUFHO0FBQ3JCLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVLLGtCQUFrQjtBQUN0QixhQUNFLCtDQUFTLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQUFBQyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQUFBQyxHQUFHLENBQ3JFO0tBQ0g7Ozs7Ozs7Ozs7V0FRZSwwQkFBQyxTQUFpQixFQUFROzs7QUFDeEMsVUFBTSxPQUFPLEdBQUcsdUJBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLFVBQU0sWUFBWSxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQy9ELFVBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7ZUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQztBQUM5RixpQkFBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMxQixZQUFNLEtBQUssR0FBRyxPQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixZQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsWUFBTSxZQUFZLEdBQUcsS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUN6QyxZQUFJLFlBQVksRUFBRTtBQUNoQixpQkFBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztTQUN2QjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFbUIsOEJBQUMsS0FBWSxFQUFRO0FBQ3ZDLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7QUFDOUIsWUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDbkM7S0FDRjs7O1NBaEVrQixPQUFPO0dBQVMsb0JBQU0sU0FBUzs7cUJBQS9CLE9BQU8iLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNsYXNzTmFtZTogP3N0cmluZztcbiAgbm9kZWludGVncmF0aW9uPzogYm9vbGVhbjtcbiAgb25EaWRGaW5pc2hMb2FkOiAoZXZlbnQ6IEV2ZW50KSA9PiBtaXhlZDtcbiAgc3JjOiBzdHJpbmc7XG4gIHN0eWxlOiA/T2JqZWN0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2VidmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlRGlkRmluaXNoTG9hZCA9IHRoaXMuX2hhbmRsZURpZEZpbmlzaExvYWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG5cbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzLiBUaGlzIGhhcyB0aGUgZHJhd2JhY2tzIG9mIDEpIGFkZGluZyBhbiBldmVudCBsaXN0ZW5lciBldmVuIHdoZW4gd2UgZG9uJ3RcbiAgICAvLyBoYXZlIGEgY2FsbGJhY2sgZm9yIGl0IGFuZCAyKSBuZWVkaW5nIHRvIGFkZCBleHBsaWNpdCBzdXBwb3J0IGZvciBlYWNoIGV2ZW50IHR5cGUgd2Ugd2FudCB0b1xuICAgIC8vIHN1cHBvcnQuIEhvd2V2ZXIsIHRob3NlIGNvc3RzIGFyZW4ndCBncmVhdCBlbm91Z2ggdG8ganVzdGlmeSBhIG5ldyBhYnN0cmFjdGlvbiBmb3IgbWFuYWdpbmdcbiAgICAvLyBpdCBhdCB0aGlzIHRpbWUuXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkaWQtZmluaXNoLWxvYWQnLCB0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZShcbiAgICAgICAgKCkgPT4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkaWQtZmluaXNoLWxvYWQnLCB0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkKSxcbiAgICAgICksXG4gICAgKTtcblxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyh7fSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyhwcmV2UHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8d2VidmlldyBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfSBzdHlsZT17dGhpcy5wcm9wcy5zdHlsZX0gLz5cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYXR0cmlidXRlcyBvbiB0aGUgY3VycmVudCBlbGVtZW50LiBDdXN0b20gYXR0cmlidXRlcyB3b24ndCBiZSBhZGRlZCBieSBSZWFjdCBiZWNhdXNlXG4gICAqIFwid2Vidmlld1wiIGlzbid0IGEgdmFsaWQgY3VzdG9tIGVsZW1lbnQgbmFtZSAoY3VzdG9tIGVsZW1lbnRzIG5lZWQgYSBkYXNoKSwgc28gd2Ugc2V0IHRoZVxuICAgKiBhdHRyaWJ1dGVzIG91cnNlbHZlcy4gQnV0IG5vdCBcImNsYXNzTmFtZVwiIG9yIFwic3R5bGVcIiBiZWNhdXNlIFJlYWN0IGhhcyBzcGVjaWFsIHJ1bGVzIGZvciB0aG9zZS5cbiAgICogKnNpZ2gqXG4gICAqL1xuICB1cGRhdGVBdHRyaWJ1dGVzKHByZXZQcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGNvbnN0IHNwZWNpYWxQcm9wcyA9IFsnY2xhc3NOYW1lJywgJ3N0eWxlJywgJ29uRGlkRmluaXNoTG9hZCddO1xuICAgIGNvbnN0IG5vcm1hbFByb3BzID0gT2JqZWN0LmtleXModGhpcy5wcm9wcykuZmlsdGVyKHByb3AgPT4gc3BlY2lhbFByb3BzLmluZGV4T2YocHJvcCkgPT09IC0xKTtcbiAgICBub3JtYWxQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnByb3BzW3Byb3BdO1xuICAgICAgY29uc3QgcHJldlZhbHVlID0gcHJldlByb3BzW3Byb3BdO1xuICAgICAgY29uc3QgdmFsdWVDaGFuZ2VkID0gdmFsdWUgIT09IHByZXZWYWx1ZTtcbiAgICAgIGlmICh2YWx1ZUNoYW5nZWQpIHtcbiAgICAgICAgZWxlbWVudFtwcm9wXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZURpZEZpbmlzaExvYWQoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMub25EaWRGaW5pc2hMb2FkKSB7XG4gICAgICB0aGlzLnByb3BzLm9uRGlkRmluaXNoTG9hZChldmVudCk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==