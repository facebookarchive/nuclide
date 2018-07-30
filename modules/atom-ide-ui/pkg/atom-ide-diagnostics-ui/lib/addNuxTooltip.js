/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

/* eslint-env browser */

import findKeyBindingsForCommand from 'nuclide-commons-atom/findKeyBindingsForCommand';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';

const TOOLTIP_CLASSNAME = 'diagnostics-nux-tooltip';
const TOOLTIP_DISMISS_BUTTON_CLASSNAME =
  'diagnostics-nux-tooltip-dissmiss-button';

export default function addNuxTooltip(statusBarNode: HTMLElement): IDisposable {
  const existingKeybinding = findKeyBindingsForCommand(
    'diagnostics:toggle-table',
  );
  const cta = `<p>To trigger the panel, click here in the status bar${
    existingKeybinding
      ? `, or press <kdb class="keystroke">${existingKeybinding}</kdb>.`
      : '.'
  }</p>`;

  const tooltip = Observable.create(
    () =>
      new UniversalDisposable(
        atom.tooltips.add(statusBarNode, {
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
          trigger: 'manual',
        }),
      ),
  );

  const buttonClick = Observable.fromEvent(document.body, 'click').filter(
    (e: MouseEvent) =>
      e.target instanceof HTMLButtonElement &&
      e.target.classList.contains(TOOLTIP_DISMISS_BUTTON_CLASSNAME),
  );

  return new UniversalDisposable(
    tooltip
      .takeUntil(buttonClick)
      // Automatically dismiss the tooltip after one minute
      .timeoutWith(60 * 1000, Observable.empty())
      .subscribe(),
  );
}
