'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import wrapGadget from '../lib/wrapGadget';

class MyGadget extends React.Component {
  doSomething() {
  }

  render() {
    return <div />;
  }
}

MyGadget.gadgetId = 'my-awesome-gadget';

describe('wrapGadget', () => {

  describe('the result', () => {

    it('is a React component class', () => {
      const wrapped = wrapGadget(MyGadget);
      expect(wrapped.prototype instanceof React.Component).toBe(true);
    });

    it('has the gadget ID', () => {
      const wrapped = wrapGadget(MyGadget);
      expect(wrapped.gadgetId).toBe('my-awesome-gadget');
    });

    it('has the methods of the provided gadget', () => {
      const wrapped = wrapGadget(MyGadget);
      expect(wrapped.prototype.doSomething).toBeDefined();
      expect(typeof wrapped.prototype.doSomething).toBe('function');
    });

    it('has default implementations of Atom pane item methods', () => {
      const wrapped = wrapGadget(MyGadget);
      ['getTitle', 'getURI'].forEach(methodName => {
        expect(wrapped.prototype[methodName]).toBeDefined();
        expect(typeof wrapped.prototype[methodName]).toBe('function');
      });
    });

  });

});
