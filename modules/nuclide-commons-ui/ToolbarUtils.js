'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.













makeToolbarButtonSpec = makeToolbarButtonSpec;var _humanizeKeystroke;function _load_humanizeKeystroke() {return _humanizeKeystroke = _interopRequireDefault(require('../nuclide-commons/humanizeKeystroke'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function makeToolbarButtonSpec(
options)
{
  const command = options.callback;
  if (typeof command === 'string') {
    const [keyBinding] = atom.keymaps.findKeyBindings({
      command,
      target: atom.views.getView(atom.workspace) });

    const tooltipStr = options.tooltip;
    if (keyBinding != null && tooltipStr != null) {
      const keyString = (0, (_humanizeKeystroke || _load_humanizeKeystroke()).default)(keyBinding.keystrokes, null);
      options.tooltip = `${tooltipStr} (${keyString})`;
    }
  }

  return Object.assign({}, options);
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   *  strict
   * @format
   */