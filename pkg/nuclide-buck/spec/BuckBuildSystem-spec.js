'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable} from 'rxjs';
import {BuckBuildSystem} from '../lib/BuckBuildSystem';

describe('BuckBuildSystem', () => {
  let buckBuildSystem;
  beforeEach(() => {
    buckBuildSystem = new BuckBuildSystem();
  });

  describe('_consumeEventStream', () => {
    it('emits log messages', () => {
      waitsForPromise(async () => {
        const spy = jasmine.createSpy('output');
        const subscription = buckBuildSystem.getOutputMessages()
          .subscribe(spy);

        const result = await buckBuildSystem._consumeEventStream(Observable.from([
          {type: 'log', message: 'test', level: 'error'},
          {type: 'log', message: 'test2', level: 'warning'},
          {type: 'progress', progress: 1},
        ]))
          .toArray()
          .toPromise();

        // Progress events should filter through.
        expect(result).toEqual([{type: 'progress', progress: 1}]);

        expect(spy.calls.map(call => call.args[0])).toEqual([
          {text: 'test', level: 'error'},
          {text: 'test2', level: 'warning'},
        ]);

        subscription.unsubscribe();
      });
    });

    it('emits diagnostics', () => {
      waitsForPromise(async () => {
        const spy = jasmine.createSpy('diagnostics');
        const subscription = buckBuildSystem.getDiagnosticProvider()
          .updates
          .subscribe(spy);

        const outputSpy = jasmine.createSpy('output');
        const outputSubscription = buckBuildSystem.getOutputMessages()
          .subscribe(outputSpy);

        const diagnostic = {
          scope: 'file',
          providerName: 'Buck',
          type: 'Error',
          filePath: 'a',
        };

        const result = await buckBuildSystem._consumeEventStream(Observable.from([
          {
            type: 'diagnostics',
            diagnostics: [diagnostic],
          },
          {
            type: 'diagnostics',
            diagnostics: [{...diagnostic, type: 'Warning'}],
          },
          {
            type: 'diagnostics',
            diagnostics: [{...diagnostic, filePath: 'b'}],
          },
        ])).toArray().toPromise();

        expect(result).toEqual([]);
        expect(spy.calls.map(call => call.args[0])).toEqual([
          {
            filePathToMessages: new Map([
              ['a', [diagnostic]],
            ]),
          },
          {
            // Accumulate diagnostics per file.
            filePathToMessages: new Map([
              ['a', [diagnostic, {...diagnostic, type: 'Warning'}]],
            ]),
          },
          {
            // No need to emit diagnostics for 'a' again.
            filePathToMessages: new Map([
              ['b', {...diagnostic, filePath: 'b'}],
            ]),
          },
        ]);

        // Check for the message indicating to look in diagnostics.
        expect(outputSpy).toHaveBeenCalled();
        const args: any = outputSpy.calls[0].args[0];
        expect(args.text).toContain('Diagnostics');
        expect(args.level).toBe('info');

        subscription.unsubscribe();
        outputSubscription.unsubscribe();
      });
    });
  });

});
