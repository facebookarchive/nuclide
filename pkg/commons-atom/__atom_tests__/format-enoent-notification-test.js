"use strict";

function _formatEnoentNotification() {
  const data = _interopRequireDefault(require("../format-enoent-notification"));

  _formatEnoentNotification = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('formatEnoentNotification', () => {
  let formatted;
  beforeEach(() => {
    jest.spyOn(_featureConfig().default, 'getSchema').mockReturnValue({
      title: 'Path to Node Executable',
      type: 'string',
      default: 'node',
      description: 'Absolute path to the node executable on your system.'
    });
    jest.spyOn(_featureConfig().default, 'get').mockReturnValue('/path/to/node');
    formatted = (0, _formatEnoentNotification().default)({
      feature: 'awesome stuff creation',
      toolName: 'node',
      pathSetting: 'my-special-package.pathToNode'
    });
  });
  it('formats the message', () => {
    if (!(formatted != null)) {
      throw new Error("Invariant violation: \"formatted != null\"");
    }

    expect(formatted.message).toBe("Nuclide couldn't find *node*!");
  });
  it('has a useful intro line', () => {
    if (!(formatted != null)) {
      throw new Error("Invariant violation: \"formatted != null\"");
    }

    const expected = "Awesome stuff creation needs *node* but Nuclide couldn't find it at `/path/to/node`";

    if (!(formatted.meta.description != null)) {
      throw new Error("Invariant violation: \"formatted.meta.description != null\"");
    }

    expect(formatted.meta.description.startsWith(expected)).toBe(true);
  });
  it('mentions the setting title in the description', () => {
    if (!(formatted != null)) {
      throw new Error("Invariant violation: \"formatted != null\"");
    }

    if (!(formatted.meta.description != null)) {
      throw new Error("Invariant violation: \"formatted.meta.description != null\"");
    }

    expect(/Path to Node/.test(formatted.meta.description)).toBe(true);
  });
  it('mentions the setting category in the description', () => {
    if (!(formatted != null)) {
      throw new Error("Invariant violation: \"formatted != null\"");
    }

    if (!(formatted.meta.description != null)) {
      throw new Error("Invariant violation: \"formatted.meta.description != null\"");
    }

    expect(/My-special-package/.test(formatted.meta.description)).toBe(true);
  });
});