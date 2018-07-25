"use strict";

module.exports = _client => {
  const remoteModule = {};
  remoteModule.VsRawAdapterSpawnerService = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    spawnAdapter(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 24
        },
        name: "VsRawAdapterSpawnerService"
      }), "spawnAdapter", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "adapter",
        type: {
          kind: "named",
          name: "VSAdapterExecutableInfo"
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    write(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 24
        },
        name: "VsRawAdapterSpawnerService"
      }), "write", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "input",
        type: {
          kind: "string"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.createVsRawAdapterSpawnerService = function () {
    return _client.callRemoteFunction("VSCodeDebuggerAdapterService/createVsRawAdapterSpawnerService", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "VsRawAdapterSpawnerService"
      });
    });
  };

  remoteModule.getProcessTree = function () {
    return _client.callRemoteFunction("VSCodeDebuggerAdapterService/getProcessTree", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "ProcessInfo"
        }
      });
    });
  };

  remoteModule.getBuckRootFromUri = function (arg0) {
    return _client.callRemoteFunction("VSCodeDebuggerAdapterService/getBuckRootFromUri", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "uri",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.getBuckRootFromPid = function (arg0) {
    return _client.callRemoteFunction("VSCodeDebuggerAdapterService/getBuckRootFromPid", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "pid",
      type: {
        kind: "number"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.realpath = function (arg0) {
    return _client.callRemoteFunction("VSCodeDebuggerAdapterService/realpath", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.getAdapterExecutableInfo = function (arg0) {
    return _client.callRemoteFunction("VSCodeDebuggerAdapterService/getAdapterExecutableInfo", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "adapterType",
      type: {
        kind: "named",
        name: "VsAdapterType"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "VSAdapterExecutableInfo"
      });
    });
  };

  return remoteModule;
};

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
        line: 666
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
        line: 672
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
        line: 38
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
        line: 24
      },
      staticMethods: {},
      instanceMethods: {
        spawnAdapter: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 25
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
            line: 31
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
            line: 35
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
    createVsRawAdapterSpawnerService: {
      kind: "function",
      name: "createVsRawAdapterSpawnerService",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 40
      },
      type: {
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 40
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "VsRawAdapterSpawnerService"
          }
        }
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 689
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
        line: 46
      },
      type: {
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 46
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
    getBuckRootFromUri: {
      kind: "function",
      name: "getBuckRootFromUri",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 50
      },
      type: {
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 50
        },
        kind: "function",
        argumentTypes: [{
          name: "uri",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    getBuckRootFromPid: {
      kind: "function",
      name: "getBuckRootFromPid",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 73
      },
      type: {
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 73
        },
        kind: "function",
        argumentTypes: [{
          name: "pid",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    realpath: {
      kind: "function",
      name: "realpath",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 82
      },
      type: {
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 82
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    VsAdapterType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 45
      },
      name: "VsAdapterType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "hhvm"
        }, {
          kind: "string-literal",
          value: "python"
        }, {
          kind: "string-literal",
          value: "node"
        }, {
          kind: "string-literal",
          value: "java"
        }, {
          kind: "string-literal",
          value: "java_android"
        }, {
          kind: "string-literal",
          value: "react-native"
        }, {
          kind: "string-literal",
          value: "prepack"
        }, {
          kind: "string-literal",
          value: "ocaml"
        }, {
          kind: "string-literal",
          value: "mobilejs"
        }, {
          kind: "string-literal",
          value: "native_lldb"
        }, {
          kind: "string-literal",
          value: "native_gdb"
        }]
      }
    },
    getAdapterExecutableInfo: {
      kind: "function",
      name: "getAdapterExecutableInfo",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 86
      },
      type: {
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 86
        },
        kind: "function",
        argumentTypes: [{
          name: "adapterType",
          type: {
            kind: "named",
            name: "VsAdapterType"
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