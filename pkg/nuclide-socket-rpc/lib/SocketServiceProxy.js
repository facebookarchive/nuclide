"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.IRemoteSocket = class {
    write(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "msg",
        type: {
          kind: "named",
          name: "Buffer"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "types.js",
          line: 31
        },
        name: "IRemoteSocket"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "write", "void", args));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.Connection = class {
    constructor(arg0, arg1) {
      _client.createRemoteObject("Connection", this, [arg0, arg1], [{
        name: "tunnelHost",
        type: {
          kind: "named",
          name: "TunnelHost"
        }
      }, {
        name: "remoteSocket",
        type: {
          kind: "named",
          name: "IRemoteSocket"
        }
      }]);
    }

    write(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "msg",
        type: {
          kind: "named",
          name: "Buffer"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "Connection.js",
          line: 17
        },
        name: "Connection"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "write", "void", args));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.ConnectionFactory = class {
    constructor() {
      _client.createRemoteObject("ConnectionFactory", this, [], []);
    }

    createConnection(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "tunnelHost",
        type: {
          kind: "named",
          name: "TunnelHost"
        }
      }, {
        name: "socket",
        type: {
          kind: "named",
          name: "IRemoteSocket"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "Connection.js",
          line: 70
        },
        name: "ConnectionFactory"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "createConnection", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "Connection"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.getConnectionFactory = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("SocketService/getConnectionFactory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "ConnectionFactory"
      });
    });
  };

  remoteModule.createTunnel = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "td",
      type: {
        kind: "named",
        name: "TunnelDescriptor"
      }
    }, {
      name: "cf",
      type: {
        kind: "named",
        name: "ConnectionFactory"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("SocketService/createTunnel", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "SocketEvent"
      });
    }).publish();
  };

  remoteModule.getAvailableServerPort = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("SocketService/getAvailableServerPort", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "number"
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
    TunnelHost: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 12
      },
      name: "TunnelHost",
      definition: {
        kind: "object",
        fields: [{
          name: "host",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "port",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "family",
          type: {
            kind: "union",
            types: [{
              kind: "number-literal",
              value: 4
            }, {
              kind: "number-literal",
              value: 6
            }]
          },
          optional: false
        }]
      }
    },
    IRemoteSocket: {
      kind: "interface",
      name: "IRemoteSocket",
      location: {
        type: "source",
        fileName: "types.js",
        line: 31
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        write: {
          location: {
            type: "source",
            fileName: "types.js",
            line: 32
          },
          kind: "function",
          argumentTypes: [{
            name: "msg",
            type: {
              kind: "named",
              name: "Buffer"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "types.js",
            line: 33
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    Connection: {
      kind: "interface",
      name: "Connection",
      location: {
        type: "source",
        fileName: "Connection.js",
        line: 17
      },
      constructorArgs: [{
        name: "tunnelHost",
        type: {
          kind: "named",
          name: "TunnelHost"
        }
      }, {
        name: "remoteSocket",
        type: {
          kind: "named",
          name: "IRemoteSocket"
        }
      }],
      staticMethods: {},
      instanceMethods: {
        write: {
          location: {
            type: "source",
            fileName: "Connection.js",
            line: 60
          },
          kind: "function",
          argumentTypes: [{
            name: "msg",
            type: {
              kind: "named",
              name: "Buffer"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "Connection.js",
            line: 64
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    ConnectionFactory: {
      kind: "interface",
      name: "ConnectionFactory",
      location: {
        type: "source",
        fileName: "Connection.js",
        line: 70
      },
      constructorArgs: [],
      staticMethods: {},
      instanceMethods: {
        createConnection: {
          location: {
            type: "source",
            fileName: "Connection.js",
            line: 73
          },
          kind: "function",
          argumentTypes: [{
            name: "tunnelHost",
            type: {
              kind: "named",
              name: "TunnelHost"
            }
          }, {
            name: "socket",
            type: {
              kind: "named",
              name: "IRemoteSocket"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "Connection"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "Connection.js",
            line: 80
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    getConnectionFactory: {
      kind: "function",
      name: "getConnectionFactory",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 24
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 24
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "ConnectionFactory"
          }
        }
      }
    },
    SocketEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 23
      },
      name: "SocketEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "server_started"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "client_connected"
            },
            optional: false
          }, {
            name: "clientPort",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "client_disconnected"
            },
            optional: false
          }, {
            name: "clientPort",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    TunnelDescriptor: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 18
      },
      name: "TunnelDescriptor",
      definition: {
        kind: "object",
        fields: [{
          name: "from",
          type: {
            kind: "named",
            name: "TunnelHost"
          },
          optional: false
        }, {
          name: "to",
          type: {
            kind: "named",
            name: "TunnelHost"
          },
          optional: false
        }]
      }
    },
    createTunnel: {
      kind: "function",
      name: "createTunnel",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 28
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 28
        },
        kind: "function",
        argumentTypes: [{
          name: "td",
          type: {
            kind: "named",
            name: "TunnelDescriptor"
          }
        }, {
          name: "cf",
          type: {
            kind: "named",
            name: "ConnectionFactory"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "SocketEvent"
          }
        }
      }
    },
    getAvailableServerPort: {
      kind: "function",
      name: "getAvailableServerPort",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 35
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 35
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "number"
          }
        }
      }
    }
  }
});