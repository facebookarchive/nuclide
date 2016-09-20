"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.RemoteCommandService = class {
    static registerAtomCommands(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "port",
        type: {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 38
          },
          kind: "number"
        }
      }, {
        name: "atomCommands",
        type: {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 39
          },
          kind: "named",
          name: "AtomCommands"
        }
      }]).then(args => {
        return _client.callRemoteFunction("RemoteCommandService/registerAtomCommands", "promise", args);
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 40
          },
          kind: "named",
          name: "RemoteCommandService"
        });
      });
    }
    constructor(arg0) {
      _client.createRemoteObject("RemoteCommandService", this, [arg0], [{
        name: "port",
        type: {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 23
          },
          kind: "number"
        }
      }])
    }
    dispose() {
      return _client.disposeRemoteObject(this);
    }
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
  }], ["RemoteCommandService", {
    kind: "interface",
    name: "RemoteCommandService",
    location: {
      type: "source",
      fileName: "RemoteCommandService.js",
      line: 19
    },
    constructorArgs: [{
      name: "port",
      type: {
        location: {
          type: "source",
          fileName: "RemoteCommandService.js",
          line: 23
        },
        kind: "number"
      }
    }],
    staticMethods: new Map([["registerAtomCommands", {
      location: {
        type: "source",
        fileName: "RemoteCommandService.js",
        line: 37
      },
      kind: "function",
      argumentTypes: [{
        name: "port",
        type: {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 38
          },
          kind: "number"
        }
      }, {
        name: "atomCommands",
        type: {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 39
          },
          kind: "named",
          name: "AtomCommands"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "RemoteCommandService.js",
          line: 40
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 40
          },
          kind: "named",
          name: "RemoteCommandService"
        }
      }
    }]]),
    instanceMethods: new Map([["dispose", {
      location: {
        type: "source",
        fileName: "RemoteCommandService.js",
        line: 32
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "RemoteCommandService.js",
          line: 32
        },
        kind: "void"
      }
    }]])
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