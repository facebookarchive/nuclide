"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.MultiConnectionAtomCommands = class {
    getConnectionCount() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 69
        },
        name: "MultiConnectionAtomCommands"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getConnectionCount", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "number"
        });
      });
    }

    openFile(arg0, arg1, arg2, arg3) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "line",
        type: {
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          kind: "number"
        }
      }, {
        name: "isWaiting",
        type: {
          kind: "boolean"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 69
        },
        name: "MultiConnectionAtomCommands"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "openFile", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AtomFileEvent"
        });
      }).publish();
    }

    openRemoteFile(arg0, arg1, arg2, arg3) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "uri",
        type: {
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          kind: "number"
        }
      }, {
        name: "isWaiting",
        type: {
          kind: "boolean"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 69
        },
        name: "MultiConnectionAtomCommands"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "openRemoteFile", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AtomFileEvent"
        });
      }).publish();
    }

    addProject(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "projectPath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "newWindow",
        type: {
          kind: "boolean"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 69
        },
        name: "MultiConnectionAtomCommands"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "addProject", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getProjectStates() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 69
        },
        name: "MultiConnectionAtomCommands"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getProjectStates", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "ProjectState"
          }
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.getAtomCommands = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("CommandService/getAtomCommands", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "MultiConnectionAtomCommands"
      });
    });
  };

  remoteModule.getConnectionDetails = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("CommandService/getConnectionDetails", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "ConnectionDetails"
        }
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
    AtomFileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 24
      },
      name: "AtomFileEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "open"
        }, {
          kind: "string-literal",
          value: "close"
        }]
      }
    },
    ProjectState: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 15
      },
      name: "ProjectState",
      definition: {
        kind: "object",
        fields: [{
          name: "rootFolders",
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
    MultiConnectionAtomCommands: {
      kind: "interface",
      name: "MultiConnectionAtomCommands",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 69
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        getConnectionCount: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 71
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "number"
            }
          }
        },
        openFile: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 77
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "line",
            type: {
              kind: "number"
            }
          }, {
            name: "column",
            type: {
              kind: "number"
            }
          }, {
            name: "isWaiting",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "AtomFileEvent"
            }
          }
        },
        openRemoteFile: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 89
          },
          kind: "function",
          argumentTypes: [{
            name: "uri",
            type: {
              kind: "string"
            }
          }, {
            name: "line",
            type: {
              kind: "number"
            }
          }, {
            name: "column",
            type: {
              kind: "number"
            }
          }, {
            name: "isWaiting",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "AtomFileEvent"
            }
          }
        },
        addProject: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 105
          },
          kind: "function",
          argumentTypes: [{
            name: "projectPath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "newWindow",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getProjectStates: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 111
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "ProjectState"
              }
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 113
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    getAtomCommands: {
      kind: "function",
      name: "getAtomCommands",
      location: {
        type: "source",
        fileName: "CommandService.js",
        line: 21
      },
      type: {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 21
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "MultiConnectionAtomCommands"
          }
        }
      }
    },
    ConnectionDetails: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 116
      },
      name: "ConnectionDetails",
      definition: {
        kind: "object",
        fields: [{
          name: "port",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "family",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getConnectionDetails: {
      kind: "function",
      name: "getConnectionDetails",
      location: {
        type: "source",
        fileName: "CommandService.js",
        line: 25
      },
      type: {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 25
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "ConnectionDetails"
            }
          }
        }
      }
    }
  }
});