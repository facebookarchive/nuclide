Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var VALID_NUX_POSITIONS = new Set(['top', 'bottom', 'left', 'right', 'auto']);
// The maximum number of times the NuxView will attempt to attach to the DOM
var ATTACHMENT_ATTEMPT_THRESHOLD = 5;
var DISPLAY_PREDICATE_ATTEMPT_THRESHOLD = 4;
var ATTACHMENT_RETRY_TIMEOUT = 500; // milliseconds
var DISPLAY_RETRY_TIMEOUT = 500; // milliseconds
var RESIZE_EVENT_DEBOUNCE_DURATION = 100; // milliseconds

function validatePlacement(position) {
  return VALID_NUX_POSITIONS.has(position);
}

var NuxView = (function () {

  /**
   * Constructor for the NuxView.
   *
   * @param {?string} selectorString - The query selector to use to find an element
    on the DOM to attach to. If null, will use `selectorFunction` instead.
   * @param {?Function} selectorFunction - The function to execute to query an item
    on the DOM to attach to. If this is null, will use `selectorString` inside
    a call to `document.querySelector`.
   * @param {string} position - The position relative to the DOM element that the
    NUX should show.
   * @param {string} content - The content to show in the NUX.
   * @param {boolean} customContent - True iff `content` is a valid HTML String.
   * @param {?(() => boolean)} displayPredicate - Will be used when display the NUX.
   * The NUX will only show if this predicate returns true. If null, the predicate used
   * will always true.
   * @param {?(() => boolean)} completePredicate - Will be used when determining whether
   * the NUX has been completed/viewed. The NUX will only be completed if this returns true.
   * If null, the predicate used will always return true.
   *
   * @throws Errors if both `selectorString` and `selectorFunction` are null.
   */

  function NuxView(selectorString, selectorFunction, position, content) {
    var customContent = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
    var displayPredicate = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
    var completePredicate = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];

    _classCallCheck(this, NuxView);

    if (selectorFunction != null) {
      this._selector = selectorFunction;
    } else if (selectorString != null) {
      //$FlowIgnore - selectorString complains even with the explicit check above.
      this._selector = function () {
        return document.querySelector(selectorString);
      };
    } else {
      throw new Error('Either the selector or selectorFunction must be non-null!');
    }
    this._content = content;
    this._position = validatePlacement(position) ? position : 'auto';
    this._customContent = customContent;
    this._displayPredicate = displayPredicate || function () {
      return true;
    };
    this._completePredicate = completePredicate || function () {
      return true;
    };

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(NuxView, [{
    key: '_createNux',
    value: function _createNux() {
      var _this = this;

      var creationAttempt = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
      var displayAttempt = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      if (creationAttempt > ATTACHMENT_ATTEMPT_THRESHOLD) {
        this._onNuxComplete(false);
        throw new Error('The NuxView failed to succesfully query and attach to the DOM.');
      }
      var elem = this._selector();
      if (elem == null) {
        var _ret = (function () {
          var attachmentTimeout = setTimeout(_this._createNux.bind(_this, creationAttempt + 1), ATTACHMENT_RETRY_TIMEOUT);
          _this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
            if (attachmentTimeout !== null) {
              clearTimeout(attachmentTimeout);
            }
          }));
          return {
            v: undefined
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }

      // If the predicate fails, retry a few times to make sure that it actually failed this nux.
      if (!this._displayPredicate()) {
        if (displayAttempt < DISPLAY_PREDICATE_ATTEMPT_THRESHOLD) {
          var _ret2 = (function () {
            var displayTimeout = setTimeout(_this._createNux.bind(_this, creationAttempt, displayAttempt + 1), DISPLAY_RETRY_TIMEOUT);
            _this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
              if (displayTimeout !== null) {
                clearTimeout(displayTimeout);
              }
            }));
            return {
              v: undefined
            };
          })();

          if (typeof _ret2 === 'object') return _ret2.v;
        }
        throw new Error('NuxView failed to display. Display predicate was consistently false.');
      }

      this._tooltipDiv = document.createElement('div');
      this._tooltipDiv.className = 'nuclide-nux-tooltip-helper';
      elem.classList.add('nuclide-nux-tooltip-helper-parent');
      elem.appendChild(this._tooltipDiv);

      this._createDisposableTooltip();

      var debouncedWindowResizeListener = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(this._handleWindowResize.bind(this), RESIZE_EVENT_DEBOUNCE_DURATION, false);
      window.addEventListener('resize', debouncedWindowResizeListener);

      var tooltip = document.querySelector('.nuclide-nux-tooltip');
      var boundClickListener = this._handleDisposableClick.bind(this, this._tooltipDisposable, elem);
      elem.addEventListener('click', boundClickListener);
      tooltip.addEventListener('click', boundClickListener);
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        elem.removeEventListener('click', boundClickListener);
        tooltip.removeEventListener('click', boundClickListener);
        window.removeEventListener('resize', debouncedWindowResizeListener);
      }));
    }
  }, {
    key: '_handleWindowResize',
    value: function _handleWindowResize() {
      this._tooltipDisposable.dispose();
      this._createDisposableTooltip();
    }
  }, {
    key: '_createDisposableTooltip',
    value: function _createDisposableTooltip() {
      this._tooltipDisposable = atom.tooltips.add(this._tooltipDiv, {
        title: this._content,
        trigger: 'manual',
        placement: this._position,
        html: this._customContent,
        template: '<div class="tooltip nuclide-nux-tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>'
      });
      this._disposables.add(this._tooltipDisposable);
    }
  }, {
    key: '_handleDisposableClick',
    value: function _handleDisposableClick(disposable, addedElement) {
      // Only consider the NUX as complete if the completion condition has been met.
      if (!this._completePredicate()) {
        return;
      }

      // Cleanup changes made to the DOM
      addedElement.classList.remove('nuclide-nux-tooltip-helper-parent');
      disposable.dispose();
      this._tooltipDiv.remove();

      this._onNuxComplete(true);
    }
  }, {
    key: 'showNux',
    value: function showNux() {
      this._createNux();
    }
  }, {
    key: 'setNuxCompleteCallback',
    value: function setNuxCompleteCallback(callback) {
      this._callback = callback;
    }
  }, {
    key: '_onNuxComplete',
    value: function _onNuxComplete(success) {
      if (this._callback) {
        this._callback();
        // avoid the callback being invoked again
        this._callback = null;
      }
      this.dispose();
      return success;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return NuxView;
})();

exports.NuxView = NuxView;