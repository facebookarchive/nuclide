"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getAtomCommands = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("CommandService/getAtomCommands", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 17
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "CommandService.js",
            line: 17
          },
          kind: "named",
          name: "AtomCommands"
        }
      });
    });
  };

  remoteModule.AtomCommands = class {
    openFile(arg0, arg1, arg2) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 19
          },
          kind: "number"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "AtomCommands"
        }).then(id => {
          return _client.callRemoteMethod(id, "openFile", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
          },
          kind: "named",
          name: "AtomFileEvent"
        });
      }).publish();
    }
    addProject(arg0) {
      return trackOperationTiming("AtomCommands.addProject", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "projectPath",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "named",
            name: "NuclideUri"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            name: "AtomCommands"
          }).then(id => {
            return _client.callRemoteMethod(id, "addProject", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "void"
          });
        });
      });
    }
    dispose() {
      return _client.disposeRemoteObject(this);
    }
  };
  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["getAtomCommands", {
    kind: "function",
    name: "getAtomCommands",
    location: {
      type: "source",
      fileName: "CommandService.js",
      line: 17
    },
    type: {
      location: {
        type: "source",
        fileName: "CommandService.js",
        line: 17
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 17
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "CommandService.js",
            line: 17
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "CommandService.js",
              line: 17
            },
            kind: "named",
            name: "AtomCommands"
          }
        }
      }
    }
  }], ["AtomFileEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 14
    },
    name: "AtomFileEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "string-literal",
        value: "open"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "string-literal",
        value: "close"
      }]
    }
  }], ["AtomCommands", {
    kind: "interface",
    name: "AtomCommands",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 15
    },
    constructorArgs: null,
    staticMethods: new Map(),
    instanceMethods: new Map([["openFile", {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 16
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 19
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
          },
          kind: "named",
          name: "AtomFileEvent"
        }
      }
    }], ["addProject", {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 21
      },
      kind: "function",
      argumentTypes: [{
        name: "projectPath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 22
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        kind: "void"
      }
    }]])
  }]])
});