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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideUiLibAtomTextEditor2;

function _nuclideUiLibAtomTextEditor() {
  return _nuclideUiLibAtomTextEditor2 = require('../../nuclide-ui/lib/AtomTextEditor');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

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
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
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
      var el = this.refs['process-output-editor'];

      if (el == null) {
        return;
      }

      var textEditor = el.getElement();

      // It's possible that the element exists but doesn't have a component. I'm honestly not sure
      // how since `component` is set in the webcomponent's [attached callback][1] (which should
      // happen before our `componentDidMount`) and nulled in the [detached callback][2] (which
      // should happen after our `componentWillUnmount`). In any case, we need to guard against it.
      // See GH-483.
      // [1]: https://github.com/atom/atom/blob/dd24e3b22304b495625140f74be9d221238074ab/src/text-editor-element.coffee#L75
      // [2]: https://github.com/atom/atom/blob/dd24e3b22304b495625140f74be9d221238074ab/src/text-editor-element.coffee#L83
      if (textEditor.component == null) {
        return;
      }

      var shouldScroll = textEditor.getScrollHeight() - (textEditor.getHeight() + textEditor.getScrollTop()) <= 5;
      if (shouldScroll) {
        textEditor.scrollToBottom();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-process-output-view' },
        this.props.processOutputViewTopElement,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomTextEditor2 || _nuclideUiLibAtomTextEditor()).AtomTextEditor, {
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
      var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(ProcessOutputView, props), container);
      // $FlowIgnore -- an Atom-ism
      component.element = container;
      return component;
    }
  }]);

  return ProcessOutputView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = ProcessOutputView;