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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideUiLibPanelComponent2;

function _nuclideUiLibPanelComponent() {
  return _nuclideUiLibPanelComponent2 = require('../../nuclide-ui/lib/PanelComponent');
}

var _nuclideUiLibPanelComponentScroller2;

function _nuclideUiLibPanelComponentScroller() {
  return _nuclideUiLibPanelComponentScroller2 = require('../../nuclide-ui/lib/PanelComponentScroller');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _OutlineView2;

function _OutlineView() {
  return _OutlineView2 = require('./OutlineView');
}

var OutlineViewPanelState = (function () {
  function OutlineViewPanelState(outlines, width, visible) {
    _classCallCheck(this, OutlineViewPanelState);

    this._outlines = outlines;
    this._outlineViewPanel = null;
    this._width = width;

    if (visible) {
      this._show();
    }
  }

  _createClass(OutlineViewPanelState, [{
    key: 'dispose',
    value: function dispose() {
      if (this.isVisible()) {
        this._destroyPanel();
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      if (this.isVisible()) {
        this._hide();
      } else {
        this._show();
      }
    }
  }, {
    key: 'show',
    value: function show() {
      if (!this.isVisible()) {
        this._show();
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this.isVisible()) {
        this._hide();
      }
    }
  }, {
    key: 'getWidth',
    value: function getWidth() {
      return this._width;
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this._outlineViewPanel != null;
    }
  }, {
    key: '_show',
    value: function _show() {
      (0, (_assert2 || _assert()).default)(this._outlineViewPanel == null);

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-outline-view-show');

      this._outlineViewPanel = new OutlineViewPanel(this._outlines, this._width, this._onResize.bind(this));
    }
  }, {
    key: '_hide',
    value: function _hide() {
      this._destroyPanel();
    }
  }, {
    key: '_destroyPanel',
    value: function _destroyPanel() {
      var outlineViewPanel = this._outlineViewPanel;
      (0, (_assert2 || _assert()).default)(outlineViewPanel != null);

      outlineViewPanel.dispose();
      this._outlineViewPanel = null;
    }
  }, {
    key: '_onResize',
    value: function _onResize(newWidth) {
      this._width = newWidth;
    }
  }]);

  return OutlineViewPanelState;
})();

exports.OutlineViewPanelState = OutlineViewPanelState;

var OutlineViewPanel = (function () {
  function OutlineViewPanel(outlines, initialWidth, onResize) {
    _classCallCheck(this, OutlineViewPanel);

    this._panelDOMElement = document.createElement('div');
    // Otherwise it does not fill the whole panel, which might be alright except it means that the
    // resize-handle doesn't extend all the way to the bottom.
    //
    // Use 'flex' to fit Atom v1.6.0+ and `height: inherit` to fit Atom <v1.6.0. The latter uses
    // `height: 100%;` down the hierarchy and becomes innocuous in 1.6.0 because inheriting will
    // give `height: auto;`.
    this._panelDOMElement.style.display = 'flex';
    this._panelDOMElement.style.height = 'inherit';

    (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(
      (_nuclideUiLibPanelComponent2 || _nuclideUiLibPanelComponent()).PanelComponent,
      {
        dock: 'right',
        initialLength: initialWidth,
        noScroll: true,
        onResize: onResize },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
        (_reactForAtom2 || _reactForAtom()).React.createElement(OutlineViewHeader, null),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibPanelComponentScroller2 || _nuclideUiLibPanelComponentScroller()).PanelComponentScroller,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement((_OutlineView2 || _OutlineView()).OutlineView, { outlines: outlines })
        )
      )
    ), this._panelDOMElement);
    this._panel = atom.workspace.addRightPanel({
      item: this._panelDOMElement,
      priority: 200
    });
  }

  _createClass(OutlineViewPanel, [{
    key: 'dispose',
    value: function dispose() {
      (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this._panelDOMElement);
      this._panel.destroy();
    }
  }]);

  return OutlineViewPanel;
})();

var OutlineViewHeader = (function (_React$Component) {
  _inherits(OutlineViewHeader, _React$Component);

  function OutlineViewHeader() {
    _classCallCheck(this, OutlineViewHeader);

    _get(Object.getPrototypeOf(OutlineViewHeader.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(OutlineViewHeader, [{
    key: 'render',
    value: function render() {
      return(
        // Because the container is flex, prevent this header from shrinking smaller than its
        // contents. The default for flex children is to shrink as needed.
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'panel-heading', style: { flexShrink: 0 } },
          (_reactForAtom2 || _reactForAtom()).React.createElement('span', { className: 'icon icon-list-unordered' }),
          'Outline View',
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            className: 'pull-right nuclide-outline-view-close-button',
            size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.EXTRA_SMALL,
            icon: 'x',
            onClick: hideOutlineView,
            title: 'Hide Outline View'
          })
        )
      );
    }
  }]);

  return OutlineViewHeader;
})((_reactForAtom2 || _reactForAtom()).React.Component);

function hideOutlineView() {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-outline-view:hide');
}