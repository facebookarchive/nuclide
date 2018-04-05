"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.VsRawAdapterSpawnerService = class {
    constructor() {
      _client.createRemoteObject("VsRawAdapterSpawnerService", this, [], []);
    }

    spawnAdapter(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "adapter",
        type: {
          kind: "named",
          name: "VSAdapterExecutableInfo"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 23
        },
        name: "VsRawAdapterSpawnerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "spawnAdapter", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    write(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "input",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 23
        },
        name: "VsRawAdapterSpawnerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "write", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.getProcessTree = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("VSCodeDebuggerAdapterService/getProcessTree", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "ProcessInfo"
        }
      });
    });
  };

  remoteModule.getAdapterExecutableInfo = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adapterType",
      type: {
        kind: "named",
        name: "Adapter"
      }
    }]).then(args => {
      return _client.callRemoteFunction("VSCodeDebuggerAdapterService/getAdapterExecutableInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "VSAdapterExecutableInfo"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 663
      },
      name: "ProcessExitMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          name: "exitCode",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "signal",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 669
      },
      name: "ProcessMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            },
            optional: false
          }, {
            name: "signal",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    VSAdapterExecutableInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 32
      },
      name: "VSAdapterExecutableInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "command",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "args",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    VsRawAdapterSpawnerService: {
      kind: "interface",
      name: "VsRawAdapterSpawnerService",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 23
      },
      constructorArgs: [],
      staticMethods: {},
      instanceMethods: {
        spawnAdapter: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 24
          },
          kind: "function",
          argumentTypes: [{
            name: "adapter",
            type: {
              kind: "named",
              name: "VSAdapterExecutableInfo"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        write: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 30
          },
          kind: "function",
          argumentTypes: [{
            name: "input",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 34
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        }
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 686
      },
      name: "ProcessInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "parentPid",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "pid",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "command",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "commandWithArgs",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getProcessTree: {
      kind: "function",
      name: "getProcessTree",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 39
      },
      type: {
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 39
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "ProcessInfo"
            }
          }
        }
      }
    },
    Adapter: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "main.js",
        line: 17
      },
      name: "Adapter",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "node"
        }, {
          kind: "string-literal",
          value: "python"
        }, {
          kind: "string-literal",
          value: "prepack"
        }, {
          kind: "string-literal",
          value: "react-native"
        }, {
          kind: "string-literal",
          value: "ocaml"
        }, {
          kind: "string-literal",
          value: "hhvm"
        }, {
          kind: "string-literal",
          value: "native_gdb"
        }, {
          kind: "string-literal",
          value: "native_lldb"
        }]
      }
    },
    getAdapterExecutableInfo: {
      kind: "function",
      name: "getAdapterExecutableInfo",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 43
      },
      type: {
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 43
        },
        kind: "function",
        argumentTypes: [{
          name: "adapterType",
          type: {
            kind: "named",
            name: "Adapter"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "VSAdapterExecutableInfo"
          }
        }
      }
    }
  }
});