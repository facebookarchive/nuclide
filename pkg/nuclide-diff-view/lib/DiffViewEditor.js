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

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

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
      var _require = require('../../nuclide-commons');

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
          component = _reactForAtom.ReactDOM.render(node, container, function () {
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
    key: 'scrollToScreenLine',
    value: function scrollToScreenLine(screenLine) {
      this._editor.scrollToScreenPosition(
      // Markers are ordered in ascending order by line number.
      [screenLine, 0], { center: true });
    }
  }, {
    key: 'setFileContents',
    value: function setFileContents(filePath, contents) {
      // The text is set via diffs to keep the cursor position.
      var buffer = this._editor.getBuffer();
      if (buffer.getText() !== contents) {
        buffer.setTextViaDiff(contents);
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

      // TODO: highlight the full line when the mapping between buffer lines to screen line is
      //   implemented.
      // {row: screenPosition.row + 1, column: 0}
      var marker = this._editor.markScreenRange(range, { invalidate: 'never' });
      this._editor.decorateMarker(marker, { type: 'highlight', 'class': 'diff-view-' + type });
      return marker;
    }
  }, {
    key: 'setOffsets',
    value: function setOffsets(lineOffsets) {
      this._lineOffsets = lineOffsets;
      // When the diff view is editable: upon edits in the new editor, the old editor needs to update
      // its rendering state to show the offset wrapped lines.
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
    key: '_scrollToRow',
    value: function _scrollToRow(row) {
      this._editor.scrollToBufferPosition([row, 0]);
    }
  }]);

  return DiffViewEditor;
})();

exports['default'] = DiffViewEditor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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O0FBQ2hDLGVBQU8sRUFBQyxPQUFPLEVBQVAsT0FBTyxFQUFFLFdBQVcsRUFBWCxXQUFXLEVBQUMsQ0FBQztPQUMvQjs7QUFFRCxhQUFPLDZDQUEyQixXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUM1RixZQUFNO0FBQ0osWUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25DLFlBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFlBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsWUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZixlQUFPLElBQUksQ0FBQztPQUNiLENBQ0YsQ0FBQztLQUNIOzs7V0FFVyxzQkFBQyxHQUFXLEVBQVE7QUFDOUIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9DOzs7U0F6TGtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6IkRpZmZWaWV3RWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0lubGluZUNvbXBvbmVudCwgUmVuZGVyZWRDb21wb25lbnQsIExpbmVSYW5nZXNXaXRoT2Zmc2V0cywgT2Zmc2V0TWFwfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2J1aWxkTGluZVJhbmdlc1dpdGhPZmZzZXRzfSBmcm9tICcuL2VkaXRvci11dGlscyc7XG5pbXBvcnQge1JlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8qKlxuICogVGhlIERpZmZWaWV3RWRpdG9yIG1hbmFnZXMgdGhlIGxpZmVjeWNsZSBvZiB0aGUgdHdvIGVkaXRvcnMgdXNlZCBpbiB0aGUgZGlmZiB2aWV3LFxuICogYW5kIGNvbnRyb2xzIGl0cyByZW5kZXJpbmcgb2YgaGlnaGxpZ2h0cyBhbmQgb2Zmc2V0cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdFZGl0b3Ige1xuICBfZWRpdG9yOiBPYmplY3Q7XG4gIF9lZGl0b3JFbGVtZW50OiBPYmplY3Q7XG4gIF9tYXJrZXJzOiBBcnJheTxhdG9tJE1hcmtlcj47XG4gIF9saW5lT2Zmc2V0czogT2Zmc2V0TWFwO1xuICBfb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzOiAoc3RhcnRCdWZmZXJSb3c6IG51bWJlciwgZW5kQnVmZmVyUm93OiBudW1iZXIpID0+IG1peGVkO1xuXG4gIGNvbnN0cnVjdG9yKGVkaXRvckVsZW1lbnQ6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQpIHtcbiAgICB0aGlzLl9lZGl0b3JFbGVtZW50ID0gZWRpdG9yRWxlbWVudDtcbiAgICB0aGlzLl9lZGl0b3IgPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCk7XG5cbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgdGhpcy5fbGluZU9mZnNldHMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBVZ2x5IEhhY2sgdG8gdGhlIGRpc3BsYXkgYnVmZmVyIHRvIGFsbG93IGZha2Ugc29mdCB3cmFwcGVkIGxpbmVzLFxuICAgIC8vIHRvIGNyZWF0ZSB0aGUgbm9uLW51bWJlcmVkIGVtcHR5IHNwYWNlIG5lZWRlZCBiZXR3ZWVuIHJlYWwgdGV4dCBidWZmZXIgbGluZXMuXG4gICAgLy8gJEZsb3dGaXhNZSB1c2Ugb2Ygbm9uLW9mZmljaWFsIEFQSS5cbiAgICB0aGlzLl9vcmlnaW5hbEJ1aWxkU2NyZWVuTGluZXMgPSB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci5idWlsZFNjcmVlbkxpbmVzO1xuICAgIC8vICRGbG93Rml4TWUgdXNlIG9mIG5vbi1vZmZpY2lhbCBBUEkuXG4gICAgdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuY2hlY2tTY3JlZW5MaW5lc0ludmFyaWFudCA9ICgpID0+IHt9O1xuICAgIC8vICRGbG93Rml4TWUgdXNlIG9mIG5vbi1vZmZpY2lhbCBBUEkuXG4gICAgdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuYnVpbGRTY3JlZW5MaW5lcyA9XG4gICAgICAoLi4uYXJncykgPT4gdGhpcy5fYnVpbGRTY3JlZW5MaW5lc1dpdGhPZmZzZXRzLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXG4gICAgLy8gVGhlcmUgaXMgbm8gZWRpdG9yIEFQSSB0byBjYW5jZWwgZm9sZGFiaWxpdHksIGJ1dCBkZWVwIGluc2lkZSB0aGUgbGluZSBzdGF0ZSBjcmVhdGlvbixcbiAgICAvLyBpdCB1c2VzIHRob3NlIGZ1bmN0aW9ucyB0byBkZXRlcm1pbmUgaWYgYSBsaW5lIGlzIGZvbGRhYmxlIG9yIG5vdC5cbiAgICAvLyBGb3IgRGlmZiBWaWV3LCBmb2xkaW5nIGJyZWFrcyBvZmZzZXRzLCBoZW5jZSB3ZSBuZWVkIHRvIG1ha2UgaXQgdW5mb2xkYWJsZS5cbiAgICAvLyAkRmxvd0ZpeE1lIHVzZSBvZiBub24tb2ZmaWNpYWwgQVBJLlxuICAgIHRoaXMuX2VkaXRvci5pc0ZvbGRhYmxlQXRTY3JlZW5Sb3cgPSB0aGlzLl9lZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93ID0gcm93ID0+IGZhbHNlO1xuICB9XG5cbiAgcmVuZGVySW5saW5lQ29tcG9uZW50cyhlbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50Pik6IFByb21pc2U8QXJyYXk8UmVuZGVyZWRDb21wb25lbnQ+PiB7XG4gICAgY29uc3Qge29iamVjdH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbiAgICBjb25zdCBjb21wb25lbnRzID0gW107XG4gICAgY29uc3QgcmVuZGVyUHJvbWlzZXMgPSBbXTtcbiAgICBjb25zdCBzY3JvbGxUb1JvdyA9IHRoaXMuX3Njcm9sbFRvUm93LmJpbmQodGhpcyk7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IHtub2RlLCBidWZmZXJSb3d9ID0gZWxlbWVudDtcbiAgICAgIGlmICghbm9kZS5wcm9wcy5oZWxwZXJzKSB7XG4gICAgICAgIG5vZGUucHJvcHMuaGVscGVycyA9IHt9O1xuICAgICAgfVxuICAgICAgY29uc3QgaGVscGVycyA9IHtcbiAgICAgICAgc2Nyb2xsVG9Sb3csXG4gICAgICB9O1xuICAgICAgb2JqZWN0LmFzc2lnbihub2RlLnByb3BzLmhlbHBlcnMsIGhlbHBlcnMpO1xuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBsZXQgY29tcG9uZW50O1xuICAgICAgY29uc3QgZGlkUmVuZGVyUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICBjb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIobm9kZSwgY29udGFpbmVyLCAoKSA9PiB7XG4gICAgICAgICAgcmVzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZW5kZXJQcm9taXNlcy5wdXNoKGRpZFJlbmRlclByb21pc2UpO1xuICAgICAgY29tcG9uZW50cy5wdXNoKHtcbiAgICAgICAgYnVmZmVyUm93LFxuICAgICAgICAvLyAkRmxvd0ZpeE1lKG1vc3QpXG4gICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgY29udGFpbmVyLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHJlbmRlclByb21pc2VzKS50aGVuKCgpID0+IGNvbXBvbmVudHMpO1xuICB9XG5cbiAgYXR0YWNoSW5saW5lQ29tcG9uZW50cyhlbGVtZW50czogQXJyYXk8UmVuZGVyZWRDb21wb25lbnQ+KTogdm9pZCB7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IHtidWZmZXJSb3csIGNvbnRhaW5lcn0gPSBlbGVtZW50O1xuICAgICAgLy8gYW4gb3ZlcmxheSBtYXJrZXIgYXQgYSBidWZmZXIgcmFuZ2Ugd2l0aCByb3cgeCByZW5kZXJzIHVuZGVyIHJvdyB4ICsgMVxuICAgICAgLy8gc28sIHVzZSByYW5nZSBhdCBidWZmZXJSb3cgLSAxIHRvIGFjdHVhbGx5IGRpc3BsYXkgYXQgYnVmZmVyUm93XG4gICAgICBjb25zdCByYW5nZSA9IFtbYnVmZmVyUm93IC0gMSwgMF0sIFtidWZmZXJSb3cgLSAxLCAwXV07XG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlLCB7aW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdvdmVybGF5JywgaXRlbTogY29udGFpbmVyfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpO1xuICB9XG5cbiAgc2Nyb2xsVG9TY3JlZW5MaW5lKHNjcmVlbkxpbmU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5zY3JvbGxUb1NjcmVlblBvc2l0aW9uKFxuICAgICAgLy8gTWFya2VycyBhcmUgb3JkZXJlZCBpbiBhc2NlbmRpbmcgb3JkZXIgYnkgbGluZSBudW1iZXIuXG4gICAgICBbc2NyZWVuTGluZSwgMF0sXG4gICAgICB7Y2VudGVyOiB0cnVlfSxcbiAgICApO1xuICB9XG5cbiAgc2V0RmlsZUNvbnRlbnRzKGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBUaGUgdGV4dCBpcyBzZXQgdmlhIGRpZmZzIHRvIGtlZXAgdGhlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBjb25zdCBidWZmZXIgPSB0aGlzLl9lZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgaWYgKGJ1ZmZlci5nZXRUZXh0KCkgIT09IGNvbnRlbnRzKSB7XG4gICAgICBidWZmZXIuc2V0VGV4dFZpYURpZmYoY29udGVudHMpO1xuICAgIH1cbiAgICBjb25zdCBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5zZWxlY3RHcmFtbWFyKGZpbGVQYXRoLCBjb250ZW50cyk7XG4gICAgdGhpcy5fZWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcik7XG4gIH1cblxuICBnZXRNb2RlbCgpOiBPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3I7XG4gIH1cblxuICBnZXRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvci5nZXRUZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGFkZGVkTGluZXMgQW4gYXJyYXkgb2YgYnVmZmVyIGxpbmUgbnVtYmVycyB0aGF0IHNob3VsZCBiZSBoaWdobGlnaHRlZCBhcyBhZGRlZC5cbiAgICogQHBhcmFtIHJlbW92ZWRMaW5lcyBBbiBhcnJheSBvZiBidWZmZXIgbGluZSBudW1iZXJzIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkIGFzIHJlbW92ZWQuXG4gICAqL1xuICBzZXRIaWdobGlnaHRlZExpbmVzKGFkZGVkTGluZXM6IEFycmF5PG51bWJlcj4gPSBbXSwgcmVtb3ZlZExpbmVzOiBBcnJheTxudW1iZXI+ID0gW10pIHtcbiAgICBmb3IgKGNvbnN0IG1hcmtlciBvZiB0aGlzLl9tYXJrZXJzKSB7XG4gICAgICBtYXJrZXIuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9tYXJrZXJzID0gYWRkZWRMaW5lcy5tYXAobGluZU51bWJlciA9PiB0aGlzLl9jcmVhdGVMaW5lTWFya2VyKGxpbmVOdW1iZXIsICdpbnNlcnQnKSlcbiAgICAgICAgLmNvbmNhdChyZW1vdmVkTGluZXMubWFwKGxpbmVOdW1iZXIgPT4gdGhpcy5fY3JlYXRlTGluZU1hcmtlcihsaW5lTnVtYmVyLCAnZGVsZXRlJykpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gbGluZU51bWJlciBBIGJ1ZmZlciBsaW5lIG51bWJlciB0byBiZSBoaWdobGlnaHRlZC5cbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGxpbmUuXG4gICogICAgQ291bGQgYmUgYSB2YWx1ZSBvZjogWydpbnNlcnQnLCAnZGVsZXRlJ10uXG4gICAqL1xuICBfY3JlYXRlTGluZU1hcmtlcihsaW5lTnVtYmVyOiBudW1iZXIsIHR5cGU6IHN0cmluZyk6IGF0b20kTWFya2VyIHtcbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9XG4gICAgICB0aGlzLl9lZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbih7cm93OiBsaW5lTnVtYmVyLCBjb2x1bW46IDB9KTtcbiAgICBjb25zdCByYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgc2NyZWVuUG9zaXRpb24sXG4gICAgICAgIFtzY3JlZW5Qb3NpdGlvbi5yb3csIHRoaXMuX2VkaXRvci5saW5lVGV4dEZvclNjcmVlblJvdyhzY3JlZW5Qb3NpdGlvbi5yb3cpLmxlbmd0aF0sXG4gICAgICAgIC8vIFRPRE86IGhpZ2hsaWdodCB0aGUgZnVsbCBsaW5lIHdoZW4gdGhlIG1hcHBpbmcgYmV0d2VlbiBidWZmZXIgbGluZXMgdG8gc2NyZWVuIGxpbmUgaXNcbiAgICAgICAgLy8gICBpbXBsZW1lbnRlZC5cbiAgICAgICAgLy8ge3Jvdzogc2NyZWVuUG9zaXRpb24ucm93ICsgMSwgY29sdW1uOiAwfVxuICAgICk7XG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtTY3JlZW5SYW5nZShyYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBgZGlmZi12aWV3LSR7dHlwZX1gfSk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIHNldE9mZnNldHMobGluZU9mZnNldHM6IE9mZnNldE1hcCk6IHZvaWQge1xuICAgIHRoaXMuX2xpbmVPZmZzZXRzID0gbGluZU9mZnNldHM7XG4gICAgLy8gV2hlbiB0aGUgZGlmZiB2aWV3IGlzIGVkaXRhYmxlOiB1cG9uIGVkaXRzIGluIHRoZSBuZXcgZWRpdG9yLCB0aGUgb2xkIGVkaXRvciBuZWVkcyB0byB1cGRhdGVcbiAgICAvLyBpdHMgcmVuZGVyaW5nIHN0YXRlIHRvIHNob3cgdGhlIG9mZnNldCB3cmFwcGVkIGxpbmVzLlxuICAgIC8vIFRoaXMgaXNuJ3QgYSBwdWJsaWMgQVBJLCBidXQgY2FtZSBmcm9tIGEgZGlzY3Vzc2lvbiBvbiB0aGUgQXRvbSBwdWJsaWMgY2hhbm5lbC5cbiAgICB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci51cGRhdGVBbGxTY3JlZW5MaW5lcygpO1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuX2VkaXRvckVsZW1lbnQuY29tcG9uZW50IHx8IHt9O1xuICAgIGNvbnN0IHtwcmVzZW50ZXJ9ID0gY29tcG9uZW50O1xuICAgIGlmICghcHJlc2VudGVyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ05vIHRleHQgZWRpdG9yIHByZXNlbnRlciBpcyB3aXJlZCB1cCB0byB0aGUgRGlmZiBWaWV3IHRleHQgZWRpdG9yIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByZXNlbnRlci51cGRhdGVTdGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQXRvbSB1bnRpbCB2MS4wLjE4IGhhcyB1cGRhdGVTdGF0ZSB0byBmb3JjZSByZS1yZW5kZXJpbmcgb2YgZWRpdG9yIHN0YXRlLlxuICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gcmVxdWVzdCBhIGZ1bGwgcmUtcmVuZGVyIGZyb20gdGhlIGVkaXRvci5cbiAgICAgIHByZXNlbnRlci51cGRhdGVTdGF0ZSgpO1xuICAgIH1cbiAgICAvLyBBdG9tIG1hc3RlciBhZnRlciB2MS4wLjE4IGhhcyB3aWxsIGtub3cgd2hlbiBpdCBoYXMgY2hhbmdlZCBsaW5lcyBvciBkZWNvcmF0aW9ucyxcbiAgICAvLyBhbmQgd2lsbCBhdXRvLXVwZGF0ZS5cbiAgfVxuXG4gIF9idWlsZFNjcmVlbkxpbmVzV2l0aE9mZnNldHMoXG4gICAgc3RhcnRCdWZmZXJSb3c6IG51bWJlcixcbiAgICBlbmRCdWZmZXJSb3c6IG51bWJlclxuICApOiBMaW5lUmFuZ2VzV2l0aE9mZnNldHMge1xuICAgIC8vIEhBQ0shIEVuYWJsaW5nIGBzb2Z0V3JhcHBlZGAgbGluZXMgd291bGQgZ3JlYXRseSBjb21wbGljYXRlIHRoZSBvZmZzZXQgc2NyZWVuIGxpbmUgbWFwcGluZ1xuICAgIC8vIG5lZWRlZCB0byByZW5kZXIgdGhlIG9mZnNldCBsaW5lcyBmb3IgdGhlIERpZmYgVmlldy5cbiAgICAvLyBIZW5jZSwgd2UgbmVlZCB0byBkaXNhYmxlIHRoZSBvcmlnaW5hbCBzY3JlZW4gbGluZSBmcm9tIHJldHVybmluZyBzb2Z0LXdyYXBwZWQgbGluZXMuXG4gICAgY29uc3Qge2Rpc3BsYXlCdWZmZXJ9ID0gdGhpcy5fZWRpdG9yO1xuICAgIGRpc3BsYXlCdWZmZXIuc29mdFdyYXBwZWQgPSBmYWxzZTtcbiAgICBjb25zdCB7cmVnaW9ucywgc2NyZWVuTGluZXN9ID0gdGhpcy5fb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzLmFwcGx5KGRpc3BsYXlCdWZmZXIsIGFyZ3VtZW50cyk7XG4gICAgZGlzcGxheUJ1ZmZlci5zb2Z0V3JhcHBlZCA9IHRydWU7XG4gICAgaWYgKHRoaXMuX2xpbmVPZmZzZXRzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB7cmVnaW9ucywgc2NyZWVuTGluZXN9O1xuICAgIH1cblxuICAgIHJldHVybiBidWlsZExpbmVSYW5nZXNXaXRoT2Zmc2V0cyhzY3JlZW5MaW5lcywgdGhpcy5fbGluZU9mZnNldHMsIHN0YXJ0QnVmZmVyUm93LCBlbmRCdWZmZXJSb3csXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBzY3JlZW5MaW5lc1swXS5jb3B5KCk7XG4gICAgICAgIGNvcHkudG9rZW4gPSBbXTtcbiAgICAgICAgY29weS50ZXh0ID0gJyc7XG4gICAgICAgIGNvcHkudGFncyA9IFtdO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX3Njcm9sbFRvUm93KHJvdzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW3JvdywgMF0pO1xuICB9XG59XG4iXX0=