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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideCommons = require('../../nuclide-commons');

var _reactForAtom = require('react-for-atom');

var _OutputTable = require('./OutputTable');

var _OutputTable2 = _interopRequireDefault(_OutputTable);

var _ConsoleHeader = require('./ConsoleHeader');

var _ConsoleHeader2 = _interopRequireDefault(_ConsoleHeader);

var _RecordView = require('./RecordView');

var _RecordView2 = _interopRequireDefault(_RecordView);

var Console = (function (_React$Component) {
  _inherits(Console, _React$Component);

  function Console(props) {
    _classCallCheck(this, Console);

    _get(Object.getPrototypeOf(Console.prototype), 'constructor', this).call(this, props);
    this._isScrolledToBottom = true;
    this._userIsScrolling = false;
    this._handleScrollPane = this._handleScrollPane.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._handleScrollEnd = (0, _nuclideCommons.debounce)(this._handleScrollEnd, 100);
  }

  _createClass(Console, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.props.records.length === 0) {
        this._isScrolledToBottom = true;
      }

      // If records are added while we're scrolled to the bottom (or very very close, at least),
      // automatically scroll.
      if (this.props.records.length !== prevProps.records.length) {
        this._autoscroll();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-output' },
        _reactForAtom.React.createElement(_ConsoleHeader2['default'], { clear: this.props.clearRecords }),
        _reactForAtom.React.createElement(
          'div',
          {
            ref: this._handleScrollPane,
            className: 'nuclide-output-scroll-pane',
            onScroll: this._handleScroll },
          _reactForAtom.React.createElement(_OutputTable2['default'], { records: this.props.records })
        )
      );
    }
  }, {
    key: '_handleScroll',
    value: function _handleScroll(event) {
      this._userIsScrolling = true;
      this._handleScrollEnd();
    }
  }, {
    key: '_handleScrollEnd',
    value: function _handleScrollEnd() {
      this._userIsScrolling = false;

      if (!this._scrollPane) {
        return;
      }

      var _scrollPane = this._scrollPane;
      var scrollTop = _scrollPane.scrollTop;
      var scrollHeight = _scrollPane.scrollHeight;
      var offsetHeight = _scrollPane.offsetHeight;

      this._isScrolledToBottom = scrollHeight - (offsetHeight + scrollTop) < 5;
    }
  }, {
    key: '_handleScrollPane',
    value: function _handleScrollPane(el) {
      this._scrollPane = el;
      this._autoscroll();
    }
  }, {
    key: '_renderRow',
    value: function _renderRow(record, index) {
      return _reactForAtom.React.createElement(_RecordView2['default'], { key: index, record: record });
    }

    /**
     * Scroll to the bottom of the list if autoscroll is active.
     */
  }, {
    key: '_autoscroll',
    value: function _autoscroll() {
      if (!this._scrollPane || this._userIsScrolling || !this._isScrolledToBottom) {
        return;
      }
      this._scrollPane.scrollTop = this._scrollPane.scrollHeight;
    }
  }]);

  return Console;
})(_reactForAtom.React.Component);

exports['default'] = Console;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFtQixFQUFFO0FBQzNFLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDO0tBQzVEOzs7U0EzRWtCLE9BQU87R0FBUyxvQkFBTSxTQUFTOztxQkFBL0IsT0FBTyIsImZpbGUiOiJDb25zb2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JlY29yZH0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgT3V0cHV0VGFibGUgZnJvbSAnLi9PdXRwdXRUYWJsZSc7XG5pbXBvcnQgQ29uc29sZUhlYWRlciBmcm9tICcuL0NvbnNvbGVIZWFkZXInO1xuaW1wb3J0IFJlY29yZFZpZXcgZnJvbSAnLi9SZWNvcmRWaWV3JztcblxudHlwZSBQcm9wcyA9IHtcbiAgcmVjb3JkczogQXJyYXk8UmVjb3JkPjtcbiAgY2xlYXJSZWNvcmRzOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uc29sZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBfaXNTY3JvbGxlZFRvQm90dG9tOiBib29sZWFuO1xuICBfc2Nyb2xsUGFuZTogP0hUTUxFbGVtZW50O1xuICBfdXNlcklzU2Nyb2xsaW5nOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9pc1Njcm9sbGVkVG9Cb3R0b20gPSB0cnVlO1xuICAgIHRoaXMuX3VzZXJJc1Njcm9sbGluZyA9IGZhbHNlO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVTY3JvbGxQYW5lID0gdGhpcy5faGFuZGxlU2Nyb2xsUGFuZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVTY3JvbGwgPSB0aGlzLl9oYW5kbGVTY3JvbGwuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlU2Nyb2xsRW5kID0gZGVib3VuY2UodGhpcy5faGFuZGxlU2Nyb2xsRW5kLCAxMDApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wcm9wcy5yZWNvcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5faXNTY3JvbGxlZFRvQm90dG9tID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBJZiByZWNvcmRzIGFyZSBhZGRlZCB3aGlsZSB3ZSdyZSBzY3JvbGxlZCB0byB0aGUgYm90dG9tIChvciB2ZXJ5IHZlcnkgY2xvc2UsIGF0IGxlYXN0KSxcbiAgICAvLyBhdXRvbWF0aWNhbGx5IHNjcm9sbC5cbiAgICBpZiAodGhpcy5wcm9wcy5yZWNvcmRzLmxlbmd0aCAhPT0gcHJldlByb3BzLnJlY29yZHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9hdXRvc2Nyb2xsKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtb3V0cHV0XCI+XG4gICAgICAgIDxDb25zb2xlSGVhZGVyIGNsZWFyPXt0aGlzLnByb3BzLmNsZWFyUmVjb3Jkc30gLz5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17dGhpcy5faGFuZGxlU2Nyb2xsUGFuZX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLW91dHB1dC1zY3JvbGwtcGFuZVwiXG4gICAgICAgICAgb25TY3JvbGw9e3RoaXMuX2hhbmRsZVNjcm9sbH0+XG4gICAgICAgICAgPE91dHB1dFRhYmxlIHJlY29yZHM9e3RoaXMucHJvcHMucmVjb3Jkc30gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVNjcm9sbChldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX3VzZXJJc1Njcm9sbGluZyA9IHRydWU7XG4gICAgdGhpcy5faGFuZGxlU2Nyb2xsRW5kKCk7XG4gIH1cblxuICBfaGFuZGxlU2Nyb2xsRW5kKCk6IHZvaWQge1xuICAgIHRoaXMuX3VzZXJJc1Njcm9sbGluZyA9IGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLl9zY3JvbGxQYW5lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3Njcm9sbFRvcCwgc2Nyb2xsSGVpZ2h0LCBvZmZzZXRIZWlnaHR9ID0gdGhpcy5fc2Nyb2xsUGFuZTtcbiAgICB0aGlzLl9pc1Njcm9sbGVkVG9Cb3R0b20gPSBzY3JvbGxIZWlnaHQgLSAob2Zmc2V0SGVpZ2h0ICsgc2Nyb2xsVG9wKSA8IDU7XG4gIH1cblxuICBfaGFuZGxlU2Nyb2xsUGFuZShlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9zY3JvbGxQYW5lID0gZWw7XG4gICAgdGhpcy5fYXV0b3Njcm9sbCgpO1xuICB9XG5cbiAgX3JlbmRlclJvdyhyZWNvcmQ6IFJlY29yZCwgaW5kZXg6IG51bWJlcik6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIDxSZWNvcmRWaWV3IGtleT17aW5kZXh9IHJlY29yZD17cmVjb3JkfSAvPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgbGlzdCBpZiBhdXRvc2Nyb2xsIGlzIGFjdGl2ZS5cbiAgICovXG4gIF9hdXRvc2Nyb2xsKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fc2Nyb2xsUGFuZSB8fCB0aGlzLl91c2VySXNTY3JvbGxpbmcgfHwgIXRoaXMuX2lzU2Nyb2xsZWRUb0JvdHRvbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zY3JvbGxQYW5lLnNjcm9sbFRvcCA9IHRoaXMuX3Njcm9sbFBhbmUuc2Nyb2xsSGVpZ2h0O1xuICB9XG5cbn1cbiJdfQ==