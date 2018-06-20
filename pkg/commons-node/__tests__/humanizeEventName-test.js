'use strict';

var _humanizeEventName;

function _load_humanizeEventName() {
  return _humanizeEventName = _interopRequireDefault(require('../humanizeEventName'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('humanizeEventName(eventName)', () => {
  describe('when no namespace exists', () => {
    it('undasherizes and capitalizes the event name', () => {
      expect((0, (_humanizeEventName || _load_humanizeEventName()).default)('nonamespace')).toBe('Nonamespace');
      expect((0, (_humanizeEventName || _load_humanizeEventName()).default)('no-name-space')).toBe('No Name Space');
    });
  });

  describe('when a namespace exists', () => {
    it('space separates the undasherized/capitalized versions of the namespace and event name', () => {
      expect((0, (_humanizeEventName || _load_humanizeEventName()).default)('space:final-frontier')).toBe('Space: Final Frontier');
      expect((0, (_humanizeEventName || _load_humanizeEventName()).default)('star-trek:the-next-generation')).toBe('Star Trek: The Next Generation');
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict
     * @format
     */