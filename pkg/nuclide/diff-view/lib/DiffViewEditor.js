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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _editorUtils = require('./editor-utils');

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
          component = _reactForAtom2['default'].render(node, container, function () {
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
//# sourceMappingURL=data:application/json;base64,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QUFFLFlBQVksRUFDNUYsWUFBTTtBQUNKLFlBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQyxZQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixZQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNmLFlBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsZUFBTyxJQUFJLENBQUM7T0FDYixDQUNGLENBQUM7S0FDSDs7O1dBRVUsdUJBQVM7Ozs7QUFJbEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBQyxTQUFPLGFBQWEsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWpFLFVBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtPQUFBLENBQUMsQ0FBQzs7QUFFdkQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsWUFBTSxFQUFFLENBQUM7O0FBRWxDLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQU8sR0FBRyxZQUFNLEVBQUUsQ0FBQztBQUMzQyxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sR0FBRyxZQUFNLEVBQUUsQ0FBQztLQUM1Qzs7O1dBRVcsc0JBQUMsR0FBVyxFQUFRO0FBQzlCLFVBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMvQzs7O1NBMUxrQixjQUFjOzs7cUJBQWQsY0FBYztBQTJMbEMsQ0FBQyIsImZpbGUiOiJEaWZmVmlld0VkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtJbmxpbmVDb21wb25lbnQsIFJlbmRlcmVkQ29tcG9uZW50LCBMaW5lUmFuZ2VzV2l0aE9mZnNldHMsIE9mZnNldE1hcH0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtidWlsZExpbmVSYW5nZXNXaXRoT2Zmc2V0c30gZnJvbSAnLi9lZGl0b3ItdXRpbHMnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8qKlxuICogVGhlIERpZmZWaWV3RWRpdG9yIG1hbmFnZXMgdGhlIGxpZmVjeWNsZSBvZiB0aGUgdHdvIGVkaXRvcnMgdXNlZCBpbiB0aGUgZGlmZiB2aWV3LFxuICogYW5kIGNvbnRyb2xzIGl0cyByZW5kZXJpbmcgb2YgaGlnaGxpZ2h0cyBhbmQgb2Zmc2V0cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdFZGl0b3Ige1xuICBfZWRpdG9yOiBPYmplY3Q7XG4gIF9lZGl0b3JFbGVtZW50OiBPYmplY3Q7XG4gIF9tYXJrZXJzOiBBcnJheTxhdG9tJE1hcmtlcj47XG4gIF9saW5lT2Zmc2V0czogT2Zmc2V0TWFwO1xuICBfb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzOiAoc3RhcnRCdWZmZXJSb3c6IG51bWJlciwgZW5kQnVmZmVyUm93OiBudW1iZXIpID0+IG1peGVkO1xuXG4gIGNvbnN0cnVjdG9yKGVkaXRvckVsZW1lbnQ6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQpIHtcbiAgICB0aGlzLl9lZGl0b3JFbGVtZW50ID0gZWRpdG9yRWxlbWVudDtcbiAgICB0aGlzLl9lZGl0b3IgPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCk7XG5cbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgdGhpcy5fbGluZU9mZnNldHMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBVZ2x5IEhhY2sgdG8gdGhlIGRpc3BsYXkgYnVmZmVyIHRvIGFsbG93IGZha2Ugc29mdCB3cmFwcGVkIGxpbmVzLFxuICAgIC8vIHRvIGNyZWF0ZSB0aGUgbm9uLW51bWJlcmVkIGVtcHR5IHNwYWNlIG5lZWRlZCBiZXR3ZWVuIHJlYWwgdGV4dCBidWZmZXIgbGluZXMuXG4gICAgLy8gJEZsb3dGaXhNZSB1c2Ugb2Ygbm9uLW9mZmljaWFsIEFQSS5cbiAgICB0aGlzLl9vcmlnaW5hbEJ1aWxkU2NyZWVuTGluZXMgPSB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci5idWlsZFNjcmVlbkxpbmVzO1xuICAgIC8vICRGbG93Rml4TWUgdXNlIG9mIG5vbi1vZmZpY2lhbCBBUEkuXG4gICAgdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuY2hlY2tTY3JlZW5MaW5lc0ludmFyaWFudCA9ICgpID0+IHt9O1xuICAgIC8vICRGbG93Rml4TWUgdXNlIG9mIG5vbi1vZmZpY2lhbCBBUEkuXG4gICAgdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuYnVpbGRTY3JlZW5MaW5lcyA9ICguLi5hcmdzKSA9PiB0aGlzLl9idWlsZFNjcmVlbkxpbmVzV2l0aE9mZnNldHMuYXBwbHkodGhpcywgYXJncyk7XG5cbiAgICAvLyBUaGVyZSBpcyBubyBlZGl0b3IgQVBJIHRvIGNhbmNlbCBmb2xkYWJpbGl0eSwgYnV0IGRlZXAgaW5zaWRlIHRoZSBsaW5lIHN0YXRlIGNyZWF0aW9uLFxuICAgIC8vIGl0IHVzZXMgdGhvc2UgZnVuY3Rpb25zIHRvIGRldGVybWluZSBpZiBhIGxpbmUgaXMgZm9sZGFibGUgb3Igbm90LlxuICAgIC8vIEZvciBEaWZmIFZpZXcsIGZvbGRpbmcgYnJlYWtzIG9mZnNldHMsIGhlbmNlIHdlIG5lZWQgdG8gbWFrZSBpdCB1bmZvbGRhYmxlLlxuICAgIC8vICRGbG93Rml4TWUgdXNlIG9mIG5vbi1vZmZpY2lhbCBBUEkuXG4gICAgdGhpcy5fZWRpdG9yLmlzRm9sZGFibGVBdFNjcmVlblJvdyA9IHRoaXMuX2VkaXRvci5pc0ZvbGRhYmxlQXRCdWZmZXJSb3cgPSAocm93KSA9PiBmYWxzZTtcbiAgfVxuXG4gIHJlbmRlcklubGluZUNvbXBvbmVudHMoZWxlbWVudHM6IEFycmF5PElubGluZUNvbXBvbmVudD4pOiBQcm9taXNlPEFycmF5PFJlbmRlcmVkQ29tcG9uZW50Pj4ge1xuICAgIGNvbnN0IHtvYmplY3R9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuICAgIGNvbnN0IGNvbXBvbmVudHMgPSBbXTtcbiAgICBjb25zdCByZW5kZXJQcm9taXNlcyA9IFtdO1xuICAgIGNvbnN0IHNjcm9sbFRvUm93ID0gdGhpcy5fc2Nyb2xsVG9Sb3cuYmluZCh0aGlzKTtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgY29uc3Qge25vZGUsIGJ1ZmZlclJvd30gPSBlbGVtZW50O1xuICAgICAgaWYgKCFub2RlLnByb3BzLmhlbHBlcnMpIHtcbiAgICAgICAgbm9kZS5wcm9wcy5oZWxwZXJzID0ge307XG4gICAgICB9XG4gICAgICBjb25zdCBoZWxwZXJzID0ge1xuICAgICAgICBzY3JvbGxUb1JvdyxcbiAgICAgIH07XG4gICAgICBvYmplY3QuYXNzaWduKG5vZGUucHJvcHMuaGVscGVycywgaGVscGVycyk7XG4gICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGxldCBjb21wb25lbnQ7XG4gICAgICBjb25zdCBkaWRSZW5kZXJQcm9taXNlID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgIGNvbXBvbmVudCA9IFJlYWN0LnJlbmRlcihub2RlLCBjb250YWluZXIsICgpID0+IHtcbiAgICAgICAgICByZXMoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJlbmRlclByb21pc2VzLnB1c2goZGlkUmVuZGVyUHJvbWlzZSk7XG4gICAgICBjb21wb25lbnRzLnB1c2goe1xuICAgICAgICBidWZmZXJSb3csXG4gICAgICAgIC8vICRGbG93Rml4TWUobW9zdClcbiAgICAgICAgY29tcG9uZW50LFxuICAgICAgICBjb250YWluZXIsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVuZGVyUHJvbWlzZXMpLnRoZW4oKCkgPT4gY29tcG9uZW50cyk7XG4gIH1cblxuICBhdHRhY2hJbmxpbmVDb21wb25lbnRzKGVsZW1lbnRzOiBBcnJheTxSZW5kZXJlZENvbXBvbmVudD4pOiB2b2lkIHtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgY29uc3Qge2J1ZmZlclJvdywgY29udGFpbmVyfSA9IGVsZW1lbnQ7XG4gICAgICAvLyBhbiBvdmVybGF5IG1hcmtlciBhdCBhIGJ1ZmZlciByYW5nZSB3aXRoIHJvdyB4IHJlbmRlcnMgdW5kZXIgcm93IHggKyAxXG4gICAgICAvLyBzbywgdXNlIHJhbmdlIGF0IGJ1ZmZlclJvdyAtIDEgdG8gYWN0dWFsbHkgZGlzcGxheSBhdCBidWZmZXJSb3dcbiAgICAgIGNvbnN0IHJhbmdlID0gW1tidWZmZXJSb3cgLSAxLCAwXSwgW2J1ZmZlclJvdyAtIDEsIDBdXTtcbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuX2VkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ292ZXJsYXknLCBpdGVtOiBjb250YWluZXJ9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldExpbmVIZWlnaHRJblBpeGVscygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCk7XG4gIH1cblxuICBzZXRGaWxlQ29udGVudHMoZmlsZVBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZywgY2xlYXJIaXN0b3J5OiBib29sZWFuKTogdm9pZCB7XG4gICAgLy8gVGhlIHRleHQgaXMgc2V0IHZpYSBkaWZmcyB0byBrZWVwIHRoZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgY29uc3QgYnVmZmVyID0gdGhpcy5fZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGJ1ZmZlci5zZXRUZXh0VmlhRGlmZihjb250ZW50cyk7XG4gICAgaWYgKGNsZWFySGlzdG9yeSkge1xuICAgICAgYnVmZmVyLmNsZWFyVW5kb1N0YWNrKCk7XG4gICAgfVxuICAgIGNvbnN0IGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLnNlbGVjdEdyYW1tYXIoZmlsZVBhdGgsIGNvbnRlbnRzKTtcbiAgICB0aGlzLl9lZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKTtcbiAgfVxuXG4gIGdldE1vZGVsKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvcjtcbiAgfVxuXG4gIGdldFRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yLmdldFRleHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gYWRkZWRMaW5lcyBBbiBhcnJheSBvZiBidWZmZXIgbGluZSBudW1iZXJzIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkIGFzIGFkZGVkLlxuICAgKiBAcGFyYW0gcmVtb3ZlZExpbmVzIEFuIGFycmF5IG9mIGJ1ZmZlciBsaW5lIG51bWJlcnMgdGhhdCBzaG91bGQgYmUgaGlnaGxpZ2h0ZWQgYXMgcmVtb3ZlZC5cbiAgICovXG4gIHNldEhpZ2hsaWdodGVkTGluZXMoYWRkZWRMaW5lczogQXJyYXk8bnVtYmVyPiA9IFtdLCByZW1vdmVkTGluZXM6IEFycmF5PG51bWJlcj4gPSBbXSkge1xuICAgIGZvciAoY29uc3QgbWFya2VyIG9mIHRoaXMuX21hcmtlcnMpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX21hcmtlcnMgPSBhZGRlZExpbmVzLm1hcChsaW5lTnVtYmVyID0+IHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIobGluZU51bWJlciwgJ2luc2VydCcpKVxuICAgICAgICAuY29uY2F0KHJlbW92ZWRMaW5lcy5tYXAobGluZU51bWJlciA9PiB0aGlzLl9jcmVhdGVMaW5lTWFya2VyKGxpbmVOdW1iZXIsICdkZWxldGUnKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyIEEgYnVmZmVyIGxpbmUgbnVtYmVyIHRvIGJlIGhpZ2hsaWdodGVkLlxuICAgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBoaWdobGlnaHQgdG8gYmUgYXBwbGllZCB0byB0aGUgbGluZS5cbiAgKiAgICBDb3VsZCBiZSBhIHZhbHVlIG9mOiBbJ2luc2VydCcsICdkZWxldGUnXS5cbiAgICovXG4gIF9jcmVhdGVMaW5lTWFya2VyKGxpbmVOdW1iZXI6IG51bWJlciwgdHlwZTogc3RyaW5nKTogYXRvbSRNYXJrZXIge1xuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gdGhpcy5fZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oe3JvdzogbGluZU51bWJlciwgY29sdW1uOiAwfSk7XG4gICAgY29uc3QgcmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgIHNjcmVlblBvc2l0aW9uLFxuICAgICAgICBbc2NyZWVuUG9zaXRpb24ucm93LCB0aGlzLl9lZGl0b3IubGluZVRleHRGb3JTY3JlZW5Sb3coc2NyZWVuUG9zaXRpb24ucm93KS5sZW5ndGhdLFxuICAgICAgICAvLyBUT0RPOiBoaWdobGlnaHQgdGhlIGZ1bGwgbGluZSB3aGVuIHRoZSBtYXBwaW5nIGJldHdlZW4gYnVmZmVyIGxpbmVzIHRvIHNjcmVlbiBsaW5lIGlzIGltcGxlbWVudGVkLlxuICAgICAgICAvLyB7cm93OiBzY3JlZW5Qb3NpdGlvbi5yb3cgKyAxLCBjb2x1bW46IDB9XG4gICAgKTtcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya1NjcmVlblJhbmdlKHJhbmdlLCB7aW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IGBkaWZmLXZpZXctJHt0eXBlfWB9KTtcbiAgICByZXR1cm4gbWFya2VyO1xuICB9XG5cbiAgc2V0T2Zmc2V0cyhsaW5lT2Zmc2V0czogT2Zmc2V0TWFwKTogdm9pZCB7XG4gICAgdGhpcy5fbGluZU9mZnNldHMgPSBsaW5lT2Zmc2V0cztcbiAgICAvLyBXaGVuIHRoZSBkaWZmIHZpZXcgaXMgZWRpdGFibGU6IHVwb24gZWRpdHMgaW4gdGhlIG5ldyBlZGl0b3IsIHRoZSBvbGQgZWRpdG9yIG5lZWRzIHRvIHVwZGF0ZSBpdHNcbiAgICAvLyByZW5kZXJpbmcgc3RhdGUgdG8gc2hvdyB0aGUgb2Zmc2V0IHdyYXBwZWQgbGluZXMuXG4gICAgLy8gVGhpcyBpc24ndCBhIHB1YmxpYyBBUEksIGJ1dCBjYW1lIGZyb20gYSBkaXNjdXNzaW9uIG9uIHRoZSBBdG9tIHB1YmxpYyBjaGFubmVsLlxuICAgIHRoaXMuX2VkaXRvci5kaXNwbGF5QnVmZmVyLnVwZGF0ZUFsbFNjcmVlbkxpbmVzKCk7XG4gICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5fZWRpdG9yRWxlbWVudC5jb21wb25lbnQgfHwge307XG4gICAgY29uc3Qge3ByZXNlbnRlcn0gPSBjb21wb25lbnQ7XG4gICAgaWYgKCFwcmVzZW50ZXIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignTm8gdGV4dCBlZGl0b3IgcHJlc2VudGVyIGlzIHdpcmVkIHVwIHRvIHRoZSBEaWZmIFZpZXcgdGV4dCBlZGl0b3IhJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJlc2VudGVyLnVwZGF0ZVN0YXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBdG9tIHVudGlsIHYxLjAuMTggaGFzIHVwZGF0ZVN0YXRlIHRvIGZvcmNlIHJlLXJlbmRlcmluZyBvZiBlZGl0b3Igc3RhdGUuXG4gICAgICAvLyBUaGlzIGlzIG5lZWRlZCB0byByZXF1ZXN0IGEgZnVsbCByZS1yZW5kZXIgZnJvbSB0aGUgZWRpdG9yLlxuICAgICAgcHJlc2VudGVyLnVwZGF0ZVN0YXRlKCk7XG4gICAgfVxuICAgIC8vIEF0b20gbWFzdGVyIGFmdGVyIHYxLjAuMTggaGFzIHdpbGwga25vdyB3aGVuIGl0IGhhcyBjaGFuZ2VkIGxpbmVzIG9yIGRlY29yYXRpb25zLFxuICAgIC8vIGFuZCB3aWxsIGF1dG8tdXBkYXRlLlxuICB9XG5cbiAgX2J1aWxkU2NyZWVuTGluZXNXaXRoT2Zmc2V0cyhzdGFydEJ1ZmZlclJvdzogbnVtYmVyLCBlbmRCdWZmZXJSb3c6IG51bWJlcik6IExpbmVSYW5nZXNXaXRoT2Zmc2V0cyB7XG4gICAgLy8gSEFDSyEgRW5hYmxpbmcgYHNvZnRXcmFwcGVkYCBsaW5lcyB3b3VsZCBncmVhdGx5IGNvbXBsaWNhdGUgdGhlIG9mZnNldCBzY3JlZW4gbGluZSBtYXBwaW5nXG4gICAgLy8gbmVlZGVkIHRvIHJlbmRlciB0aGUgb2Zmc2V0IGxpbmVzIGZvciB0aGUgRGlmZiBWaWV3LlxuICAgIC8vIEhlbmNlLCB3ZSBuZWVkIHRvIGRpc2FibGUgdGhlIG9yaWdpbmFsIHNjcmVlbiBsaW5lIGZyb20gcmV0dXJuaW5nIHNvZnQtd3JhcHBlZCBsaW5lcy5cbiAgICBjb25zdCB7ZGlzcGxheUJ1ZmZlcn0gPSB0aGlzLl9lZGl0b3I7XG4gICAgZGlzcGxheUJ1ZmZlci5zb2Z0V3JhcHBlZCA9IGZhbHNlO1xuICAgIGNvbnN0IHtyZWdpb25zLCBzY3JlZW5MaW5lc30gPSB0aGlzLl9vcmlnaW5hbEJ1aWxkU2NyZWVuTGluZXMuYXBwbHkoZGlzcGxheUJ1ZmZlciwgYXJndW1lbnRzKTtcbiAgICBkaXNwbGF5QnVmZmVyLnNvZnRXcmFwcGVkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5fbGluZU9mZnNldHMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtyZWdpb25zLCBzY3JlZW5MaW5lc307XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWxkTGluZVJhbmdlc1dpdGhPZmZzZXRzKHNjcmVlbkxpbmVzLCB0aGlzLl9saW5lT2Zmc2V0cywgc3RhcnRCdWZmZXJSb3csIGVuZEJ1ZmZlclJvdyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgY29weSA9IHNjcmVlbkxpbmVzWzBdLmNvcHkoKTtcbiAgICAgICAgY29weS50b2tlbiA9IFtdO1xuICAgICAgICBjb3B5LnRleHQgPSAnJztcbiAgICAgICAgY29weS50YWdzID0gW107XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBzZXRSZWFkT25seSgpOiB2b2lkIHtcbiAgICAvLyBVbmZvdHVuYXRlbHksIHRoZXJlIGlzIG5vIG90aGVyIGNsZWFuIHdheSB0byBtYWtlIGFuIGVkaXRvciByZWFkIG9ubHkuXG4gICAgLy8gR290IHRoaXMgZnJvbSBBdG9tJ3MgY29kZSB0byBtYWtlIGFuIGVkaXRvciByZWFkLW9ubHkuXG4gICAgLy8gRmlsZWQgYW4gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY4ODBcbiAgICB0aGlzLl9lZGl0b3IuZ2V0RGVjb3JhdGlvbnMoe2NsYXNzOiAnY3Vyc29yLWxpbmUnfSlbMF0uZGVzdHJveSgpO1xuICAgIC8vIENhbmNlbCBpbnNlcnQgZXZlbnRzIHRvIHByZXZlbnQgdHlwaW5nIGluIHRoZSB0ZXh0IGVkaXRvciBhbmQgZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICB0aGlzLl9lZGl0b3Iub25XaWxsSW5zZXJ0VGV4dChldmVudCA9PiBldmVudC5jYW5jZWwoKSk7XG4gICAgLy8gU3dhbGxvdyBwYXN0ZSB0ZXh0cy5cbiAgICB0aGlzLl9lZGl0b3IucGFzdGVUZXh0ID0gKCkgPT4ge307XG4gICAgLy8gU3dhbGxvdyBpbnNlcnQgYW5kIGRlbGV0ZSBjYWxscyBvbiBpdHMgYnVmZmVyLlxuICAgIHRoaXMuX2VkaXRvci5nZXRCdWZmZXIoKS5kZWxldGUgPSAoKSA9PiB7fTtcbiAgICB0aGlzLl9lZGl0b3IuZ2V0QnVmZmVyKCkuaW5zZXJ0ID0gKCkgPT4ge307XG4gIH1cblxuICBfc2Nyb2xsVG9Sb3cocm93OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbcm93LCAwXSk7XG4gIH1cbn07XG4iXX0=