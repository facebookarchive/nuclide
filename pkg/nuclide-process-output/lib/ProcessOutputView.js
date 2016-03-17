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

var AtomTextEditor = require('../../nuclide-ui-atom-text-editor');

var _require2 = require('react-for-atom');

var React = _require2.React;
var ReactDOM = _require2.ReactDOM;

var PROCESS_OUTPUT_PATH = 'nuclide-process-output.ansi';

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
      var el = ReactDOM.findDOMNode(this);
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
      var component = ReactDOM.render(React.createElement(ProcessOutputView, props), container);
      component.element = container;
      return component;
    }
  }]);

  return ProcessOutputView;
})(React.Component);

module.exports = ProcessOutputView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2Nlc3NPdXRwdXRWaWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQWMwQyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUFsRCxtQkFBbUIsWUFBbkIsbUJBQW1CO0lBQUUsVUFBVSxZQUFWLFVBQVU7O0FBQ3RDLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDOztnQkFJaEUsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUYzQixLQUFLLGFBQUwsS0FBSztJQUNMLFFBQVEsYUFBUixRQUFROztBQUdWLElBQU0sbUJBQW1CLEdBQUcsNkJBQTZCLENBQUM7O0lBVXBELGlCQUFpQjtZQUFqQixpQkFBaUI7Ozs7Ozs7Ozs7QUFlVixXQWZQLGlCQUFpQixDQWVULEtBQVksRUFBRTswQkFmdEIsaUJBQWlCOztBQWdCbkIsK0JBaEJFLGlCQUFpQiw2Q0FnQmIsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztBQUNwRCxRQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztBQUNqRCxRQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7QUFDcEMsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7R0FDL0M7O2VBckJHLGlCQUFpQjs7V0F1QmIsb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUN6Qjs7O1dBRWdCLDZCQUFHO0FBQ2xCLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ2xFLENBQUM7S0FDSDs7O1dBRWtCLCtCQUFTO0FBQzFCLFVBQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUd0QyxRQUFFLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUM7S0FDaEM7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFSyxrQkFBaUI7QUFDckIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsNkJBQTZCO1FBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCO1FBQ3ZDLG9CQUFDLGNBQWM7QUFDYixhQUFHLEVBQUMsdUJBQXVCO0FBQzNCLG9CQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQUFBQztBQUM3QixzQkFBWSxFQUFFLElBQUksQUFBQztBQUNuQixrQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGNBQUksRUFBRSxtQkFBbUIsQUFBQztVQUMxQjtPQUNFLENBQ047S0FDSDs7O1dBRUcsZ0JBQVc7QUFDYixhQUFPLGlCQUFpQixDQUFDLFVBQVUsY0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdEQ7OztXQUVnQixvQkFBQyxLQUFjLEVBQVU7QUFDeEMsVUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRCxVQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUMvQixvQkFBQyxpQkFBaUIsRUFBSyxLQUFLLENBQUksRUFDaEMsU0FBUyxDQUNWLENBQUM7QUFDRixlQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUM5QixhQUFPLFNBQVMsQ0FBQztLQUNsQjs7O1NBdkVHLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQTJFL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJQcm9jZXNzT3V0cHV0Vmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtQcm9jZXNzT3V0cHV0U3RvcmV9IGZyb20gJy4uLy4uL251Y2xpZGUtcHJvY2Vzcy1vdXRwdXQtc3RvcmUnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NPdXRwdXRIYW5kbGVyfSBmcm9tICcuL3R5cGVzJztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFRleHRCdWZmZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgQXRvbVRleHRFZGl0b3IgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpLWF0b20tdGV4dC1lZGl0b3InKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IFBST0NFU1NfT1VUUFVUX1BBVEggPSAnbnVjbGlkZS1wcm9jZXNzLW91dHB1dC5hbnNpJztcblxudHlwZSBQcm9wcyA9IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgcHJvY2Vzc091dHB1dFN0b3JlOiBQcm9jZXNzT3V0cHV0U3RvcmU7XG4gIHByb2Nlc3NPdXRwdXRIYW5kbGVyOiA/UHJvY2Vzc091dHB1dEhhbmRsZXI7XG4gIHByb2Nlc3NPdXRwdXRWaWV3VG9wRWxlbWVudDogP0hUTUxFbGVtZW50O1xuICB0ZXh0QnVmZmVyOiBUZXh0QnVmZmVyO1xufTtcblxuY2xhc3MgUHJvY2Vzc091dHB1dFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIF9wcm9jZXNzT3V0cHV0U3RvcmU6IFByb2Nlc3NPdXRwdXRTdG9yZTtcbiAgX3RleHRCdWZmZXI6IGF0b20kVGV4dEJ1ZmZlcjtcbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9vdXRwdXRIYW5kbGVyOiA/UHJvY2Vzc091dHB1dEhhbmRsZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwcm9wcy5wcm9jZXNzT3V0cHV0U3RvcmUgVGhlIFByb2Nlc3NPdXRwdXRTdG9yZSB0aGF0IHByb3ZpZGVzIHRoZVxuICAgKiAgIG91dHB1dCB0byBkaXNwbGF5IGluIHRoaXMgdmlldy5cbiAgICogQHBhcmFtIHByb3BzLnByb2Nlc3NPdXRwdXRIYW5kbGVyIChvcHRpb25hbCkgQSBmdW5jdGlvbiB0aGF0IGFjdHMgb24gdGhlXG4gICAqICAgb3V0cHV0IG9mIHRoZSBwcm9jZXNzLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBkZWZhdWx0IGFjdGlvbiBpcyB0byBzaW1wbHlcbiAgICogICBhcHBlbmQgdGhlIG91dHB1dCBvZiB0aGUgcHJvY2VzcyB0byB0aGUgdmlldy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9wcm9jZXNzT3V0cHV0U3RvcmUgPSBwcm9wcy5wcm9jZXNzT3V0cHV0U3RvcmU7XG4gICAgdGhpcy5fb3V0cHV0SGFuZGxlciA9IHByb3BzLnByb2Nlc3NPdXRwdXRIYW5kbGVyO1xuICAgIHRoaXMuX3RleHRCdWZmZXIgPSBwcm9wcy50ZXh0QnVmZmVyO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudGl0bGU7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICB0aGlzLl90ZXh0QnVmZmVyLm9uRGlkQ2hhbmdlKHRoaXMuX2hhbmRsZUJ1ZmZlckNoYW5nZS5iaW5kKHRoaXMpKSxcbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUJ1ZmZlckNoYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCBlbCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIC8vIFRPRE8obmF0dGh1KTogQ29uc2lkZXIgc2Nyb2xsaW5nIGNvbmRpdGlvbmFsbHkgaS5lLiBkb24ndCBzY3JvbGwgaWYgdXNlciBoYXMgc2Nyb2xsZWQgdXAgdGhlXG4gICAgLy8gICAgICAgICAgICAgICBvdXRwdXQgcGFuZS5cbiAgICBlbC5zY3JvbGxUb3AgPSBlbC5zY3JvbGxIZWlnaHQ7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXByb2Nlc3Mtb3V0cHV0LXZpZXdcIj5cbiAgICAgICAge3RoaXMucHJvcHMucHJvY2Vzc091dHB1dFZpZXdUb3BFbGVtZW50fVxuICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICByZWY9XCJwcm9jZXNzLW91dHB1dC1lZGl0b3JcIlxuICAgICAgICAgIHRleHRCdWZmZXI9e3RoaXMuX3RleHRCdWZmZXJ9XG4gICAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICAgIHJlYWRPbmx5PXt0cnVlfVxuICAgICAgICAgIHBhdGg9e1BST0NFU1NfT1VUUFVUX1BBVEh9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgY29weSgpOiBPYmplY3Qge1xuICAgIHJldHVybiBQcm9jZXNzT3V0cHV0Vmlldy5jcmVhdGVWaWV3KHsuLi50aGlzLnByb3BzfSk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlVmlldyhwcm9wczogP09iamVjdCk6IE9iamVjdCB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgY29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPFByb2Nlc3NPdXRwdXRWaWV3IHsuLi5wcm9wc30gLz4sXG4gICAgICBjb250YWluZXIsXG4gICAgKTtcbiAgICBjb21wb25lbnQuZWxlbWVudCA9IGNvbnRhaW5lcjtcbiAgICByZXR1cm4gY29tcG9uZW50O1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9jZXNzT3V0cHV0VmlldztcbiJdfQ==