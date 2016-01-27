var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var TextBuffer = _require.TextBuffer;

var AtomTextEditor = require('../../../ui/atom-text-editor');

var _require2 = require('react-for-atom');

var React = _require2.React;

var PROCESS_OUTPUT_PATH = 'nuclide-process-output.ansi';

/* eslint-disable react/prop-types */

var ProcessOutputView = (function (_React$Component) {
  _inherits(ProcessOutputView, _React$Component);

  /**
   * @param props.processOutputStore The ProcessOutputStore that provides the
   *   output to display in this view.
   * @param props.processOutputHandler (optional) A function that acts on the
   *   output of the process. If not provided, the default action is to simply
   *   append the output of the process to the view.
   */

  function ProcessOutputView(props) {
    _classCallCheck(this, ProcessOutputView);

    _get(Object.getPrototypeOf(ProcessOutputView.prototype), 'constructor', this).call(this, props);
    this._processOutputStore = props.processOutputStore;
    this._outputHandler = props.processOutputHandler;
    this._textBuffer = props.textBuffer;
    this._disposables = new CompositeDisposable();
  }

  _createClass(ProcessOutputView, [{
    key: 'getTitle',
    value: function getTitle() {
      return this.props.title;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._disposables.add(this._textBuffer.onDidChange(this._handleBufferChange.bind(this)));
    }
  }, {
    key: '_handleBufferChange',
    value: function _handleBufferChange() {
      var el = React.findDOMNode(this);
      // TODO(natthu): Consider scrolling conditionally i.e. don't scroll if user has scrolled up the
      //               output pane.
      el.scrollTop = el.scrollHeight;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'nuclide-process-output-view' },
        this.props.processOutputViewTopElement,
        React.createElement(AtomTextEditor, {
          ref: 'process-output-editor',
          textBuffer: this._textBuffer,
          gutterHidden: true,
          readOnly: true,
          path: PROCESS_OUTPUT_PATH
        })
      );
    }
  }, {
    key: 'copy',
    value: function copy() {
      return ProcessOutputView.createView(_extends({}, this.props));
    }
  }], [{
    key: 'createView',
    value: function createView(props) {
      var container = document.createElement('div');
      var component = React.render(React.createElement(ProcessOutputView, props), container);
      component.element = container;
      return component;
    }
  }]);

  return ProcessOutputView;
})(React.Component);

module.exports = ProcessOutputView;

/* eslint-enable react/prop-types */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2Nlc3NPdXRwdXRWaWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQWMwQyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUFsRCxtQkFBbUIsWUFBbkIsbUJBQW1CO0lBQUUsVUFBVSxZQUFWLFVBQVU7O0FBQ3RDLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDOztnQkFDL0MsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLGFBQUwsS0FBSzs7QUFFWixJQUFNLG1CQUFtQixHQUFHLDZCQUE2QixDQUFDOzs7O0lBZXBELGlCQUFpQjtZQUFqQixpQkFBaUI7Ozs7Ozs7Ozs7QUFhVixXQWJQLGlCQUFpQixDQWFULEtBQVksRUFBRTswQkFidEIsaUJBQWlCOztBQWNuQiwrQkFkRSxpQkFBaUIsNkNBY2IsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztBQUNwRCxRQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztBQUNqRCxRQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7QUFDcEMsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7R0FDL0M7O2VBbkJHLGlCQUFpQjs7V0FxQmIsb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUN6Qjs7O1dBRWdCLDZCQUFHO0FBQ2xCLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ2xFLENBQUM7S0FDSDs7O1dBRWtCLCtCQUFTO0FBQzFCLFVBQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUduQyxRQUFFLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUM7S0FDaEM7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFSyxrQkFBaUI7QUFDckIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsNkJBQTZCO1FBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCO1FBQ3ZDLG9CQUFDLGNBQWM7QUFDYixhQUFHLEVBQUMsdUJBQXVCO0FBQzNCLG9CQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQUFBQztBQUM3QixzQkFBWSxFQUFFLElBQUksQUFBQztBQUNuQixrQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGNBQUksRUFBRSxtQkFBbUIsQUFBQztVQUMxQjtPQUNFLENBQ047S0FDSDs7O1dBRUcsZ0JBQVc7QUFDYixhQUFPLGlCQUFpQixDQUFDLFVBQVUsY0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdEQ7OztXQUVnQixvQkFBQyxLQUFjLEVBQVU7QUFDeEMsVUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRCxVQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUM1QixvQkFBQyxpQkFBaUIsRUFBSyxLQUFLLENBQUksRUFDaEMsU0FBUyxDQUNWLENBQUM7QUFDRixlQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUM5QixhQUFPLFNBQVMsQ0FBQztLQUNsQjs7O1NBckVHLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXlFL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJQcm9jZXNzT3V0cHV0Vmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtQcm9jZXNzT3V0cHV0U3RvcmV9IGZyb20gJy4uLy4uL291dHB1dC1zdG9yZSc7XG5pbXBvcnQgdHlwZSB7UHJvY2Vzc091dHB1dEhhbmRsZXJ9IGZyb20gJy4vdHlwZXMnO1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlcn0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBBdG9tVGV4dEVkaXRvciA9IHJlcXVpcmUoJy4uLy4uLy4uL3VpL2F0b20tdGV4dC1lZGl0b3InKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCBQUk9DRVNTX09VVFBVVF9QQVRIID0gJ251Y2xpZGUtcHJvY2Vzcy1vdXRwdXQuYW5zaSc7XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cblxudHlwZSBEZWZhdWx0UHJvcHMgPSB7fTtcbnR5cGUgUHJvcHMgPSB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHByb2Nlc3NPdXRwdXRTdG9yZTogUHJvY2Vzc091dHB1dFN0b3JlLFxuICBwcm9jZXNzT3V0cHV0SGFuZGxlcjogP1Byb2Nlc3NPdXRwdXRIYW5kbGVyLFxuICBwcm9jZXNzT3V0cHV0Vmlld1RvcEVsZW1lbnQ6ID9IVE1MRWxlbWVudCxcbiAgdGV4dEJ1ZmZlcjogVGV4dEJ1ZmZlcjtcbn07XG50eXBlIFN0YXRlID0ge307XG5cblxuY2xhc3MgUHJvY2Vzc091dHB1dFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8RGVmYXVsdFByb3BzLCBQcm9wcywgU3RhdGU+IHtcbiAgX3Byb2Nlc3NPdXRwdXRTdG9yZTogUHJvY2Vzc091dHB1dFN0b3JlO1xuICBfdGV4dEJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyO1xuICBfZGlzcG9zYWJsZXM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX291dHB1dEhhbmRsZXI6ID9Qcm9jZXNzT3V0cHV0SGFuZGxlcjtcblxuICAvKipcbiAgICogQHBhcmFtIHByb3BzLnByb2Nlc3NPdXRwdXRTdG9yZSBUaGUgUHJvY2Vzc091dHB1dFN0b3JlIHRoYXQgcHJvdmlkZXMgdGhlXG4gICAqICAgb3V0cHV0IHRvIGRpc3BsYXkgaW4gdGhpcyB2aWV3LlxuICAgKiBAcGFyYW0gcHJvcHMucHJvY2Vzc091dHB1dEhhbmRsZXIgKG9wdGlvbmFsKSBBIGZ1bmN0aW9uIHRoYXQgYWN0cyBvbiB0aGVcbiAgICogICBvdXRwdXQgb2YgdGhlIHByb2Nlc3MuIElmIG5vdCBwcm92aWRlZCwgdGhlIGRlZmF1bHQgYWN0aW9uIGlzIHRvIHNpbXBseVxuICAgKiAgIGFwcGVuZCB0aGUgb3V0cHV0IG9mIHRoZSBwcm9jZXNzIHRvIHRoZSB2aWV3LlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX3Byb2Nlc3NPdXRwdXRTdG9yZSA9IHByb3BzLnByb2Nlc3NPdXRwdXRTdG9yZTtcbiAgICB0aGlzLl9vdXRwdXRIYW5kbGVyID0gcHJvcHMucHJvY2Vzc091dHB1dEhhbmRsZXI7XG4gICAgdGhpcy5fdGV4dEJ1ZmZlciA9IHByb3BzLnRleHRCdWZmZXI7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy50aXRsZTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIHRoaXMuX3RleHRCdWZmZXIub25EaWRDaGFuZ2UodGhpcy5faGFuZGxlQnVmZmVyQ2hhbmdlLmJpbmQodGhpcykpLFxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlQnVmZmVyQ2hhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG4gICAgLy8gVE9ETyhuYXR0aHUpOiBDb25zaWRlciBzY3JvbGxpbmcgY29uZGl0aW9uYWxseSBpLmUuIGRvbid0IHNjcm9sbCBpZiB1c2VyIGhhcyBzY3JvbGxlZCB1cCB0aGVcbiAgICAvLyAgICAgICAgICAgICAgIG91dHB1dCBwYW5lLlxuICAgIGVsLnNjcm9sbFRvcCA9IGVsLnNjcm9sbEhlaWdodDtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtcHJvY2Vzcy1vdXRwdXQtdmlld1wiPlxuICAgICAgICB7dGhpcy5wcm9wcy5wcm9jZXNzT3V0cHV0Vmlld1RvcEVsZW1lbnR9XG4gICAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICAgIHJlZj1cInByb2Nlc3Mtb3V0cHV0LWVkaXRvclwiXG4gICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5fdGV4dEJ1ZmZlcn1cbiAgICAgICAgICBndXR0ZXJIaWRkZW49e3RydWV9XG4gICAgICAgICAgcmVhZE9ubHk9e3RydWV9XG4gICAgICAgICAgcGF0aD17UFJPQ0VTU19PVVRQVVRfUEFUSH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjb3B5KCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIFByb2Nlc3NPdXRwdXRWaWV3LmNyZWF0ZVZpZXcoey4uLnRoaXMucHJvcHN9KTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVWaWV3KHByb3BzOiA/T2JqZWN0KTogT2JqZWN0IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBjb21wb25lbnQgPSBSZWFjdC5yZW5kZXIoXG4gICAgICA8UHJvY2Vzc091dHB1dFZpZXcgey4uLnByb3BzfSAvPixcbiAgICAgIGNvbnRhaW5lcixcbiAgICApO1xuICAgIGNvbXBvbmVudC5lbGVtZW50ID0gY29udGFpbmVyO1xuICAgIHJldHVybiBjb21wb25lbnQ7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2Nlc3NPdXRwdXRWaWV3O1xuXG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==