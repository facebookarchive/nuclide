Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _CodePreviewView2;

function _CodePreviewView() {
  return _CodePreviewView2 = require('./CodePreviewView');
}

var _nuclideUiLibPanelComponent2;

function _nuclideUiLibPanelComponent() {
  return _nuclideUiLibPanelComponent2 = require('../../nuclide-ui/lib/PanelComponent');
}

var _nuclideUiLibPanelComponentScroller2;

function _nuclideUiLibPanelComponentScroller() {
  return _nuclideUiLibPanelComponentScroller2 = require('../../nuclide-ui/lib/PanelComponentScroller');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var CodePreviewPanel = (function () {
  function CodePreviewPanel(initialWidth, data) {
    var _this = this;

    _classCallCheck(this, CodePreviewPanel);

    this._panelDOMElement = document.createElement('div');
    // Otherwise it does not fill the whole panel, which might be alright except it means that the
    // resize-handle doesn't extend all the way to the bottom.
    //
    // Use 'flex' to fit Atom v1.6.0+ and `height: inherit` to fit Atom <v1.6.0. The latter uses
    // `height: 100%;` down the hierarchy and becomes innocuous in 1.6.0 because inheriting will
    // give `height: auto;`.
    this._panelDOMElement.style.display = 'flex';
    this._panelDOMElement.style.height = 'inherit';
    this._width = initialWidth;

    var onResize = function onResize(newWidth) {
      _this._width = newWidth;
    };

    var symbolNames = data.filter(function (value) {
      return value != null;
    }).map(function (value) {
      (0, (_assert2 || _assert()).default)(value != null);
      return value.symbolName;
    });
    var content = data.map(function (value) {
      if (value == null) {
        return null;
      }
      return {
        location: value.definition,
        grammar: value.grammar
      };
    });
    (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(
      (_nuclideUiLibPanelComponent2 || _nuclideUiLibPanelComponent()).PanelComponent,
      {
        dock: 'right',
        initialLength: initialWidth,
        noScroll: true,
        onResize: onResize },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-definition-preview-panel' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(Header, { data: symbolNames }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibPanelComponentScroller2 || _nuclideUiLibPanelComponentScroller()).PanelComponentScroller,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement((_CodePreviewView2 || _CodePreviewView()).CodePreviewView, { data: content })
        )
      )
    ), this._panelDOMElement);
    this._panel = atom.workspace.addRightPanel({
      item: this._panelDOMElement,
      priority: 200
    });
  }

  _createClass(CodePreviewPanel, [{
    key: 'getWidth',
    value: function getWidth() {
      return this._width;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this._panelDOMElement);
      this._panel.destroy();
    }
  }]);

  return CodePreviewPanel;
})();

exports.CodePreviewPanel = CodePreviewPanel;

var Header = (function (_React$Component) {
  _inherits(Header, _React$Component);

  function Header(props) {
    _classCallCheck(this, Header);

    _get(Object.getPrototypeOf(Header.prototype), 'constructor', this).call(this, props);
    this.state = {
      data: null
    };
  }

  _createClass(Header, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      (0, (_assert2 || _assert()).default)(this.subscription == null);
      this.subscription = this.props.data.subscribe(function (data) {
        _this2.setState({ data: data });
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      (0, (_assert2 || _assert()).default)(this.subscription != null);
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }, {
    key: 'render',
    value: function render() {
      return(
        // Because the container is flex, prevent this header from shrinking smaller than its
        // contents. The default for flex children is to shrink as needed.
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'panel-heading', style: { 'flex-shrink': 0 } },
          (_reactForAtom2 || _reactForAtom()).React.createElement('span', { className: 'icon icon-comment-discussion' }),
          'CodePreview ',
          this.state.data == null ? '' : ': ' + this.state.data,
          (_reactForAtom2 || _reactForAtom()).React.createElement('button', {
            className: 'btn btn-xs icon icon-x pull-right nuclide-definition-preview-close-button',
            onClick: hide,
            title: 'Hide CodePreview'
          })
        )
      );
    }
  }]);

  return Header;
})((_reactForAtom2 || _reactForAtom()).React.Component);

function hide() {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-definition-preview:hide');
}