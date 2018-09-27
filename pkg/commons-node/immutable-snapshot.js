"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.List = List;
exports.Map = SnapshotMap;
exports.OrderedMap = OrderedMap;
exports.Record = Record;
exports.ImmutableSnapshotReader = exports.ImmutableSnapshotter = void 0;

function _immutable() {
  const data = _interopRequireDefault(require("immutable"));

  _immutable = function () {
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
 * 
 * @format
 */
const UNWRAPPED_METHODS = new Set(['constructor', // Methods that are guaranteed not to cause a mutation.
'get', 'getIn', 'first', 'last', 'reduce', 'reduceRight', 'find', 'findLast', 'findEntry', 'findLastEntry', 'max', 'maxBy', 'min', 'minBy', // Covered by overriding __ensureOwner.
'asMutable', 'asImmutable', 'withMutations']); // A union of all Immutable collections that are currently supported.

/**
 * immutable-snapshot exports custom versions of Immutable collections that can record
 * mutations and the object they originated from.
 *
 * You can then periodically get a 'delta snapshot' of the state of Immutable objects
 * to get a JSON-serializable representation.
 * Once an object is snapshotted, any future mutations to the object are recorded, and
 * future 'delta snapshots' may use the mutations rather than the full contents of the object.
 *
 * The intended use case is for synchronizing Immutable state across e.g. process boundaries,
 * so that you don't have to send the entire object every time.
 * The receiver should use ImmutableSnapshotReader to turn snapshots back into Immutable objects.
 *
 * Usage example:
 *
 *   const snapshotter = new ImmutableSnapshot.ImmutableSnapshotter();
 *   let list = ImmutableSnapshot.List([1, 2, 3]);
 *   const snapshot = snapshotter.createDeltaSnapshot(list);
 *   // ... send snapshot somewhere else
 *   list = list.push(4).push(5);
 *   const snapshot2 = snapshotter.createDeltaSnapshot(list);
 *
 *   At this point snapshot2 only contains the values 4 and 5.
 *
 * On the other end we have:
 *
 *   const snapshotReader = new ImmutableSnapshotReader();
 *   // read snapshot from somewhere
 *   let list = snapshotReader.deserialize(snapshot);
 *   // read snapshot2 from somewhere
 *   list = snapshotReader.deserialize(snapshot2);
 *
 * IMPORTANT: It's assumed that any non-Immutable object anywhere in the snapshot
 * is JSON-serializable. (Otherwise, the result will not be JSON-serializable).
 */
class ImmutableSnapshotter {
  // Track the contents of the previous snapshot so that we know what we can reuse.
  // Note that we could also store a complete history of snapshots on both sides,
  // but in practice patterns like Redux ensure that only the most recent state is really needed.
  createDeltaSnapshot(object) {
    const snapshotObjects = {};

    const result = _snapshotImpl(object, snapshotObjects, this._previousSnapshotObjects || {});

    if (!(result != null && typeof result.id === 'number')) {
      throw new Error('Expected an immutable object as input');
    }

    this._previousSnapshotObjects = snapshotObjects;
    return {
      root: result.id,
      snapshotObjects
    };
  }

}

exports.ImmutableSnapshotter = ImmutableSnapshotter;

function List(value) {
  // Use a custom prototype to override methods for tracking purposes.
  return _wrap(_immutable().default.List(value), List);
}

List.prototype = Object.create(_immutable().default.List.prototype);

List.of = (...args) => List(args);

_overrideMethods(List, _immutable().default.List);

function SnapshotMap(value) {
  return _wrap(_immutable().default.Map(value), SnapshotMap);
}

SnapshotMap.prototype = Object.create(_immutable().default.Map.prototype); // $FlowIssue: Map.of is missing

SnapshotMap.of = (...args) => SnapshotMap(_immutable().default.Map.of(...args));

_overrideMethods(SnapshotMap, _immutable().default.Map);

function OrderedMap(value) {
  return _wrap(_immutable().default.OrderedMap(value), OrderedMap);
}

OrderedMap.prototype = Object.create(_immutable().default.OrderedMap.prototype);

_overrideMethods(OrderedMap, _immutable().default.OrderedMap); // Immutable.Record actually returns a RecordFactory which then produces RecordInstances.


function Record(value) {
  const OriginalRecord = _immutable().default.Record(value);

  class DiffableRecord extends OriginalRecord {}

  _overrideMethods(DiffableRecord, OriginalRecord);

  return DiffableRecord;
} // Immutable.JS does not correctly support inheritance :(
// We often need to manually re-wrap the objects.


function _wrap(object, constructor) {
  if (object.size === 0) {
    // Immutable.JS shares empty objects, so we can't mutate these.
    // TODO: implement our own shared empty objects.
    return Object.assign(Object.create(constructor.prototype), object);
  } // Though setPrototypeOf has performance concerns, benchmarking shows that
  // this is still much faster than the object creation & assignment above.


  return Object.setPrototypeOf(object, constructor.prototype);
} // Private symbol to store metadata on objects.
// (This is much faster than using a WeakMap.)


const MetadataKey = Symbol('Metadata');
// Generates a unique auto-incrementing ID for any object.
let _objectCount = 0;

function _getMetadata(object) {
  let metadata = object[MetadataKey];

  if (metadata == null) {
    metadata = {
      id: ++_objectCount
    };
    object[MetadataKey] = metadata;
  }

  return metadata;
}

function _snapshotImpl(object, snapshotObjects, previousSnapshotObjects) {
  // Primitives
  if (typeof object !== 'object') {
    return object;
  } // Regular JS objects


  if (!_immutable().default.isImmutable(object)) {
    return {
      _: object
    };
  }

  const metadata = _getMetadata(object);

  const {
    id,
    parent,
    mutations
  } = metadata; // If this was already snapshotted last time (or earlier in the current snapshot),
  // assume the deserializer still knows about it.

  if (previousSnapshotObjects[id] != null || snapshotObjects[id] != null) {
    return snapshotObjects[id] = {
      type: 'ref',
      id
    };
  }

  metadata.snapshotted = true;

  if (parent != null) {
    if (!(mutations != null)) {
      throw new Error("Invariant violation: \"mutations != null\"");
    }

    const parentSnapshot = _snapshotImpl(parent, snapshotObjects, previousSnapshotObjects);

    if (!(parentSnapshot != null && typeof parentSnapshot.id === 'number')) {
      throw new Error('Parent must be immutable');
    }

    return snapshotObjects[id] = {
      type: 'delta',
      id,
      parentID: parentSnapshot.id,
      mutations: mutations.map(mutation => {
        return {
          method: mutation.method,
          // Mutation arguments may be other immutable objects, so snapshot those too.
          args: mutation.args.map(arg => _snapshotImpl(arg, snapshotObjects, previousSnapshotObjects))
        };
      })
    };
  } else if (object instanceof _immutable().default.List) {
    return snapshotObjects[id] = {
      type: 'list',
      id,
      value: object.toJSON().map(x => // Nested immutable objects are well-supported.
      _snapshotImpl(x, snapshotObjects, previousSnapshotObjects))
    };
  } else if (object instanceof _immutable().default.OrderedMap) {
    const value = [];

    for (const [k, v] of object.entries()) {
      value.push([_snapshotImpl(k, snapshotObjects, previousSnapshotObjects), _snapshotImpl(v, snapshotObjects, previousSnapshotObjects)]);
    }

    return snapshotObjects[id] = {
      type: 'orderedmap',
      id,
      value
    };
  } else if (object instanceof _immutable().default.Map) {
    const value = [];

    for (const [k, v] of object.entries()) {
      value.push([_snapshotImpl(k, snapshotObjects, previousSnapshotObjects), _snapshotImpl(v, snapshotObjects, previousSnapshotObjects)]);
    }

    return snapshotObjects[id] = {
      type: 'map',
      id,
      value
    };
  } else if (object instanceof _immutable().default.Record) {
    const value = [];

    for (const [k, v] of object.entries()) {
      value.push([k, _snapshotImpl(v, snapshotObjects, previousSnapshotObjects)]);
    }

    return snapshotObjects[id] = {
      type: 'record',
      id,
      value
    };
  } else {
    throw new Error(`Serialization for ${object.constructor.name} is not implemented yet.`);
  }
}
/**
 * The core idea here is to wrap all 'mutation' methods of immutable objects.
 * Since Immutable.JS returns a new object on change, we can record that
 * the new object descended from the initial object and also record the mutation.
 * These can then be replayed in ImmutableSnapshotReader.
 */


function _overrideMethods(wrapped, original) {
  const originalPrototype = original.prototype; // Storing the call depth allows us to discard mutations triggered within mutations
  // (e.g. List.push uses List.set underneath.)

  let depth = 0;

  function wrapIfNeeded(object) {
    if (object == null || typeof object !== 'object') {
      return object;
    } // Strictly check equality to prevent wrapping subclasses of 'original'
    // (e.g. Immutable.Map.sort returns an Immutable.OrderedMap, which we can't wrap here.)


    const proto = Object.getPrototypeOf(object);

    if (proto === originalPrototype) {
      return _wrap(object, wrapped); // $FlowIssue: OrderedMap.prototype should exist
    } else if (proto === _immutable().default.OrderedMap.prototype) {
      // Immutable.Map.sort returns an OrderedMap.
      // This won't be recorded as a mutation, but continue wrapping it.
      return _wrap(object, OrderedMap);
    }

    return object;
  }

  for (const method in originalPrototype) {
    if (method.startsWith('__') || method.startsWith('to') || method.startsWith('@@') || UNWRAPPED_METHODS.has(method)) {
      continue;
    }

    const oldMethod = wrapped.prototype[method];

    wrapped.prototype[method] = function (...args) {
      // Don't record nested mutations.
      if (depth) {
        return wrapIfNeeded(oldMethod.apply(this, args));
      }

      depth++;
      let newObject = oldMethod.apply(this, args);
      depth--;

      if (newObject !== this) {
        newObject = wrapIfNeeded(newObject); // Only record a mutation if wrapping was successful.

        if (newObject instanceof wrapped && _isSerializable(args) && _shouldRecordMutations(this)) {
          const metadata = _getMetadata(newObject);

          if (!(metadata.parent == null)) {
            throw new Error('An object cannot have two parents');
          }

          metadata.parent = this;
          metadata.mutations = [{
            method,
            args
          }];
        }
      } else if (this.__ownerID) {
        // this.__ownerID indicates that the object is currently mutable.
        // We'll push these mutations onto the existing parent record.
        // (generated from the __ensureOwner override below).
        const {
          mutations
        } = _getMetadata(newObject);

        if (mutations != null) {
          // Note: withMutations only supports certain mutations.
          // All of them should be serializable (e.g. set, push, pop)
          mutations.push({
            method,
            args
          });
        }
      }

      return newObject;
    };
  } // __ensureOwner is what Immutable.JS uses to implement asMutable().
  // It creates a copy of the object, so we need to record the parent.


  const {
    __ensureOwner
  } = wrapped.prototype;

  wrapped.prototype.__ensureOwner = function (ownerID) {
    let newObject = __ensureOwner.call(this, ownerID); // Some methods use `withMutation` in their implementation. Ignore it.


    if (depth) {
      return newObject;
    }

    if (newObject !== this) {
      if (!(newObject instanceof wrapped)) {
        newObject = _wrap(newObject, wrapped);
      }

      if (_shouldRecordMutations(this)) {
        const metadata = _getMetadata(newObject);

        if (!(metadata.parent == null)) {
          throw new Error('An object cannot have two parents');
        }

        metadata.parent = this;
        metadata.mutations = [];
      }
    }

    return newObject;
  };
}

function _isSerializable(args) {
  // Mutations with functions as arguments are not serializable.
  return args.every(x => typeof x !== 'function');
}

function _shouldRecordMutations(object) {
  // It's not worth recording mutations to empty collections.
  if (object.size === 0) {
    return false;
  }

  const {
    parent,
    snapshotted
  } = _getMetadata(object);

  return parent != null || snapshotted != null;
}
/**
 * ImmutableSnapshotReader is stateful because it needs to keep the previous snapshot around.
 * Note that any values used in snapshots before that will be discarded - so it's important that
 * ImmutableSnapshotReader and its corresponding ImmutableSnapshotter stay in sync.
 */


class ImmutableSnapshotReader {
  constructor() {
    this._previousDeserializedObjects = new Map();
  }

  readSnapshot({
    root,
    snapshotObjects
  }) {
    const deserializedObjects = new Map();

    const result = this._deserializeImmutable(root, snapshotObjects, deserializedObjects); // Keep the last snapshot around for the next snapshot to use.


    this._previousDeserializedObjects = deserializedObjects;
    return result;
  }

  _deserializeObject(object, snapshotObjects, deserializedObjects) {
    if (object == null || typeof object !== 'object') {
      return object;
    }

    if (object.id == null) {
      // $FlowIssue: this is guaranteed to exist
      return object._;
    }

    return this._deserializeImmutable(object.id, snapshotObjects, deserializedObjects);
  }

  _deserializeImmutable(id, snapshotObjects, deserializedObjects) {
    const object = snapshotObjects[id];

    if (!(object != null)) {
      throw new Error(`Missing record for id ${id}`);
    }

    switch (object.type) {
      case 'ref':
        const stored = this._previousDeserializedObjects.get(object.id) || deserializedObjects.get(object.id);

        if (!(stored != null)) {
          throw new Error(`Expected ${object.id} to be previously snapshotted`);
        }

        deserializedObjects.set(object.id, stored);
        return stored;

      case 'delta':
        const parent = this._deserializeImmutable(object.parentID, snapshotObjects, deserializedObjects);

        if (!_immutable().default.isImmutable(parent)) {
          throw new Error('Expected parent to be an immutable object');
        }

        let value; // withMutations doesn't support all mutations, so we must handle the singular case.

        if (object.mutations.length === 1) {
          value = this._applyMutation(parent, object.mutations[0], snapshotObjects, deserializedObjects);
        } else {
          value = parent.withMutations(p => {
            object.mutations.forEach(mutation => {
              this._applyMutation(p, mutation, snapshotObjects, deserializedObjects);
            });
          });
        }

        deserializedObjects.set(object.id, value);
        return value;

      case 'list':
        const list = _immutable().default.List(object.value.map(elem => this._deserializeObject(elem, snapshotObjects, deserializedObjects)));

        deserializedObjects.set(object.id, list);
        return list;

      case 'map':
        const map = _immutable().default.Map(object.value.map(([k, v]) => [this._deserializeObject(k, snapshotObjects, deserializedObjects), this._deserializeObject(v, snapshotObjects, deserializedObjects)]));

        deserializedObjects.set(object.id, map);
        return map;

      case 'orderedmap':
        const orderedMap = _immutable().default.OrderedMap(object.value.map(([k, v]) => [this._deserializeObject(k, snapshotObjects, deserializedObjects), this._deserializeObject(v, snapshotObjects, deserializedObjects)]));

        deserializedObjects.set(object.id, orderedMap);
        return orderedMap;

      case 'record':
        const record = {};
        object.value.forEach(([k, v]) => {
          record[k] = this._deserializeObject(v, snapshotObjects, deserializedObjects);
        });

        class _Record extends _immutable().default.Record(record) {}

        const rec = new _Record(record);
        deserializedObjects.set(object.id, rec);
        return rec;

      default:
        object.type;
        throw new Error(`Unexpected type ${object.type}`);
    }
  }

  _applyMutation(object, mutation, snapshotObjects, deserializedObjects) {
    const args = mutation.args.map(arg => this._deserializeObject(arg, snapshotObjects, deserializedObjects));
    return object[mutation.method](...args);
  }

}

exports.ImmutableSnapshotReader = ImmutableSnapshotReader;