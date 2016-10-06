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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiAtomInput2;

function _nuclideUiAtomInput() {
  return _nuclideUiAtomInput2 = require('../../../nuclide-ui/AtomInput');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var FilePreview = (function (_React$Component) {
  _inherits(FilePreview, _React$Component);

  function FilePreview() {
    _classCallCheck(this, FilePreview);

    _get(Object.getPrototypeOf(FilePreview.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FilePreview, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var editor = this.refs.editor.getTextEditor();
      var _props = this.props;
      var grammar = _props.grammar;
      var references = _props.references;
      var startLine = _props.startLine;

      if (grammar) {
        editor.setGrammar(grammar);
      }

      references.forEach(function (ref) {
        var range = ref.range;
        var marker = editor.markBufferRange([[range.start.row - startLine, range.start.column], [range.end.row - startLine, range.end.column]]);
        editor.decorateMarker(marker, { type: 'highlight', 'class': 'reference' });
      });

      // Make sure at least one highlight is visible.
      editor.scrollToBufferPosition([references[0].range.end.row - startLine + 1, references[0].range.end.column]);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var lineNumbers = [];

      var _loop = function (i) {
        lineNumbers.push((_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          {
            key: i,
            className: 'nuclide-find-references-line-number',
            onClick: function (evt) {
              return _this.props.onLineClick(evt, i);
            } },
          i + 1
        ));
      };

      for (var i = this.props.startLine; i <= this.props.endLine; i++) {
        _loop(i);
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-find-references-file-preview' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-find-references-line-number-column' },
          lineNumbers
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
          ref: 'editor',
          initialValue: this.props.text,
          disabled: true,
          onClick: this.props.onClick
        })
      );
    }
  }]);

  return FilePreview;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = FilePreview;
module.exports = exports.default;