'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import * as GadgetUri from './GadgetUri';
import observableFromSubscribeFunction from './observableFromSubscribeFunction';
import React from 'react-for-atom';

/**
 * A higher order component that wraps the provided gadget to adapt it to Atom's expectations for
 * pane items. (Gadgets themselves are potentially portable to other parts of the UI--for example,
 * somebody could write a package that displays them in panels instead of pane items.) The wrapper
 * does two things: (1) it provides sensible defaults for stuff that Atom requires of pane items
 * (`getTitle`), but that aren't required of gadgets and (2) it acts as a bridge between Atom's
 * stateful, multi-event model and React's more functional approach. For example, Atom would have us
 * update properties and then invoke corresponding event handlers, whereas we'd prefer to write
 * accessors (like `getTitle`) as a pure function of the component props and state and have Atom
 * update whenever they change.
 *
 * It should be noted that our approach makes it super simple to manage your gadget state using
 * React (`setState()`) but doesn't require it. If you'd like to manage it in some other way (e.g.
 * Flux), just call the `notify` function (provided as a prop) whenever your store's state changes.
 * (This is basically like using `forceUpdate()` when you have an impure `render()`.)
 */
export default function wrapGadget(gadget: any): Object {
  // We need to maintain the instance methods of the provided gadget (since that's how Atom will
  // interact with it), so we create our new one by subclassing. /: Once the environment supports
  // Proxies, we shoulds switch to them (so that we're not trampling on the component's namespace).
  // Until then, let's just try really hard to minimize the number of things we do that the
  // component can see.
  class PaneItem extends (gadget: Object) {

    componentDidUpdate(prevProps, prevState) {
      if (super.componentDidUpdate) {
        super.componentDidUpdate(prevProps, prevState);
      }

      // Notify Atom that the state changed.
      this.props.notify();
    }

    destroy() {
      if (super.destroy) {
        super.destroy();
      }
      React.unmountComponentAtNode(this.element);
    }

    // Deserialization happens before the gadgets are available, so we need to serialize gadgets as
    // placeholders (which are later replaced with the real thing).
    serialize() {
      return {
        deserializer: 'GadgetPlaceholder',
        data: {
          gadgetId: this.constructor.gadgetId,
          iconName: this.getIconName && this.getIconName(),

          // It's attractive to try to do a default serialization but that's probably a bad idea
          // because it could be costly and confusing to serialize a bunch of unneeded stuff.
          rawInitialGadgetState: this.serializeState && this.serializeState(),

          title: this.getTitle(),
        },
      };
    }

  }

  // Since we need to serialize gadgets as placeholders, we can't let users define `serialize()`
  // (which Atom calls) directly. But that's okay because it's kinda icky boilerplate anyway. They
  // can just handle serializing only the state (if they need serialization at all) by implementing
  // `serializeState()`.
  invariant(
    !('serialize' in gadget.prototype),
    `Gadgets can't define a "serialize" method. To provide custom serialization, `
    + `implement "serializeState"`
  );

  // Add event subscription methods.
  addSubscribeMethods(PaneItem.prototype, {
    onDidChangeTitle: 'getTitle',
    onDidChangeIcon: 'getIconName',
  });

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

/**
 * Creates and adds a subscription method for each of the items in the provided map of subscription
 * method names to getter names.
 */
function addSubscribeMethods(proto, events) {
  for (const event of Object.keys(events)) {
    const getterName = events[event];

    // Only add the event subscription method if there's a corresponding getter.
    if (!(getterName in proto)) {
      continue;
    }

    const streamName = `_${getterName}Stream`;

    // Add a subscription method to the prototype.
    proto[event] = function(callback) {
      let stream = this[streamName];
      if (stream == null) {
        const getValue = () => this[getterName]();
        this[streamName] = stream = observableFromSubscribeFunction(this.props.subscribe)
          .map(getValue)
          .distinctUntilChanged();
      }
      return stream.subscribe(callback);
    };
  }
}
