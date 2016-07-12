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

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = _interopRequireDefault(require('../../nuclide-analytics'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var VALID_NUX_POSITIONS = new Set(['top', 'bottom', 'left', 'right', 'auto']);
// The maximum number of times the NuxView will attempt to attach to the DOM.
var ATTACHMENT_ATTEMPT_THRESHOLD = 5;
var ATTACHMENT_RETRY_TIMEOUT = 500; // milliseconds
var RESIZE_EVENT_DEBOUNCE_DURATION = 100; // milliseconds
// The frequency with which to poll the element that the NUX is bound to.
var POLL_ELEMENT_TIMEOUT = 100; // milliseconds

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

function validatePlacement(position) {
  return VALID_NUX_POSITIONS.has(position);
}

var NuxView = (function () {

  /**
   * Constructor for the NuxView.
   *
   * @param {string} tourId - The ID of the associated NuxTour
   * @param {?string} selectorString - The query selector to use to find an element
    on the DOM to attach to. If null, will use `selectorFunction` instead.
   * @param {?Function} selectorFunction - The function to execute to query an item
    on the DOM to attach to. If this is null, will use `selectorString` inside
    a call to `document.querySelector`.
   * @param {string} position - The position relative to the DOM element that the
    NUX should show.
   * @param {string} content - The content to show in the NUX.
   * @param {boolean} customContent - True iff `content` is a valid HTML String.
   * @param {?(() => boolean)} completePredicate - Will be used when determining whether
   * the NUX has been completed/viewed. The NUX will only be completed if this returns true.
   * If null, the predicate used will always return true.
   * @param {number} indexInTour - The index of the NuxView in the associated NuxTour
   *
   * @throws Errors if both `selectorString` and `selectorFunction` are null.
   */

  function NuxView(tourId, selectorString, selectorFunction, position, content, customContent, completePredicate, indexInTour) {
    if (customContent === undefined) customContent = false;
    if (completePredicate === undefined) completePredicate = null;

    _classCallCheck(this, NuxView);

    this._tourId = tourId;
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
    this._completePredicate = completePredicate || function () {
      return true;
    };
    this._index = indexInTour;

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(NuxView, [{
    key: '_createNux',
    value: function _createNux() {
      var _this = this;

      var creationAttempt = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      if (creationAttempt > ATTACHMENT_ATTEMPT_THRESHOLD) {
        this._onNuxComplete(false);
        // An error is logged and tracked instead of simply throwing an error since this function
        // will execute outside of the parent scope's execution and cannot be caught.
        var error = 'NuxView #' + this._index + ' for "' + this._tourId + '" ' + 'failed to succesfully attach to the DOM.';
        logger.error('ERROR: ' + error);
        this._track(error, error);
        return;
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

      this._tooltipDiv = document.createElement('div');
      this._tooltipDiv.className = 'nuclide-nux-tooltip-helper';
      elem.classList.add('nuclide-nux-tooltip-helper-parent');
      elem.appendChild(this._tooltipDiv);

      this._createDisposableTooltip();

      var debouncedWindowResizeListener = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(this._handleWindowResize.bind(this), RESIZE_EVENT_DEBOUNCE_DURATION, false);
      window.addEventListener('resize', debouncedWindowResizeListener);

      // Destroy the NUX if the element it is bound to is no longer visible.
      var tryDismissTooltip = function tryDismissTooltip(element) {
        //ヽ༼ຈل͜ຈ༽/ Yay for documentation! ᕕ( ᐛ )ᕗ
        // According to https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent,
        // `offsetParent` returns `null` if the parent or element is hidden.
        // However, it also returns null if the `position` CSS of the element is
        // `fixed`. This case requires a much slower operation `getComputedStyle`,
        // so try and avoid it if possible.
        var isHidden = undefined;
        if (element.style.position !== 'fixed') {
          isHidden = element.offsetParent === null;
        } else {
          isHidden = window.getComputedStyle(element).display === 'none';
        }
        if (isHidden) {
          // Consider the NUX to be dismissed and mark it as completed.
          _this._onNuxComplete(false);
        }
      };
      // The element is polled every `POLL_ELEMENT_TIMEOUT` milliseconds instead
      // of using a MutationObserver. When an element such as a panel is closed,
      // it may not mutate but simply be removed from the DOM - a change which
      // would not be captured by the MutationObserver.
      var pollElementTimeout = setInterval(tryDismissTooltip.bind(this, elem), POLL_ELEMENT_TIMEOUT);
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        if (pollElementTimeout !== null) {
          clearTimeout(pollElementTimeout);
        }
      }));

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
      if (!this._customContent) {
        // Can turn it into custom content (add DISMISS button).
        this._content = '<div class="nuclide-nux-text-content">\n                        <a class="nuclide-nux-dismiss-link">\n                          <span class="icon-x pull-right"></span>\n                        </a>\n                        <span>' + this._content + '</span>\n                      </div>';
        this._customContent = true;
      }
      this._tooltipDisposable = atom.tooltips.add(this._tooltipDiv, {
        title: this._content,
        trigger: 'manual',
        placement: this._position,
        html: this._customContent,
        template: '<div class="tooltip nuclide-nux-tooltip">\n                    <div class="tooltip-arrow"></div>\n                    <div class="tooltip-inner"></div>\n                  </div>'
      });
      this._disposables.add(this._tooltipDisposable);

      var dismissElemClickListener = this._onNuxComplete.bind(this, false);
      var dismissElement = document.querySelector('.nuclide-nux-dismiss-link');
      dismissElement.addEventListener('click', dismissElemClickListener);
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        return dismissElement.removeEventListener('click', dismissElemClickListener);
      }));
    }
  }, {
    key: '_handleDisposableClick',
    value: function _handleDisposableClick(disposable, addedElement) {
      // Only consider the NUX as complete if the completion condition has been met.
      if (!this._completePredicate()) {
        return;
      }

      // Cleanup changes made to the DOM.
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
    value: function _onNuxComplete() {
      var success = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (this._callback) {
        this._callback(success);
        // Avoid the callback being invoked again.
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
  }, {
    key: '_track',
    value: function _track(message, error) {
      (_nuclideAnalytics2 || _nuclideAnalytics()).default.track('nux-view-action', {
        tourId: this._tourId,
        message: '' + message,
        error: (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(error)
      });
    }
  }]);

  return NuxView;
})();

exports.NuxView = NuxView;