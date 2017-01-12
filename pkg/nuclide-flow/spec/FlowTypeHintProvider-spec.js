/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {uncachedRequire} from '../../nuclide-test-helpers';
import {Range} from 'atom';
import featureConfig from '../../commons-atom/featureConfig';
import nuclideUri from '../../commons-node/nuclideUri';

const TYPE_HINT_PROVIDER = '../lib/FlowTypeHintProvider';

const FIXTURE = nuclideUri.join(__dirname, 'fixtures/fixture.js');

describe('FlowTypeHintProvider', () => {
  let editor: atom$TextEditor = (null: any);
  const position = [1, 1];
  const range = new Range([1, 2], [3, 4]);

  let typeHintProvider;

  beforeEach(() => {
    waitsForPromise(async () => {
      editor = await atom.workspace.open(FIXTURE);
    });
  });

  afterEach(() => {
    // we assume here that runWith is called in every spec -- otherwise these
    // will not be spies
    jasmine.unspy(require('../../commons-atom/range'), 'wordAtPosition');
    jasmine.unspy(featureConfig, 'get');
    jasmine.unspy(require('../lib/FlowServiceFactory'), 'getFlowServiceByNuclideUri');
  });

  async function runWith(enabled: boolean, result: ?string, word: ?Object) {
    spyOn(featureConfig, 'get').andCallFake(key => {
      if (key === 'nuclide-flow.enableTypeHints') {
        return enabled;
      } else {
        return false;
      }
    });
    spyOn(require('../lib/FlowServiceFactory'), 'getFlowServiceByNuclideUri').andReturn({
      flowGetType() { return Promise.resolve(result); },
    });
    spyOn(require('../../commons-atom/range'), 'wordAtPosition').andReturn(word);

    const {FlowTypeHintProvider} = (uncachedRequire(require, TYPE_HINT_PROVIDER): any);
    typeHintProvider = new FlowTypeHintProvider();
    return typeHintProvider.typeHint(editor, position);
  }

  it('should return null when disabled', () => {
    waitsForPromise(async () => {
      expect(await runWith(false, 'foo', {range})).toBe(null);
    });
  });

  it('should return the type', () => {
    waitsForPromise(async () => {
      expect((await runWith(true, 'foo', {range})).hint).toBe('foo');
    });
  });

  it('should return the range', () => {
    waitsForPromise(async () => {
      expect((await runWith(true, 'foo', {range})).range).toBe(range);
    });
  });

  it('should return null when the FlowService result is null', () => {
    waitsForPromise(async () => {
      expect(await runWith(true, null, {range})).toBe(null);
    });
  });

  it('should return a default range when the word is null', () => {
    waitsForPromise(async () => {
      expect((await runWith(true, 'foo', null)).range)
        .toEqual(new Range(position, position));
    });
  });
});
