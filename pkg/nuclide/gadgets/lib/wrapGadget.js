'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as GadgetUri from './GadgetUri';
import React from 'react-for-atom';

/**
 * A higher order component that wraps the provided gadget to adapt it to Atom's expectations for
 * pane items. (Gadgets themselves are potentially portable to other parts of the UI--for example,
 * somebody could write a package that displays them in panels instead of pane items.) Currently,
 * the wrapper only does one thing: provide sensible defaults for stuff that Atom requires of pane
 * items (`getTitle`), but that aren't required of gadgets.
 */
export default function wrapGadget(gadget: any): Object {
  // We want to maintain the instance methods of the provided gadget, so we create our new one by
  // subclassing. /:
  class PaneItem extends (gadget: Object) {

    destroy() {
      if (super.destroy) {
        super.destroy();
      }
      React.unmountComponentAtNode(this.element);
    }

  }

  // Copy statics.
  for (const prop in gadget) {
    if (!gadget.hasOwnProperty(prop)) {
      continue;
    }
    PaneItem[prop] = gadget[prop];
  }

  // Copy default methods.
  for (const prop in defaultMethods) {
    if (prop in PaneItem.prototype) {
      continue;
    }
    PaneItem.prototype[prop] = defaultMethods[prop];
  }

  return PaneItem;
}

const defaultMethods = {
  getTitle() {
    // TODO: Generate default title from gadgetId
    return 'Default Title';
  },
  getURI() {
    return GadgetUri.format({gadgetId: this.constructor.gadgetId});
  },
};
