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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

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
        _reactForAtom.ReactDOM.render(node, container);
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
      var range = new _atom.Range([lineNumber, 0], [lineNumber + 1, 0]);
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
        var marker = this._editor.markBufferPosition([lineNumber, 0], { invalidate: 'never' });
        this._editor.decorateMarker(marker, { type: 'block', item: blockItem, position: 'before' });
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

exports['default'] = DiffViewEditor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3RWRpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFjb0IsTUFBTTs7NEJBQ0gsZ0JBQWdCOzs7Ozs7O0lBTWxCLGNBQWM7QUFPdEIsV0FQUSxjQUFjLENBT3JCLGFBQXFDLEVBQUU7MEJBUGhDLGNBQWM7O0FBUS9CLFFBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO0FBQ3BDLFFBQUksQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3hDLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDNUIsUUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDekIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztHQUM5Qjs7ZUFia0IsY0FBYzs7V0FlcEIsdUJBQUMsUUFBMEIsRUFBUTs7O0FBQzlDLFdBQUssSUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQzVDLGNBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNsQjtBQUNELFVBQUksQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTyxFQUFJO1lBQ3pDLElBQUksR0FBZSxPQUFPLENBQTFCLElBQUk7WUFBRSxTQUFTLEdBQUksT0FBTyxDQUFwQixTQUFTOzs7QUFFdEIsY0FBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNoQyxxQkFBVyxFQUFFLE1BQUssWUFBWSxDQUFDLElBQUksT0FBTTtTQUMxQyxDQUFDLENBQUM7QUFDSCxZQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hELCtCQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7OztBQUdqQyxZQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RCxZQUFNLE1BQU0sR0FBRyxNQUFLLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLEVBQUMsVUFBVSxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7QUFDMUUsY0FBSyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUNsQyxjQUFJLEVBQUUsT0FBTztBQUNiLGNBQUksRUFBRSxTQUFTO0FBQ2Ysa0JBQVEsRUFBRSxPQUFPO1NBQ2xCLENBQUMsQ0FBQztBQUNILGVBQU8sTUFBTSxDQUFDO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVpQiw0QkFBQyxVQUFrQixFQUFRO0FBQzNDLFVBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCOztBQUVqQyxPQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFDZixFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FDZixDQUFDO0tBQ0g7OztXQUVjLHlCQUFDLFFBQWdCLEVBQUUsUUFBZ0IsRUFBUTs7QUFFeEQsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN4QyxVQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUU7QUFDakMsY0FBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNqQztBQUNELFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRSxVQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNsQzs7O1dBRU8sb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3JCOzs7V0FFTSxtQkFBVztBQUNoQixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7Ozs7Ozs7O1dBTWtCLCtCQUFtRTs7O1VBQWxFLFVBQXlCLHlEQUFHLEVBQUU7VUFBRSxZQUEyQix5REFBRyxFQUFFOztBQUNsRixXQUFLLElBQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMzQyxjQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDbEI7QUFDRCxVQUFJLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FDckMsVUFBQSxVQUFVO2VBQUksT0FBSyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO09BQUEsQ0FDM0QsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FDdkIsVUFBQSxVQUFVO2VBQUksT0FBSyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO09BQUEsQ0FDM0QsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7OztXQU9nQiwyQkFBQyxVQUFrQixFQUFFLElBQVksRUFBZTtBQUMvRCxVQUFNLEtBQUssR0FBRyxnQkFDWixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFDZixDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3BCLENBQUM7QUFDRixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsRUFBQyxVQUFVLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztBQUMxRSxVQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLHdCQUFvQixJQUFJLEFBQUUsRUFBQyxDQUFDLENBQUM7QUFDckYsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1dBRVMsb0JBQUMsV0FBc0IsRUFBUTtBQUN2QyxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUN4RCx3QkFBd0MsV0FBVyxFQUFFOzs7WUFBekMsVUFBVTtZQUFFLFdBQVc7O0FBQ2pDLFlBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEQsaUJBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEFBQUMsV0FBVyxHQUFHLFVBQVUsR0FBSSxJQUFJLENBQUM7QUFDOUQsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQ3ZGLFlBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUN6QixNQUFNLEVBQ04sRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUNyRCxDQUFDO0FBQ0YsWUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDbEM7S0FDRjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtlQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDM0QsVUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUM1QixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO2VBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUM1RCxVQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEI7OztXQUVXLHNCQUFDLEdBQVcsRUFBUTtBQUM5QixVQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUNqQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFDUixFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FDZixDQUFDO0tBQ0g7OztTQS9Ia0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiRGlmZlZpZXdFZGl0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2Zmc2V0TWFwfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtVSUVsZW1lbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtZGlmZi11aS1wcm92aWRlci1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbi8qKlxuICogVGhlIERpZmZWaWV3RWRpdG9yIG1hbmFnZXMgdGhlIGxpZmVjeWNsZSBvZiB0aGUgdHdvIGVkaXRvcnMgdXNlZCBpbiB0aGUgZGlmZiB2aWV3LFxuICogYW5kIGNvbnRyb2xzIGl0cyByZW5kZXJpbmcgb2YgaGlnaGxpZ2h0cyBhbmQgb2Zmc2V0cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdFZGl0b3Ige1xuICBfZWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7O1xuICBfZWRpdG9yRWxlbWVudDogYXRvbSRUZXh0RWRpdG9yRWxlbWVudDtcbiAgX2hpZ2hsaWdodE1hcmtlcnM6IEFycmF5PGF0b20kTWFya2VyPjtcbiAgX29mZnNldE1hcmtlcnM6IEFycmF5PGF0b20kTWFya2VyPjtcbiAgX3VpRWxlbWVudHNNYXJrZXJzOiBBcnJheTxhdG9tJE1hcmtlcj47XG5cbiAgY29uc3RydWN0b3IoZWRpdG9yRWxlbWVudDogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCkge1xuICAgIHRoaXMuX2VkaXRvckVsZW1lbnQgPSBlZGl0b3JFbGVtZW50O1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKTtcbiAgICB0aGlzLl9oaWdobGlnaHRNYXJrZXJzID0gW107XG4gICAgdGhpcy5fb2Zmc2V0TWFya2VycyA9IFtdO1xuICAgIHRoaXMuX3VpRWxlbWVudHNNYXJrZXJzID0gW107XG4gIH1cblxuICBzZXRVSUVsZW1lbnRzKGVsZW1lbnRzOiBBcnJheTxVSUVsZW1lbnQ+KTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBtYXJrZXIgb2YgdGhpcy5fdWlFbGVtZW50c01hcmtlcnMpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX3VpRWxlbWVudHNNYXJrZXJzID0gZWxlbWVudHMubWFwKGVsZW1lbnQgPT4ge1xuICAgICAgY29uc3Qge25vZGUsIGJ1ZmZlclJvd30gPSBlbGVtZW50O1xuICAgICAgLy8gVE9ETyhtb3N0KTogT01HLCB0aGlzIG11dGF0ZXMgUmVhY3QgcHJvcHMgZm9yIHRoZSBjcmVhdGVkIGNvbXBvbmVudCEhXG4gICAgICBPYmplY3QuYXNzaWduKG5vZGUucHJvcHMuaGVscGVycywge1xuICAgICAgICBzY3JvbGxUb1JvdzogdGhpcy5fc2Nyb2xsVG9Sb3cuYmluZCh0aGlzKSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBSZWFjdERPTS5yZW5kZXIobm9kZSwgY29udGFpbmVyKTtcbiAgICAgIC8vIGFuIG92ZXJsYXkgbWFya2VyIGF0IGEgYnVmZmVyIHJhbmdlIHdpdGggcm93IHggcmVuZGVycyB1bmRlciByb3cgeCArIDFcbiAgICAgIC8vIHNvLCB1c2UgcmFuZ2UgYXQgYnVmZmVyUm93IC0gMSB0byBhY3R1YWxseSBkaXNwbGF5IGF0IGJ1ZmZlclJvd1xuICAgICAgY29uc3QgcmFuZ2UgPSBbW2J1ZmZlclJvdyAtIDEsIDBdLCBbYnVmZmVyUm93IC0gMSwgMF1dO1xuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrJyxcbiAgICAgICAgaXRlbTogY29udGFpbmVyLFxuICAgICAgICBwb3NpdGlvbjogJ2FmdGVyJyxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1hcmtlcjtcbiAgICB9KTtcbiAgfVxuXG4gIHNjcm9sbFRvU2NyZWVuTGluZShzY3JlZW5MaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3Iuc2Nyb2xsVG9TY3JlZW5Qb3NpdGlvbihcbiAgICAgIC8vIE1hcmtlcnMgYXJlIG9yZGVyZWQgaW4gYXNjZW5kaW5nIG9yZGVyIGJ5IGxpbmUgbnVtYmVyLlxuICAgICAgW3NjcmVlbkxpbmUsIDBdLFxuICAgICAge2NlbnRlcjogdHJ1ZX0sXG4gICAgKTtcbiAgfVxuXG4gIHNldEZpbGVDb250ZW50cyhmaWxlUGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gVGhlIHRleHQgaXMgc2V0IHZpYSBkaWZmcyB0byBrZWVwIHRoZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgY29uc3QgYnVmZmVyID0gdGhpcy5fZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGlmIChidWZmZXIuZ2V0VGV4dCgpICE9PSBjb250ZW50cykge1xuICAgICAgYnVmZmVyLnNldFRleHRWaWFEaWZmKGNvbnRlbnRzKTtcbiAgICB9XG4gICAgY29uc3QgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuc2VsZWN0R3JhbW1hcihmaWxlUGF0aCwgY29udGVudHMpO1xuICAgIHRoaXMuX2VkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpO1xuICB9XG5cbiAgZ2V0TW9kZWwoKTogT2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yO1xuICB9XG5cbiAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lZGl0b3IuZ2V0VGV4dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhZGRlZExpbmVzIEFuIGFycmF5IG9mIGJ1ZmZlciBsaW5lIG51bWJlcnMgdGhhdCBzaG91bGQgYmUgaGlnaGxpZ2h0ZWQgYXMgYWRkZWQuXG4gICAqIEBwYXJhbSByZW1vdmVkTGluZXMgQW4gYXJyYXkgb2YgYnVmZmVyIGxpbmUgbnVtYmVycyB0aGF0IHNob3VsZCBiZSBoaWdobGlnaHRlZCBhcyByZW1vdmVkLlxuICAgKi9cbiAgc2V0SGlnaGxpZ2h0ZWRMaW5lcyhhZGRlZExpbmVzOiBBcnJheTxudW1iZXI+ID0gW10sIHJlbW92ZWRMaW5lczogQXJyYXk8bnVtYmVyPiA9IFtdKSB7XG4gICAgZm9yIChjb25zdCBtYXJrZXIgb2YgdGhpcy5faGlnaGxpZ2h0TWFya2Vycykge1xuICAgICAgbWFya2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5faGlnaGxpZ2h0TWFya2VycyA9IGFkZGVkTGluZXMubWFwKFxuICAgICAgbGluZU51bWJlciA9PiB0aGlzLl9jcmVhdGVMaW5lTWFya2VyKGxpbmVOdW1iZXIsICdpbnNlcnQnKVxuICAgICkuY29uY2F0KHJlbW92ZWRMaW5lcy5tYXAoXG4gICAgICBsaW5lTnVtYmVyID0+IHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIobGluZU51bWJlciwgJ2RlbGV0ZScpXG4gICAgKSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgQSBidWZmZXIgbGluZSBudW1iZXIgdG8gYmUgaGlnaGxpZ2h0ZWQuXG4gICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCB0byBiZSBhcHBsaWVkIHRvIHRoZSBsaW5lLlxuICAqICAgIENvdWxkIGJlIGEgdmFsdWUgb2Y6IFsnaW5zZXJ0JywgJ2RlbGV0ZSddLlxuICAgKi9cbiAgX2NyZWF0ZUxpbmVNYXJrZXIobGluZU51bWJlcjogbnVtYmVyLCB0eXBlOiBzdHJpbmcpOiBhdG9tJE1hcmtlciB7XG4gICAgY29uc3QgcmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICBbbGluZU51bWJlciwgMF0sXG4gICAgICBbbGluZU51bWJlciArIDEsIDBdLFxuICAgICk7XG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBgZGlmZi12aWV3LSR7dHlwZX1gfSk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIHNldE9mZnNldHMobGluZU9mZnNldHM6IE9mZnNldE1hcCk6IHZvaWQge1xuICAgIHRoaXMuX29mZnNldE1hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4gbWFya2VyLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5fb2Zmc2V0TWFya2VycyA9IFtdO1xuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB0aGlzLl9lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCk7XG4gICAgZm9yIChjb25zdCBbbGluZU51bWJlciwgb2Zmc2V0TGluZXNdIG9mIGxpbmVPZmZzZXRzKSB7XG4gICAgICBjb25zdCBibG9ja0l0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGJsb2NrSXRlbS5zdHlsZS5taW5IZWlnaHQgPSAob2Zmc2V0TGluZXMgKiBsaW5lSGVpZ2h0KSArICdweCc7XG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKFtsaW5lTnVtYmVyLCAwXSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihcbiAgICAgICAgbWFya2VyLFxuICAgICAgICB7dHlwZTogJ2Jsb2NrJywgaXRlbTogYmxvY2tJdGVtLCBwb3NpdGlvbjogJ2JlZm9yZSd9LFxuICAgICAgKTtcbiAgICAgIHRoaXMuX29mZnNldE1hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5faGlnaGxpZ2h0TWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiBtYXJrZXIuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9oaWdobGlnaHRNYXJrZXJzID0gW107XG4gICAgdGhpcy5fb2Zmc2V0TWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiBtYXJrZXIuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9vZmZzZXRNYXJrZXJzID0gW107XG4gICAgdGhpcy5fdWlFbGVtZW50c01hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4gbWFya2VyLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5fdWlFbGVtZW50c01hcmtlcnMgPSBbXTtcbiAgICB0aGlzLl9lZGl0b3IuZGVzdHJveSgpO1xuICB9XG5cbiAgX3Njcm9sbFRvUm93KHJvdzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oXG4gICAgICBbcm93LCAwXSxcbiAgICAgIHtjZW50ZXI6IHRydWV9LFxuICAgICk7XG4gIH1cbn1cbiJdfQ==