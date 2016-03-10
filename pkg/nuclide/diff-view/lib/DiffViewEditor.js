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
    value: function setFileContents(filePath, contents, clearHistory) {
      // The text is set via diffs to keep the cursor position.
      var buffer = this._editor.getBuffer();
      if (clearHistory) {
        // Mark the buffer as loaded, so `isModified` will work accurately.
        buffer.loaded = true;
        // `reload` will use the `cachedDiskContents` to set the text and clear the undo history.
        buffer.reload(true);
      } else {
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
//# sourceMappingURL=data:application/json;base64,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LFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDakMsVUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDaEMsZUFBTyxFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUUsV0FBVyxFQUFYLFdBQVcsRUFBQyxDQUFDO09BQy9COztBQUVELGFBQU8sNkNBQTJCLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQzVGLFlBQU07QUFDSixZQUFNLElBQUksR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkMsWUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsWUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZixZQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNmLGVBQU8sSUFBSSxDQUFDO09BQ2IsQ0FDRixDQUFDO0tBQ0g7OztXQUVXLHNCQUFDLEdBQVcsRUFBUTtBQUM5QixVQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDL0M7OztTQTlMa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiRGlmZlZpZXdFZGl0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SW5saW5lQ29tcG9uZW50LCBSZW5kZXJlZENvbXBvbmVudCwgTGluZVJhbmdlc1dpdGhPZmZzZXRzLCBPZmZzZXRNYXB9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7YnVpbGRMaW5lUmFuZ2VzV2l0aE9mZnNldHN9IGZyb20gJy4vZWRpdG9yLXV0aWxzJztcbmltcG9ydCB7UmVhY3RET019IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8qKlxuICogVGhlIERpZmZWaWV3RWRpdG9yIG1hbmFnZXMgdGhlIGxpZmVjeWNsZSBvZiB0aGUgdHdvIGVkaXRvcnMgdXNlZCBpbiB0aGUgZGlmZiB2aWV3LFxuICogYW5kIGNvbnRyb2xzIGl0cyByZW5kZXJpbmcgb2YgaGlnaGxpZ2h0cyBhbmQgb2Zmc2V0cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdFZGl0b3Ige1xuICBfZWRpdG9yOiBPYmplY3Q7XG4gIF9lZGl0b3JFbGVtZW50OiBPYmplY3Q7XG4gIF9tYXJrZXJzOiBBcnJheTxhdG9tJE1hcmtlcj47XG4gIF9saW5lT2Zmc2V0czogT2Zmc2V0TWFwO1xuICBfb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzOiAoc3RhcnRCdWZmZXJSb3c6IG51bWJlciwgZW5kQnVmZmVyUm93OiBudW1iZXIpID0+IG1peGVkO1xuXG4gIGNvbnN0cnVjdG9yKGVkaXRvckVsZW1lbnQ6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQpIHtcbiAgICB0aGlzLl9lZGl0b3JFbGVtZW50ID0gZWRpdG9yRWxlbWVudDtcbiAgICB0aGlzLl9lZGl0b3IgPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCk7XG5cbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgdGhpcy5fbGluZU9mZnNldHMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBVZ2x5IEhhY2sgdG8gdGhlIGRpc3BsYXkgYnVmZmVyIHRvIGFsbG93IGZha2Ugc29mdCB3cmFwcGVkIGxpbmVzLFxuICAgIC8vIHRvIGNyZWF0ZSB0aGUgbm9uLW51bWJlcmVkIGVtcHR5IHNwYWNlIG5lZWRlZCBiZXR3ZWVuIHJlYWwgdGV4dCBidWZmZXIgbGluZXMuXG4gICAgLy8gJEZsb3dGaXhNZSB1c2Ugb2Ygbm9uLW9mZmljaWFsIEFQSS5cbiAgICB0aGlzLl9vcmlnaW5hbEJ1aWxkU2NyZWVuTGluZXMgPSB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci5idWlsZFNjcmVlbkxpbmVzO1xuICAgIC8vICRGbG93Rml4TWUgdXNlIG9mIG5vbi1vZmZpY2lhbCBBUEkuXG4gICAgdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuY2hlY2tTY3JlZW5MaW5lc0ludmFyaWFudCA9ICgpID0+IHt9O1xuICAgIC8vICRGbG93Rml4TWUgdXNlIG9mIG5vbi1vZmZpY2lhbCBBUEkuXG4gICAgdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuYnVpbGRTY3JlZW5MaW5lcyA9XG4gICAgICAoLi4uYXJncykgPT4gdGhpcy5fYnVpbGRTY3JlZW5MaW5lc1dpdGhPZmZzZXRzLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXG4gICAgLy8gVGhlcmUgaXMgbm8gZWRpdG9yIEFQSSB0byBjYW5jZWwgZm9sZGFiaWxpdHksIGJ1dCBkZWVwIGluc2lkZSB0aGUgbGluZSBzdGF0ZSBjcmVhdGlvbixcbiAgICAvLyBpdCB1c2VzIHRob3NlIGZ1bmN0aW9ucyB0byBkZXRlcm1pbmUgaWYgYSBsaW5lIGlzIGZvbGRhYmxlIG9yIG5vdC5cbiAgICAvLyBGb3IgRGlmZiBWaWV3LCBmb2xkaW5nIGJyZWFrcyBvZmZzZXRzLCBoZW5jZSB3ZSBuZWVkIHRvIG1ha2UgaXQgdW5mb2xkYWJsZS5cbiAgICAvLyAkRmxvd0ZpeE1lIHVzZSBvZiBub24tb2ZmaWNpYWwgQVBJLlxuICAgIHRoaXMuX2VkaXRvci5pc0ZvbGRhYmxlQXRTY3JlZW5Sb3cgPSB0aGlzLl9lZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93ID0gcm93ID0+IGZhbHNlO1xuICB9XG5cbiAgcmVuZGVySW5saW5lQ29tcG9uZW50cyhlbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50Pik6IFByb21pc2U8QXJyYXk8UmVuZGVyZWRDb21wb25lbnQ+PiB7XG4gICAgY29uc3Qge29iamVjdH0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IFtdO1xuICAgIGNvbnN0IHJlbmRlclByb21pc2VzID0gW107XG4gICAgY29uc3Qgc2Nyb2xsVG9Sb3cgPSB0aGlzLl9zY3JvbGxUb1Jvdy5iaW5kKHRoaXMpO1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBjb25zdCB7bm9kZSwgYnVmZmVyUm93fSA9IGVsZW1lbnQ7XG4gICAgICBpZiAoIW5vZGUucHJvcHMuaGVscGVycykge1xuICAgICAgICBub2RlLnByb3BzLmhlbHBlcnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhlbHBlcnMgPSB7XG4gICAgICAgIHNjcm9sbFRvUm93LFxuICAgICAgfTtcbiAgICAgIG9iamVjdC5hc3NpZ24obm9kZS5wcm9wcy5oZWxwZXJzLCBoZWxwZXJzKTtcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgbGV0IGNvbXBvbmVudDtcbiAgICAgIGNvbnN0IGRpZFJlbmRlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgICAgY29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKG5vZGUsIGNvbnRhaW5lciwgKCkgPT4ge1xuICAgICAgICAgIHJlcygpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmVuZGVyUHJvbWlzZXMucHVzaChkaWRSZW5kZXJQcm9taXNlKTtcbiAgICAgIGNvbXBvbmVudHMucHVzaCh7XG4gICAgICAgIGJ1ZmZlclJvdyxcbiAgICAgICAgLy8gJEZsb3dGaXhNZShtb3N0KVxuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIGNvbnRhaW5lcixcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChyZW5kZXJQcm9taXNlcykudGhlbigoKSA9PiBjb21wb25lbnRzKTtcbiAgfVxuXG4gIGF0dGFjaElubGluZUNvbXBvbmVudHMoZWxlbWVudHM6IEFycmF5PFJlbmRlcmVkQ29tcG9uZW50Pik6IHZvaWQge1xuICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBjb25zdCB7YnVmZmVyUm93LCBjb250YWluZXJ9ID0gZWxlbWVudDtcbiAgICAgIC8vIGFuIG92ZXJsYXkgbWFya2VyIGF0IGEgYnVmZmVyIHJhbmdlIHdpdGggcm93IHggcmVuZGVycyB1bmRlciByb3cgeCArIDFcbiAgICAgIC8vIHNvLCB1c2UgcmFuZ2UgYXQgYnVmZmVyUm93IC0gMSB0byBhY3R1YWxseSBkaXNwbGF5IGF0IGJ1ZmZlclJvd1xuICAgICAgY29uc3QgcmFuZ2UgPSBbW2J1ZmZlclJvdyAtIDEsIDBdLCBbYnVmZmVyUm93IC0gMSwgMF1dO1xuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnb3ZlcmxheScsIGl0ZW06IGNvbnRhaW5lcn0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0TGluZUhlaWdodEluUGl4ZWxzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKTtcbiAgfVxuXG4gIHNjcm9sbFRvU2NyZWVuTGluZShzY3JlZW5MaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3Iuc2Nyb2xsVG9TY3JlZW5Qb3NpdGlvbihcbiAgICAgIC8vIE1hcmtlcnMgYXJlIG9yZGVyZWQgaW4gYXNjZW5kaW5nIG9yZGVyIGJ5IGxpbmUgbnVtYmVyLlxuICAgICAgW3NjcmVlbkxpbmUsIDBdLFxuICAgICAge2NlbnRlcjogdHJ1ZX0sXG4gICAgKTtcbiAgfVxuXG4gIHNldEZpbGVDb250ZW50cyhmaWxlUGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nLCBjbGVhckhpc3Rvcnk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAvLyBUaGUgdGV4dCBpcyBzZXQgdmlhIGRpZmZzIHRvIGtlZXAgdGhlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBjb25zdCBidWZmZXIgPSB0aGlzLl9lZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgaWYgKGNsZWFySGlzdG9yeSkge1xuICAgICAgLy8gTWFyayB0aGUgYnVmZmVyIGFzIGxvYWRlZCwgc28gYGlzTW9kaWZpZWRgIHdpbGwgd29yayBhY2N1cmF0ZWx5LlxuICAgICAgYnVmZmVyLmxvYWRlZCA9IHRydWU7XG4gICAgICAvLyBgcmVsb2FkYCB3aWxsIHVzZSB0aGUgYGNhY2hlZERpc2tDb250ZW50c2AgdG8gc2V0IHRoZSB0ZXh0IGFuZCBjbGVhciB0aGUgdW5kbyBoaXN0b3J5LlxuICAgICAgYnVmZmVyLnJlbG9hZCh0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmZmVyLnNldFRleHRWaWFEaWZmKGNvbnRlbnRzKTtcbiAgICB9XG4gICAgY29uc3QgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuc2VsZWN0R3JhbW1hcihmaWxlUGF0aCwgY29udGVudHMpO1xuICAgIHRoaXMuX2VkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpO1xuICB9XG5cbiAgZ2V0TW9kZWwoKTogT2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yO1xuICB9XG5cbiAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3IuZ2V0VGV4dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhZGRlZExpbmVzIEFuIGFycmF5IG9mIGJ1ZmZlciBsaW5lIG51bWJlcnMgdGhhdCBzaG91bGQgYmUgaGlnaGxpZ2h0ZWQgYXMgYWRkZWQuXG4gICAqIEBwYXJhbSByZW1vdmVkTGluZXMgQW4gYXJyYXkgb2YgYnVmZmVyIGxpbmUgbnVtYmVycyB0aGF0IHNob3VsZCBiZSBoaWdobGlnaHRlZCBhcyByZW1vdmVkLlxuICAgKi9cbiAgc2V0SGlnaGxpZ2h0ZWRMaW5lcyhhZGRlZExpbmVzOiBBcnJheTxudW1iZXI+ID0gW10sIHJlbW92ZWRMaW5lczogQXJyYXk8bnVtYmVyPiA9IFtdKSB7XG4gICAgZm9yIChjb25zdCBtYXJrZXIgb2YgdGhpcy5fbWFya2Vycykge1xuICAgICAgbWFya2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5fbWFya2VycyA9IGFkZGVkTGluZXMubWFwKGxpbmVOdW1iZXIgPT4gdGhpcy5fY3JlYXRlTGluZU1hcmtlcihsaW5lTnVtYmVyLCAnaW5zZXJ0JykpXG4gICAgICAgIC5jb25jYXQocmVtb3ZlZExpbmVzLm1hcChsaW5lTnVtYmVyID0+IHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIobGluZU51bWJlciwgJ2RlbGV0ZScpKSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgQSBidWZmZXIgbGluZSBudW1iZXIgdG8gYmUgaGlnaGxpZ2h0ZWQuXG4gICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCB0byBiZSBhcHBsaWVkIHRvIHRoZSBsaW5lLlxuICAqICAgIENvdWxkIGJlIGEgdmFsdWUgb2Y6IFsnaW5zZXJ0JywgJ2RlbGV0ZSddLlxuICAgKi9cbiAgX2NyZWF0ZUxpbmVNYXJrZXIobGluZU51bWJlcjogbnVtYmVyLCB0eXBlOiBzdHJpbmcpOiBhdG9tJE1hcmtlciB7XG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPVxuICAgICAgdGhpcy5fZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oe3JvdzogbGluZU51bWJlciwgY29sdW1uOiAwfSk7XG4gICAgY29uc3QgcmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgIHNjcmVlblBvc2l0aW9uLFxuICAgICAgICBbc2NyZWVuUG9zaXRpb24ucm93LCB0aGlzLl9lZGl0b3IubGluZVRleHRGb3JTY3JlZW5Sb3coc2NyZWVuUG9zaXRpb24ucm93KS5sZW5ndGhdLFxuICAgICAgICAvLyBUT0RPOiBoaWdobGlnaHQgdGhlIGZ1bGwgbGluZSB3aGVuIHRoZSBtYXBwaW5nIGJldHdlZW4gYnVmZmVyIGxpbmVzIHRvIHNjcmVlbiBsaW5lIGlzXG4gICAgICAgIC8vICAgaW1wbGVtZW50ZWQuXG4gICAgICAgIC8vIHtyb3c6IHNjcmVlblBvc2l0aW9uLnJvdyArIDEsIGNvbHVtbjogMH1cbiAgICApO1xuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuX2VkaXRvci5tYXJrU2NyZWVuUmFuZ2UocmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogYGRpZmYtdmlldy0ke3R5cGV9YH0pO1xuICAgIHJldHVybiBtYXJrZXI7XG4gIH1cblxuICBzZXRPZmZzZXRzKGxpbmVPZmZzZXRzOiBPZmZzZXRNYXApOiB2b2lkIHtcbiAgICB0aGlzLl9saW5lT2Zmc2V0cyA9IGxpbmVPZmZzZXRzO1xuICAgIC8vIFdoZW4gdGhlIGRpZmYgdmlldyBpcyBlZGl0YWJsZTogdXBvbiBlZGl0cyBpbiB0aGUgbmV3IGVkaXRvciwgdGhlIG9sZCBlZGl0b3IgbmVlZHMgdG8gdXBkYXRlXG4gICAgLy8gaXRzIHJlbmRlcmluZyBzdGF0ZSB0byBzaG93IHRoZSBvZmZzZXQgd3JhcHBlZCBsaW5lcy5cbiAgICAvLyBUaGlzIGlzbid0IGEgcHVibGljIEFQSSwgYnV0IGNhbWUgZnJvbSBhIGRpc2N1c3Npb24gb24gdGhlIEF0b20gcHVibGljIGNoYW5uZWwuXG4gICAgdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIudXBkYXRlQWxsU2NyZWVuTGluZXMoKTtcbiAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLl9lZGl0b3JFbGVtZW50LmNvbXBvbmVudCB8fCB7fTtcbiAgICBjb25zdCB7cHJlc2VudGVyfSA9IGNvbXBvbmVudDtcbiAgICBpZiAoIXByZXNlbnRlcikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdObyB0ZXh0IGVkaXRvciBwcmVzZW50ZXIgaXMgd2lyZWQgdXAgdG8gdGhlIERpZmYgVmlldyB0ZXh0IGVkaXRvciEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcmVzZW50ZXIudXBkYXRlU3RhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEF0b20gdW50aWwgdjEuMC4xOCBoYXMgdXBkYXRlU3RhdGUgdG8gZm9yY2UgcmUtcmVuZGVyaW5nIG9mIGVkaXRvciBzdGF0ZS5cbiAgICAgIC8vIFRoaXMgaXMgbmVlZGVkIHRvIHJlcXVlc3QgYSBmdWxsIHJlLXJlbmRlciBmcm9tIHRoZSBlZGl0b3IuXG4gICAgICBwcmVzZW50ZXIudXBkYXRlU3RhdGUoKTtcbiAgICB9XG4gICAgLy8gQXRvbSBtYXN0ZXIgYWZ0ZXIgdjEuMC4xOCBoYXMgd2lsbCBrbm93IHdoZW4gaXQgaGFzIGNoYW5nZWQgbGluZXMgb3IgZGVjb3JhdGlvbnMsXG4gICAgLy8gYW5kIHdpbGwgYXV0by11cGRhdGUuXG4gIH1cblxuICBfYnVpbGRTY3JlZW5MaW5lc1dpdGhPZmZzZXRzKFxuICAgIHN0YXJ0QnVmZmVyUm93OiBudW1iZXIsXG4gICAgZW5kQnVmZmVyUm93OiBudW1iZXJcbiAgKTogTGluZVJhbmdlc1dpdGhPZmZzZXRzIHtcbiAgICAvLyBIQUNLISBFbmFibGluZyBgc29mdFdyYXBwZWRgIGxpbmVzIHdvdWxkIGdyZWF0bHkgY29tcGxpY2F0ZSB0aGUgb2Zmc2V0IHNjcmVlbiBsaW5lIG1hcHBpbmdcbiAgICAvLyBuZWVkZWQgdG8gcmVuZGVyIHRoZSBvZmZzZXQgbGluZXMgZm9yIHRoZSBEaWZmIFZpZXcuXG4gICAgLy8gSGVuY2UsIHdlIG5lZWQgdG8gZGlzYWJsZSB0aGUgb3JpZ2luYWwgc2NyZWVuIGxpbmUgZnJvbSByZXR1cm5pbmcgc29mdC13cmFwcGVkIGxpbmVzLlxuICAgIGNvbnN0IHtkaXNwbGF5QnVmZmVyfSA9IHRoaXMuX2VkaXRvcjtcbiAgICBkaXNwbGF5QnVmZmVyLnNvZnRXcmFwcGVkID0gZmFsc2U7XG4gICAgY29uc3Qge3JlZ2lvbnMsIHNjcmVlbkxpbmVzfSA9IHRoaXMuX29yaWdpbmFsQnVpbGRTY3JlZW5MaW5lcy5hcHBseShkaXNwbGF5QnVmZmVyLCBhcmd1bWVudHMpO1xuICAgIGRpc3BsYXlCdWZmZXIuc29mdFdyYXBwZWQgPSB0cnVlO1xuICAgIGlmICh0aGlzLl9saW5lT2Zmc2V0cy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge3JlZ2lvbnMsIHNjcmVlbkxpbmVzfTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbGRMaW5lUmFuZ2VzV2l0aE9mZnNldHMoc2NyZWVuTGluZXMsIHRoaXMuX2xpbmVPZmZzZXRzLCBzdGFydEJ1ZmZlclJvdywgZW5kQnVmZmVyUm93LFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCBjb3B5ID0gc2NyZWVuTGluZXNbMF0uY29weSgpO1xuICAgICAgICBjb3B5LnRva2VuID0gW107XG4gICAgICAgIGNvcHkudGV4dCA9ICcnO1xuICAgICAgICBjb3B5LnRhZ3MgPSBbXTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIF9zY3JvbGxUb1Jvdyhyb3c6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtyb3csIDBdKTtcbiAgfVxufVxuIl19