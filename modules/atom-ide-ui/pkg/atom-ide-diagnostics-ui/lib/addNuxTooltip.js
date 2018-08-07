"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addNuxTooltip;

function _findKeyBindingsForCommand() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/findKeyBindingsForCommand"));

  _findKeyBindingsForCommand = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/* eslint-env browser */
const TOOLTIP_CLASSNAME = 'diagnostics-nux-tooltip';
const TOOLTIP_DISMISS_BUTTON_CLASSNAME = 'diagnostics-nux-tooltip-dissmiss-button';

function addNuxTooltip(statusBarNode) {
  const existingKeybinding = (0, _findKeyBindingsForCommand().default)('diagnostics:toggle-table');
  const cta = `<p>To trigger the panel, click here in the status bar${existingKeybinding ? `, or press <kdb class="keystroke">${existingKeybinding}</kdb>.` : '.'}</p>`;

  const tooltip = _RxMin.Observable.create(() => new (_UniversalDisposable().default)(atom.tooltips.add(statusBarNode, {
    html: true,
    class: TOOLTIP_CLASSNAME,
    title: `
                <div class="diagnostics-nux-tooltip-body">
                  <p>
                    You haven't used the diagnostics panel before, and right now there are errors across multiple files.
                  </p>
                  <p>It's useful in these cases, so just this once we've opened it for you to explore.</p>
                  ${cta}
                </div>
                <div>
                  <button class="btn btn-primary ${TOOLTIP_DISMISS_BUTTON_CLASSNAME}">
                    Got it
                  </button>
                </div>
              `,
    trigger: 'manual'
  })));

  const buttonClick = _RxMin.Observable.fromEvent(document.body, 'click').filter(e => e.target instanceof HTMLButtonElement && e.target.classList.contains(TOOLTIP_DISMISS_BUTTON_CLASSNAME));

  return new (_UniversalDisposable().default)(tooltip.takeUntil(buttonClick) // Automatically dismiss the tooltip after one minute
  .timeoutWith(60 * 1000, _RxMin.Observable.empty()).subscribe());
}