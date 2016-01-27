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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _editorUtils = require('./editor-utils');

var _reactForAtom = require('react-for-atom');

var _logging = require('../../logging');

var logger = (0, _logging.getLogger)();

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */

var DiffViewEditor = (function () {
  function DiffViewEditor(editorElement) {
    var _this = this;

    _classCallCheck(this, DiffViewEditor);

    this._editorElement = editorElement;
    this._editor = editorElement.getModel();

    this._markers = [];
    this._lineOffsets = new Map();

    // Ugly Hack to the display buffer to allow fake soft wrapped lines,
    // to create the non-numbered empty space needed between real text buffer lines.
    // $FlowFixMe use of non-official API.
    this._originalBuildScreenLines = this._editor.displayBuffer.buildScreenLines;
    // $FlowFixMe use of non-official API.
    this._editor.displayBuffer.checkScreenLinesInvariant = function () {};
    // $FlowFixMe use of non-official API.
    this._editor.displayBuffer.buildScreenLines = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _this._buildScreenLinesWithOffsets.apply(_this, args);
    };

    // There is no editor API to cancel foldability, but deep inside the line state creation,
    // it uses those functions to determine if a line is foldable or not.
    // For Diff View, folding breaks offsets, hence we need to make it unfoldable.
    // $FlowFixMe use of non-official API.
    this._editor.isFoldableAtScreenRow = this._editor.isFoldableAtBufferRow = function (row) {
      return false;
    };
  }

  _createClass(DiffViewEditor, [{
    key: 'renderInlineComponents',
    value: function renderInlineComponents(elements) {
      var _require = require('../../commons');

      var object = _require.object;

      var components = [];
      var renderPromises = [];
      var scrollToRow = this._scrollToRow.bind(this);
      elements.forEach(function (element) {
        var node = element.node;
        var bufferRow = element.bufferRow;

        if (!node.props.helpers) {
          node.props.helpers = {};
        }
        var helpers = {
          scrollToRow: scrollToRow
        };
        object.assign(node.props.helpers, helpers);
        var container = document.createElement('div');
        var component = undefined;
        var didRenderPromise = new Promise(function (res, rej) {
          component = _reactForAtom.React.render(node, container, function () {
            res();
          });
        });
        renderPromises.push(didRenderPromise);
        components.push({
          bufferRow: bufferRow,
          // $FlowFixMe(most)
          component: component,
          container: container
        });
      });
      return Promise.all(renderPromises).then(function () {
        return components;
      });
    }
  }, {
    key: 'attachInlineComponents',
    value: function attachInlineComponents(elements) {
      var _this2 = this;

      elements.forEach(function (element) {
        var bufferRow = element.bufferRow;
        var container = element.container;

        // an overlay marker at a buffer range with row x renders under row x + 1
        // so, use range at bufferRow - 1 to actually display at bufferRow
        var range = [[bufferRow - 1, 0], [bufferRow - 1, 0]];
        var marker = _this2._editor.markBufferRange(range, { invalidate: 'never' });
        _this2._editor.decorateMarker(marker, { type: 'overlay', item: container });
      });
    }
  }, {
    key: 'getLineHeightInPixels',
    value: function getLineHeightInPixels() {
      return this._editor.getLineHeightInPixels();
    }
  }, {
    key: 'setFileContents',
    value: function setFileContents(filePath, contents, clearHistory) {
      // The text is set via diffs to keep the cursor position.
      var buffer = this._editor.getBuffer();
      buffer.setTextViaDiff(contents);
      if (clearHistory) {
        buffer.clearUndoStack();
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
      var _this3 = this;

      var addedLines = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var removedLines = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      for (var marker of this._markers) {
        marker.destroy();
      }
      this._markers = addedLines.map(function (lineNumber) {
        return _this3._createLineMarker(lineNumber, 'insert');
      }).concat(removedLines.map(function (lineNumber) {
        return _this3._createLineMarker(lineNumber, 'delete');
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
      var screenPosition = this._editor.screenPositionForBufferPosition({ row: lineNumber, column: 0 });
      var range = new _atom.Range(screenPosition, [screenPosition.row, this._editor.lineTextForScreenRow(screenPosition.row).length]);

      // TODO: highlight the full line when the mapping between buffer lines to screen line is implemented.
      // {row: screenPosition.row + 1, column: 0}
      var marker = this._editor.markScreenRange(range, { invalidate: 'never' });
      this._editor.decorateMarker(marker, { type: 'highlight', 'class': 'diff-view-' + type });
      return marker;
    }
  }, {
    key: 'setOffsets',
    value: function setOffsets(lineOffsets) {
      this._lineOffsets = lineOffsets;
      // When the diff view is editable: upon edits in the new editor, the old editor needs to update its
      // rendering state to show the offset wrapped lines.
      // This isn't a public API, but came from a discussion on the Atom public channel.
      this._editor.displayBuffer.updateAllScreenLines();
      var component = this._editorElement.component || {};
      var presenter = component.presenter;

      if (!presenter) {
        logger.error('No text editor presenter is wired up to the Diff View text editor!');
        return;
      }
      if (typeof presenter.updateState === 'function') {
        // Atom until v1.0.18 has updateState to force re-rendering of editor state.
        // This is needed to request a full re-render from the editor.
        presenter.updateState();
      }
      // Atom master after v1.0.18 has will know when it has changed lines or decorations,
      // and will auto-update.
    }
  }, {
    key: '_buildScreenLinesWithOffsets',
    value: function _buildScreenLinesWithOffsets(startBufferRow, endBufferRow) {
      // HACK! Enabling `softWrapped` lines would greatly complicate the offset screen line mapping
      // needed to render the offset lines for the Diff View.
      // Hence, we need to disable the original screen line from returning soft-wrapped lines.
      var displayBuffer = this._editor.displayBuffer;

      displayBuffer.softWrapped = false;

      var _originalBuildScreenLines$apply = this._originalBuildScreenLines.apply(displayBuffer, arguments);

      var regions = _originalBuildScreenLines$apply.regions;
      var screenLines = _originalBuildScreenLines$apply.screenLines;

      displayBuffer.softWrapped = true;
      if (this._lineOffsets.size === 0) {
        return { regions: regions, screenLines: screenLines };
      }

      return (0, _editorUtils.buildLineRangesWithOffsets)(screenLines, this._lineOffsets, startBufferRow, endBufferRow, function () {
        var copy = screenLines[0].copy();
        copy.token = [];
        copy.text = '';
        copy.tags = [];
        return copy;
      });
    }
  }, {
    key: 'setReadOnly',
    value: function setReadOnly() {
      // Unfotunately, there is no other clean way to make an editor read only.
      // Got this from Atom's code to make an editor read-only.
      // Filed an issue: https://github.com/atom/atom/issues/6880
      this._editor.getDecorations({ 'class': 'cursor-line' })[0].destroy();
      // Cancel insert events to prevent typing in the text editor and disallow editing (read-only).
      this._editor.onWillInsertText(function (event) {
        return event.cancel();
      });
      // Swallow paste texts.
      this._editor.pasteText = function () {};
      // Swallow insert and delete calls on its buffer.
      this._editor.getBuffer()['delete'] = function () {};
      this._editor.getBuffer().insert = function () {};
    }
  }, {
    key: '_scrollToRow',
    value: function _scrollToRow(row) {
      this._editor.scrollToBufferPosition([row, 0]);
    }
  }]);

  return DiffViewEditor;
})();

exports['default'] = DiffViewEditor;
;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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WUFBWSxFQUM1RixZQUFNO0FBQ0osWUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25DLFlBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFlBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsWUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZixlQUFPLElBQUksQ0FBQztPQUNiLENBQ0YsQ0FBQztLQUNIOzs7V0FFVSx1QkFBUzs7OztBQUlsQixVQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFDLFNBQU8sYUFBYSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFakUsVUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFBLEtBQUs7ZUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO09BQUEsQ0FBQyxDQUFDOztBQUV2RCxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxZQUFNLEVBQUUsQ0FBQzs7QUFFbEMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBTyxHQUFHLFlBQU0sRUFBRSxDQUFDO0FBQzNDLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxHQUFHLFlBQU0sRUFBRSxDQUFDO0tBQzVDOzs7V0FFVyxzQkFBQyxHQUFXLEVBQVE7QUFDOUIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9DOzs7U0ExTGtCLGNBQWM7OztxQkFBZCxjQUFjO0FBMkxsQyxDQUFDIiwiZmlsZSI6IkRpZmZWaWV3RWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0lubGluZUNvbXBvbmVudCwgUmVuZGVyZWRDb21wb25lbnQsIExpbmVSYW5nZXNXaXRoT2Zmc2V0cywgT2Zmc2V0TWFwfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2J1aWxkTGluZVJhbmdlc1dpdGhPZmZzZXRzfSBmcm9tICcuL2VkaXRvci11dGlscyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4vKipcbiAqIFRoZSBEaWZmVmlld0VkaXRvciBtYW5hZ2VzIHRoZSBsaWZlY3ljbGUgb2YgdGhlIHR3byBlZGl0b3JzIHVzZWQgaW4gdGhlIGRpZmYgdmlldyxcbiAqIGFuZCBjb250cm9scyBpdHMgcmVuZGVyaW5nIG9mIGhpZ2hsaWdodHMgYW5kIG9mZnNldHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZWaWV3RWRpdG9yIHtcbiAgX2VkaXRvcjogT2JqZWN0O1xuICBfZWRpdG9yRWxlbWVudDogT2JqZWN0O1xuICBfbWFya2VyczogQXJyYXk8YXRvbSRNYXJrZXI+O1xuICBfbGluZU9mZnNldHM6IE9mZnNldE1hcDtcbiAgX29yaWdpbmFsQnVpbGRTY3JlZW5MaW5lczogKHN0YXJ0QnVmZmVyUm93OiBudW1iZXIsIGVuZEJ1ZmZlclJvdzogbnVtYmVyKSA9PiBtaXhlZDtcblxuICBjb25zdHJ1Y3RvcihlZGl0b3JFbGVtZW50OiBhdG9tJFRleHRFZGl0b3JFbGVtZW50KSB7XG4gICAgdGhpcy5fZWRpdG9yRWxlbWVudCA9IGVkaXRvckVsZW1lbnQ7XG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpO1xuXG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuICAgIHRoaXMuX2xpbmVPZmZzZXRzID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gVWdseSBIYWNrIHRvIHRoZSBkaXNwbGF5IGJ1ZmZlciB0byBhbGxvdyBmYWtlIHNvZnQgd3JhcHBlZCBsaW5lcyxcbiAgICAvLyB0byBjcmVhdGUgdGhlIG5vbi1udW1iZXJlZCBlbXB0eSBzcGFjZSBuZWVkZWQgYmV0d2VlbiByZWFsIHRleHQgYnVmZmVyIGxpbmVzLlxuICAgIC8vICRGbG93Rml4TWUgdXNlIG9mIG5vbi1vZmZpY2lhbCBBUEkuXG4gICAgdGhpcy5fb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzID0gdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuYnVpbGRTY3JlZW5MaW5lcztcbiAgICAvLyAkRmxvd0ZpeE1lIHVzZSBvZiBub24tb2ZmaWNpYWwgQVBJLlxuICAgIHRoaXMuX2VkaXRvci5kaXNwbGF5QnVmZmVyLmNoZWNrU2NyZWVuTGluZXNJbnZhcmlhbnQgPSAoKSA9PiB7fTtcbiAgICAvLyAkRmxvd0ZpeE1lIHVzZSBvZiBub24tb2ZmaWNpYWwgQVBJLlxuICAgIHRoaXMuX2VkaXRvci5kaXNwbGF5QnVmZmVyLmJ1aWxkU2NyZWVuTGluZXMgPSAoLi4uYXJncykgPT4gdGhpcy5fYnVpbGRTY3JlZW5MaW5lc1dpdGhPZmZzZXRzLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXG4gICAgLy8gVGhlcmUgaXMgbm8gZWRpdG9yIEFQSSB0byBjYW5jZWwgZm9sZGFiaWxpdHksIGJ1dCBkZWVwIGluc2lkZSB0aGUgbGluZSBzdGF0ZSBjcmVhdGlvbixcbiAgICAvLyBpdCB1c2VzIHRob3NlIGZ1bmN0aW9ucyB0byBkZXRlcm1pbmUgaWYgYSBsaW5lIGlzIGZvbGRhYmxlIG9yIG5vdC5cbiAgICAvLyBGb3IgRGlmZiBWaWV3LCBmb2xkaW5nIGJyZWFrcyBvZmZzZXRzLCBoZW5jZSB3ZSBuZWVkIHRvIG1ha2UgaXQgdW5mb2xkYWJsZS5cbiAgICAvLyAkRmxvd0ZpeE1lIHVzZSBvZiBub24tb2ZmaWNpYWwgQVBJLlxuICAgIHRoaXMuX2VkaXRvci5pc0ZvbGRhYmxlQXRTY3JlZW5Sb3cgPSB0aGlzLl9lZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93ID0gKHJvdykgPT4gZmFsc2U7XG4gIH1cblxuICByZW5kZXJJbmxpbmVDb21wb25lbnRzKGVsZW1lbnRzOiBBcnJheTxJbmxpbmVDb21wb25lbnQ+KTogUHJvbWlzZTxBcnJheTxSZW5kZXJlZENvbXBvbmVudD4+IHtcbiAgICBjb25zdCB7b2JqZWN0fSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcbiAgICBjb25zdCBjb21wb25lbnRzID0gW107XG4gICAgY29uc3QgcmVuZGVyUHJvbWlzZXMgPSBbXTtcbiAgICBjb25zdCBzY3JvbGxUb1JvdyA9IHRoaXMuX3Njcm9sbFRvUm93LmJpbmQodGhpcyk7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IHtub2RlLCBidWZmZXJSb3d9ID0gZWxlbWVudDtcbiAgICAgIGlmICghbm9kZS5wcm9wcy5oZWxwZXJzKSB7XG4gICAgICAgIG5vZGUucHJvcHMuaGVscGVycyA9IHt9O1xuICAgICAgfVxuICAgICAgY29uc3QgaGVscGVycyA9IHtcbiAgICAgICAgc2Nyb2xsVG9Sb3csXG4gICAgICB9O1xuICAgICAgb2JqZWN0LmFzc2lnbihub2RlLnByb3BzLmhlbHBlcnMsIGhlbHBlcnMpO1xuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBsZXQgY29tcG9uZW50O1xuICAgICAgY29uc3QgZGlkUmVuZGVyUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICBjb21wb25lbnQgPSBSZWFjdC5yZW5kZXIobm9kZSwgY29udGFpbmVyLCAoKSA9PiB7XG4gICAgICAgICAgcmVzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZW5kZXJQcm9taXNlcy5wdXNoKGRpZFJlbmRlclByb21pc2UpO1xuICAgICAgY29tcG9uZW50cy5wdXNoKHtcbiAgICAgICAgYnVmZmVyUm93LFxuICAgICAgICAvLyAkRmxvd0ZpeE1lKG1vc3QpXG4gICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgY29udGFpbmVyLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHJlbmRlclByb21pc2VzKS50aGVuKCgpID0+IGNvbXBvbmVudHMpO1xuICB9XG5cbiAgYXR0YWNoSW5saW5lQ29tcG9uZW50cyhlbGVtZW50czogQXJyYXk8UmVuZGVyZWRDb21wb25lbnQ+KTogdm9pZCB7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IHtidWZmZXJSb3csIGNvbnRhaW5lcn0gPSBlbGVtZW50O1xuICAgICAgLy8gYW4gb3ZlcmxheSBtYXJrZXIgYXQgYSBidWZmZXIgcmFuZ2Ugd2l0aCByb3cgeCByZW5kZXJzIHVuZGVyIHJvdyB4ICsgMVxuICAgICAgLy8gc28sIHVzZSByYW5nZSBhdCBidWZmZXJSb3cgLSAxIHRvIGFjdHVhbGx5IGRpc3BsYXkgYXQgYnVmZmVyUm93XG4gICAgICBjb25zdCByYW5nZSA9IFtbYnVmZmVyUm93IC0gMSwgMF0sIFtidWZmZXJSb3cgLSAxLCAwXV07XG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlLCB7aW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdvdmVybGF5JywgaXRlbTogY29udGFpbmVyfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpO1xuICB9XG5cbiAgc2V0RmlsZUNvbnRlbnRzKGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcsIGNsZWFySGlzdG9yeTogYm9vbGVhbik6IHZvaWQge1xuICAgIC8vIFRoZSB0ZXh0IGlzIHNldCB2aWEgZGlmZnMgdG8ga2VlcCB0aGUgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuX2VkaXRvci5nZXRCdWZmZXIoKTtcbiAgICBidWZmZXIuc2V0VGV4dFZpYURpZmYoY29udGVudHMpO1xuICAgIGlmIChjbGVhckhpc3RvcnkpIHtcbiAgICAgIGJ1ZmZlci5jbGVhclVuZG9TdGFjaygpO1xuICAgIH1cbiAgICBjb25zdCBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5zZWxlY3RHcmFtbWFyKGZpbGVQYXRoLCBjb250ZW50cyk7XG4gICAgdGhpcy5fZWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcik7XG4gIH1cblxuICBnZXRNb2RlbCgpOiBPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3I7XG4gIH1cblxuICBnZXRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvci5nZXRUZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGFkZGVkTGluZXMgQW4gYXJyYXkgb2YgYnVmZmVyIGxpbmUgbnVtYmVycyB0aGF0IHNob3VsZCBiZSBoaWdobGlnaHRlZCBhcyBhZGRlZC5cbiAgICogQHBhcmFtIHJlbW92ZWRMaW5lcyBBbiBhcnJheSBvZiBidWZmZXIgbGluZSBudW1iZXJzIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkIGFzIHJlbW92ZWQuXG4gICAqL1xuICBzZXRIaWdobGlnaHRlZExpbmVzKGFkZGVkTGluZXM6IEFycmF5PG51bWJlcj4gPSBbXSwgcmVtb3ZlZExpbmVzOiBBcnJheTxudW1iZXI+ID0gW10pIHtcbiAgICBmb3IgKGNvbnN0IG1hcmtlciBvZiB0aGlzLl9tYXJrZXJzKSB7XG4gICAgICBtYXJrZXIuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9tYXJrZXJzID0gYWRkZWRMaW5lcy5tYXAobGluZU51bWJlciA9PiB0aGlzLl9jcmVhdGVMaW5lTWFya2VyKGxpbmVOdW1iZXIsICdpbnNlcnQnKSlcbiAgICAgICAgLmNvbmNhdChyZW1vdmVkTGluZXMubWFwKGxpbmVOdW1iZXIgPT4gdGhpcy5fY3JlYXRlTGluZU1hcmtlcihsaW5lTnVtYmVyLCAnZGVsZXRlJykpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gbGluZU51bWJlciBBIGJ1ZmZlciBsaW5lIG51bWJlciB0byBiZSBoaWdobGlnaHRlZC5cbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGxpbmUuXG4gICogICAgQ291bGQgYmUgYSB2YWx1ZSBvZjogWydpbnNlcnQnLCAnZGVsZXRlJ10uXG4gICAqL1xuICBfY3JlYXRlTGluZU1hcmtlcihsaW5lTnVtYmVyOiBudW1iZXIsIHR5cGU6IHN0cmluZyk6IGF0b20kTWFya2VyIHtcbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IHRoaXMuX2VkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKHtyb3c6IGxpbmVOdW1iZXIsIGNvbHVtbjogMH0pO1xuICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgICBzY3JlZW5Qb3NpdGlvbixcbiAgICAgICAgW3NjcmVlblBvc2l0aW9uLnJvdywgdGhpcy5fZWRpdG9yLmxpbmVUZXh0Rm9yU2NyZWVuUm93KHNjcmVlblBvc2l0aW9uLnJvdykubGVuZ3RoXSxcbiAgICAgICAgLy8gVE9ETzogaGlnaGxpZ2h0IHRoZSBmdWxsIGxpbmUgd2hlbiB0aGUgbWFwcGluZyBiZXR3ZWVuIGJ1ZmZlciBsaW5lcyB0byBzY3JlZW4gbGluZSBpcyBpbXBsZW1lbnRlZC5cbiAgICAgICAgLy8ge3Jvdzogc2NyZWVuUG9zaXRpb24ucm93ICsgMSwgY29sdW1uOiAwfVxuICAgICk7XG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtTY3JlZW5SYW5nZShyYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBgZGlmZi12aWV3LSR7dHlwZX1gfSk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIHNldE9mZnNldHMobGluZU9mZnNldHM6IE9mZnNldE1hcCk6IHZvaWQge1xuICAgIHRoaXMuX2xpbmVPZmZzZXRzID0gbGluZU9mZnNldHM7XG4gICAgLy8gV2hlbiB0aGUgZGlmZiB2aWV3IGlzIGVkaXRhYmxlOiB1cG9uIGVkaXRzIGluIHRoZSBuZXcgZWRpdG9yLCB0aGUgb2xkIGVkaXRvciBuZWVkcyB0byB1cGRhdGUgaXRzXG4gICAgLy8gcmVuZGVyaW5nIHN0YXRlIHRvIHNob3cgdGhlIG9mZnNldCB3cmFwcGVkIGxpbmVzLlxuICAgIC8vIFRoaXMgaXNuJ3QgYSBwdWJsaWMgQVBJLCBidXQgY2FtZSBmcm9tIGEgZGlzY3Vzc2lvbiBvbiB0aGUgQXRvbSBwdWJsaWMgY2hhbm5lbC5cbiAgICB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci51cGRhdGVBbGxTY3JlZW5MaW5lcygpO1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuX2VkaXRvckVsZW1lbnQuY29tcG9uZW50IHx8IHt9O1xuICAgIGNvbnN0IHtwcmVzZW50ZXJ9ID0gY29tcG9uZW50O1xuICAgIGlmICghcHJlc2VudGVyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ05vIHRleHQgZWRpdG9yIHByZXNlbnRlciBpcyB3aXJlZCB1cCB0byB0aGUgRGlmZiBWaWV3IHRleHQgZWRpdG9yIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZXNlbnRlci51cGRhdGVTdGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQXRvbSB1bnRpbCB2MS4wLjE4IGhhcyB1cGRhdGVTdGF0ZSB0byBmb3JjZSByZS1yZW5kZXJpbmcgb2YgZWRpdG9yIHN0YXRlLlxuICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gcmVxdWVzdCBhIGZ1bGwgcmUtcmVuZGVyIGZyb20gdGhlIGVkaXRvci5cbiAgICAgIHByZXNlbnRlci51cGRhdGVTdGF0ZSgpO1xuICAgIH1cbiAgICAvLyBBdG9tIG1hc3RlciBhZnRlciB2MS4wLjE4IGhhcyB3aWxsIGtub3cgd2hlbiBpdCBoYXMgY2hhbmdlZCBsaW5lcyBvciBkZWNvcmF0aW9ucyxcbiAgICAvLyBhbmQgd2lsbCBhdXRvLXVwZGF0ZS5cbiAgfVxuXG4gIF9idWlsZFNjcmVlbkxpbmVzV2l0aE9mZnNldHMoc3RhcnRCdWZmZXJSb3c6IG51bWJlciwgZW5kQnVmZmVyUm93OiBudW1iZXIpOiBMaW5lUmFuZ2VzV2l0aE9mZnNldHMge1xuICAgIC8vIEhBQ0shIEVuYWJsaW5nIGBzb2Z0V3JhcHBlZGAgbGluZXMgd291bGQgZ3JlYXRseSBjb21wbGljYXRlIHRoZSBvZmZzZXQgc2NyZWVuIGxpbmUgbWFwcGluZ1xuICAgIC8vIG5lZWRlZCB0byByZW5kZXIgdGhlIG9mZnNldCBsaW5lcyBmb3IgdGhlIERpZmYgVmlldy5cbiAgICAvLyBIZW5jZSwgd2UgbmVlZCB0byBkaXNhYmxlIHRoZSBvcmlnaW5hbCBzY3JlZW4gbGluZSBmcm9tIHJldHVybmluZyBzb2Z0LXdyYXBwZWQgbGluZXMuXG4gICAgY29uc3Qge2Rpc3BsYXlCdWZmZXJ9ID0gdGhpcy5fZWRpdG9yO1xuICAgIGRpc3BsYXlCdWZmZXIuc29mdFdyYXBwZWQgPSBmYWxzZTtcbiAgICBjb25zdCB7cmVnaW9ucywgc2NyZWVuTGluZXN9ID0gdGhpcy5fb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzLmFwcGx5KGRpc3BsYXlCdWZmZXIsIGFyZ3VtZW50cyk7XG4gICAgZGlzcGxheUJ1ZmZlci5zb2Z0V3JhcHBlZCA9IHRydWU7XG4gICAgaWYgKHRoaXMuX2xpbmVPZmZzZXRzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB7cmVnaW9ucywgc2NyZWVuTGluZXN9O1xuICAgIH1cblxuICAgIHJldHVybiBidWlsZExpbmVSYW5nZXNXaXRoT2Zmc2V0cyhzY3JlZW5MaW5lcywgdGhpcy5fbGluZU9mZnNldHMsIHN0YXJ0QnVmZmVyUm93LCBlbmRCdWZmZXJSb3csXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBzY3JlZW5MaW5lc1swXS5jb3B5KCk7XG4gICAgICAgIGNvcHkudG9rZW4gPSBbXTtcbiAgICAgICAgY29weS50ZXh0ID0gJyc7XG4gICAgICAgIGNvcHkudGFncyA9IFtdO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgc2V0UmVhZE9ubHkoKTogdm9pZCB7XG4gICAgLy8gVW5mb3R1bmF0ZWx5LCB0aGVyZSBpcyBubyBvdGhlciBjbGVhbiB3YXkgdG8gbWFrZSBhbiBlZGl0b3IgcmVhZCBvbmx5LlxuICAgIC8vIEdvdCB0aGlzIGZyb20gQXRvbSdzIGNvZGUgdG8gbWFrZSBhbiBlZGl0b3IgcmVhZC1vbmx5LlxuICAgIC8vIEZpbGVkIGFuIGlzc3VlOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy82ODgwXG4gICAgdGhpcy5fZWRpdG9yLmdldERlY29yYXRpb25zKHtjbGFzczogJ2N1cnNvci1saW5lJ30pWzBdLmRlc3Ryb3koKTtcbiAgICAvLyBDYW5jZWwgaW5zZXJ0IGV2ZW50cyB0byBwcmV2ZW50IHR5cGluZyBpbiB0aGUgdGV4dCBlZGl0b3IgYW5kIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGhpcy5fZWRpdG9yLm9uV2lsbEluc2VydFRleHQoZXZlbnQgPT4gZXZlbnQuY2FuY2VsKCkpO1xuICAgIC8vIFN3YWxsb3cgcGFzdGUgdGV4dHMuXG4gICAgdGhpcy5fZWRpdG9yLnBhc3RlVGV4dCA9ICgpID0+IHt9O1xuICAgIC8vIFN3YWxsb3cgaW5zZXJ0IGFuZCBkZWxldGUgY2FsbHMgb24gaXRzIGJ1ZmZlci5cbiAgICB0aGlzLl9lZGl0b3IuZ2V0QnVmZmVyKCkuZGVsZXRlID0gKCkgPT4ge307XG4gICAgdGhpcy5fZWRpdG9yLmdldEJ1ZmZlcigpLmluc2VydCA9ICgpID0+IHt9O1xuICB9XG5cbiAgX3Njcm9sbFRvUm93KHJvdzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW3JvdywgMF0pO1xuICB9XG59O1xuIl19