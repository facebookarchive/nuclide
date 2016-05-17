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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _diffUtils2;

function _diffUtils() {
  return _diffUtils2 = require('./diff-utils');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var DiffNavigationBar = (function (_React$Component) {
  _inherits(DiffNavigationBar, _React$Component);

  function DiffNavigationBar(props) {
    _classCallCheck(this, DiffNavigationBar);

    _get(Object.getPrototypeOf(DiffNavigationBar.prototype), 'constructor', this).call(this, props);
    this._handleClick = this._handleClick.bind(this);
  }

  _createClass(DiffNavigationBar, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var addedLines = _props.addedLines;
      var removedLines = _props.removedLines;
      var newContents = _props.newContents;
      var oldContents = _props.oldContents;
      var newOffsets = _props.newOffsets;
      var oldOffsets = _props.oldOffsets;
      var elementHeight = _props.elementHeight;

      var newLinesCount = (0, (_diffUtils2 || _diffUtils()).getLineCountWithOffsets)(newContents, newOffsets);
      var oldLinesCount = (0, (_diffUtils2 || _diffUtils()).getLineCountWithOffsets)(oldContents, oldOffsets);

      var linesCount = Math.max(newLinesCount, oldLinesCount);

      // The old and new text editor contents use offsets to create a global line number identifier
      // being the line number with offset.

      // Here are the mapping between the offset line numbers to the original line number.
      var addedLinesWithOffsets = new Map(addedLines.map(function (addedLine) {
        return [(0, (_diffUtils2 || _diffUtils()).getOffsetLineNumber)(addedLine, newOffsets), addedLine];
      }));
      var removedLinesWithOffsets = new Map(removedLines.map(function (removedLine) {
        return [(0, (_diffUtils2 || _diffUtils()).getOffsetLineNumber)(removedLine, oldOffsets), removedLine];
      }));
      // Interset the added and removed lines maps, taking the values of the added lines.
      var changedLinesWithOffsets = new Map(Array.from(addedLinesWithOffsets.keys()).filter(function (addedLineWithOffset) {
        return removedLinesWithOffsets.has(addedLineWithOffset);
      }).map(function (changedLineWithOffset) {
        return [changedLineWithOffset, addedLinesWithOffsets.get(changedLineWithOffset)];
      }));

      // These regions will now be 'modified' regions.
      for (var changedLineWithOffset of changedLinesWithOffsets.keys()) {
        addedLinesWithOffsets.delete(changedLineWithOffset);
        removedLinesWithOffsets.delete(changedLineWithOffset);
      }

      var jumpTargets = [];

      for (var _ref23 of addedLinesWithOffsets) {
        var _ref22 = _slicedToArray(_ref23, 2);

        var addedLineWithOffset = _ref22[0];
        var addedLine = _ref22[1];

        jumpTargets.push((_reactForAtom2 || _reactForAtom()).React.createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: addedLineWithOffset,
          key: addedLineWithOffset,
          lineNumber: addedLine,
          linesCount: linesCount,
          lineChangeClass: 'added',
          isAddedLine: true,
          containerHeight: elementHeight,
          onClick: this._handleClick
        }));
      }

      for (var _ref33 of changedLinesWithOffsets) {
        var _ref32 = _slicedToArray(_ref33, 2);

        var changedLineWithOffset = _ref32[0];
        var changedLine = _ref32[1];

        jumpTargets.push((_reactForAtom2 || _reactForAtom()).React.createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: changedLineWithOffset,
          key: changedLineWithOffset,
          lineNumber: changedLine,
          linesCount: linesCount,
          lineChangeClass: 'modified',
          isAddedLine: true,
          containerHeight: elementHeight,
          onClick: this._handleClick
        }));
      }

      for (var _ref43 of removedLinesWithOffsets) {
        var _ref42 = _slicedToArray(_ref43, 2);

        var removedLineWithOffset = _ref42[0];
        var removedLine = _ref42[1];

        jumpTargets.push((_reactForAtom2 || _reactForAtom()).React.createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: removedLineWithOffset,
          key: removedLineWithOffset,
          lineNumber: removedLine,
          linesCount: linesCount,
          lineChangeClass: 'removed',
          isAddedLine: false,
          containerHeight: elementHeight,
          onClick: this._handleClick
        }));
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-view-navigation-bar' },
        jumpTargets
      );
    }
  }, {
    key: '_handleClick',
    value: function _handleClick(lineNumber, isAddedLine) {
      this.props.onClick(lineNumber, isAddedLine);
    }
  }]);

  return DiffNavigationBar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = DiffNavigationBar;

var NavigatonBarJumpTarget = (function (_React$Component2) {
  _inherits(NavigatonBarJumpTarget, _React$Component2);

  function NavigatonBarJumpTarget(props) {
    _classCallCheck(this, NavigatonBarJumpTarget);

    _get(Object.getPrototypeOf(NavigatonBarJumpTarget.prototype), 'constructor', this).call(this, props);
    this._handleClick = this._handleClick.bind(this);
  }

  _createClass(NavigatonBarJumpTarget, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var offsetLineNumber = _props2.offsetLineNumber;
      var linesCount = _props2.linesCount;
      var containerHeight = _props2.containerHeight;
      var lineChangeClass = _props2.lineChangeClass;

      var targertTop = Math.ceil(containerHeight * offsetLineNumber / linesCount);
      var targertHeight = Math.ceil(containerHeight / linesCount);
      var targetStyle = {
        top: targertTop + 'px',
        height: targertHeight + 'px'
      };
      var targetClassName = (0, (_classnames2 || _classnames()).default)(_defineProperty({
        'nuclide-diff-view-navigation-target': true
      }, lineChangeClass, true));

      return (_reactForAtom2 || _reactForAtom()).React.createElement('div', {
        className: targetClassName,
        style: targetStyle,
        onClick: this._handleClick
      });
    }
  }, {
    key: '_handleClick',
    value: function _handleClick() {
      this.props.onClick(this.props.lineNumber, this.props.isAddedLine);
    }
  }]);

  return NavigatonBarJumpTarget;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = exports.default;