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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */

var DiffViewEditor = (function () {
  function DiffViewEditor(editorElement) {
    _classCallCheck(this, DiffViewEditor);

    this._editorElement = editorElement;
    this._editor = editorElement.getModel();
    this._highlightMarkers = [];
    this._offsetMarkers = [];
    this._uiElementsMarkers = [];
  }

  _createClass(DiffViewEditor, [{
    key: 'setUIElements',
    value: function setUIElements(elements) {
      var _this = this;

      for (var marker of this._uiElementsMarkers) {
        marker.destroy();
      }
      this._uiElementsMarkers = elements.map(function (element) {
        var node = element.node;
        var bufferRow = element.bufferRow;

        // TODO(most): OMG, this mutates React props for the created component!!
        Object.assign(node.props.helpers, {
          scrollToRow: _this._scrollToRow.bind(_this)
        });
        var container = document.createElement('div');
        (_reactForAtom2 || _reactForAtom()).ReactDOM.render(node, container);
        // an overlay marker at a buffer range with row x renders under row x + 1
        // so, use range at bufferRow - 1 to actually display at bufferRow
        var range = [[bufferRow - 1, 0], [bufferRow - 1, 0]];
        var marker = _this._editor.markBufferRange(range, { invalidate: 'never' });
        _this._editor.decorateMarker(marker, {
          type: 'block',
          item: container,
          position: 'after'
        });
        return marker;
      });
    }
  }, {
    key: 'scrollToScreenLine',
    value: function scrollToScreenLine(screenLine) {
      this._editor.scrollToScreenPosition(
      // Markers are ordered in ascending order by line number.
      [screenLine, 0], { center: true });
    }
  }, {
    key: 'setFileContents',
    value: function setFileContents(filePath, contents) {
      var buffer = this._editor.getBuffer();
      if (buffer.getText() !== contents) {
        // Applies only to the compared read only text buffer.
        // Hence, it's safe and performant to use `setText` because the cursor position is hidden.
        buffer.setText(contents);
      }
      var grammar = atom.grammars.selectGrammar(filePath, contents);
      this._editor.setGrammar(grammar);
    }
  }, {
    key: 'getModel',
    value: function getModel() {
      return this._editor;
    }
  }, {
    key: 'getText',
    value: function getText() {
      return this._editor.getText();
    }

    /**
     * @param addedLines An array of buffer line numbers that should be highlighted as added.
     * @param removedLines An array of buffer line numbers that should be highlighted as removed.
     */
  }, {
    key: 'setHighlightedLines',
    value: function setHighlightedLines() {
      var _this2 = this;

      var addedLines = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var removedLines = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      for (var marker of this._highlightMarkers) {
        marker.destroy();
      }
      this._highlightMarkers = addedLines.map(function (lineNumber) {
        return _this2._createLineMarker(lineNumber, 'insert');
      }).concat(removedLines.map(function (lineNumber) {
        return _this2._createLineMarker(lineNumber, 'delete');
      }));
    }

    /**
     * @param lineNumber A buffer line number to be highlighted.
     * @param type The type of highlight to be applied to the line.
    *    Could be a value of: ['insert', 'delete'].
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(lineNumber, type) {
      var range = new (_atom2 || _atom()).Range([lineNumber, 0], [lineNumber + 1, 0]);
      var marker = this._editor.markBufferRange(range, { invalidate: 'never' });
      this._editor.decorateMarker(marker, { type: 'highlight', 'class': 'diff-view-' + type });
      return marker;
    }
  }, {
    key: 'setOffsets',
    value: function setOffsets(lineOffsets) {
      this._offsetMarkers.forEach(function (marker) {
        return marker.destroy();
      });
      this._offsetMarkers = [];
      var lineHeight = this._editor.getLineHeightInPixels();
      for (var _ref3 of lineOffsets) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var lineNumber = _ref2[0];
        var offsetLines = _ref2[1];

        var blockItem = document.createElement('div');
        blockItem.style.minHeight = offsetLines * lineHeight + 'px';
        blockItem.className = 'nuclide-diff-view-block-offset';
        var marker = this._editor.markBufferPosition([lineNumber, 0], { invalidate: 'never' });
        // The position should be `after` if the offset is at the end of the file.
        var position = lineNumber >= this._editor.getLineCount() - 1 ? 'after' : 'before';
        this._editor.decorateMarker(marker, { type: 'block', item: blockItem, position: position });
        this._offsetMarkers.push(marker);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._highlightMarkers.forEach(function (marker) {
        return marker.destroy();
      });
      this._highlightMarkers = [];
      this._offsetMarkers.forEach(function (marker) {
        return marker.destroy();
      });
      this._offsetMarkers = [];
      this._uiElementsMarkers.forEach(function (marker) {
        return marker.destroy();
      });
      this._uiElementsMarkers = [];
      this._editor.destroy();
    }
  }, {
    key: '_scrollToRow',
    value: function _scrollToRow(row) {
      this._editor.scrollToBufferPosition([row, 0], { center: true });
    }
  }]);

  return DiffViewEditor;
})();

exports.default = DiffViewEditor;
module.exports = exports.default;