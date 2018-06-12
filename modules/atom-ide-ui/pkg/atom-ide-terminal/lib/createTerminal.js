/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {TerminalOptions} from 'xterm';

import {boolean, constant, either3, object, number, guard} from 'decoders';
import featureConfig from 'nuclide-commons-atom/feature-config';
import {Terminal as XTerminal} from 'xterm';
import * as Fit from 'xterm/lib/addons/fit/fit';
import * as WebLinks from 'xterm/lib/addons/webLinks/webLinks';

const SCROLLBACK_CONFIG = 'atom-ide-terminal.scrollback';
const CURSOR_STYLE_CONFIG = 'atom-ide-terminal.cursorStyle';
const CURSOR_BLINK_CONFIG = 'atom-ide-terminal.cursorBlink';
const OPTION_IS_META_CONFIG = 'atom-ide-terminal.optionIsMeta';
const TRANSPARENCY_CONFIG = 'atom-ide-terminal.allowTransparency';
const CHAR_ATLAS_CONFIG = 'atom-ide-terminal.charAtlas';

export type Terminal = TerminalClass;
declare class TerminalClass extends XTerminal {
  proposeGeometry: () => {rows: number, cols: number};
  fit: () => void;
  webLinksInit: (handler?: (event: Event, link: string) => void) => void;

  // TODO: Update xterm types?
  linkifier: any;
  buffer: any;
  selectionManager: any;
  dispose: () => void;
}

const assertTerminalOptionsInFeatureConfig = guard(
  object({
    cols: number,
    rows: number,
    cursorBlink: boolean,
    cursorStyle: either3(
      constant('block'),
      constant('underline'),
      constant('bar'),
    ),
    scrollback: number,
    macOptionIsMeta: boolean,
    allowTransparency: boolean,
    experimentalCharAtlas: either3(
      constant('none'),
      constant('static'),
      constant('dynamic'),
    ),
  }),
);

export function createTerminal(options: TerminalOptions = {}): Terminal {
  // Load the addons on-demand the first time we create a terminal.
  // $FlowIgnore
  if (XTerminal.fit == null) {
    // The 'fit' add-on resizes the terminal based on the container size
    // and the font size such that the terminal fills the container.
    XTerminal.applyAddon(Fit);
  }
  // $FlowIgnore
  if (XTerminal.webLinksInit == null) {
    // The 'webLinks' add-on linkifies http URL strings.
    XTerminal.applyAddon(WebLinks);
  }
  // $FlowIgnore We know that TerminalClass is XTerminal + addons
  const terminal = new XTerminal(
    // $FlowIssue: xterms type needs to be updated to include experimentalCharAtlas
    assertTerminalOptionsInFeatureConfig({
      cols: 512,
      rows: 512,
      cursorBlink: featureConfig.get(CURSOR_BLINK_CONFIG),
      cursorStyle: featureConfig.get(CURSOR_STYLE_CONFIG),
      scrollback: featureConfig.get(SCROLLBACK_CONFIG),
      macOptionIsMeta: featureConfig.get(OPTION_IS_META_CONFIG),
      allowTransparency: featureConfig.get(TRANSPARENCY_CONFIG),
      experimentalCharAtlas: featureConfig.get(CHAR_ATLAS_CONFIG),
      ...options,
    }),
  );
  // Patch into xterm Linkifier to catch errors on isWrapped property.
  // Track issue at https://github.com/xtermjs/xterm.js/issues/1509
  const linkifyRow = terminal.linkifier._linkifyRow;
  terminal.linkifier._linkifyRow = row => {
    try {
      linkifyRow.call(terminal.linkifier, row);
    } catch (e) {
      // swallow errors to avoid red box because the linkifier runs on a timer.
    }
  };
  return terminal;
}
