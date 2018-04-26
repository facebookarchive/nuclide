"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.Unregister = class {
    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.FileNotifier = class {
    onFileEvent(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "event",
        type: {
          kind: "named",
          name: "FileEvent"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "FileNotifier"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "onFileEvent", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    onDirectoriesChanged(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "openDirectories",
        type: {
          kind: "set",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "FileNotifier"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "onDirectoriesChanged", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getTotalBufferSize() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "FileNotifier"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getTotalBufferSize", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "number"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.AtomCommands = class {
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
          line: 31
        },
        name: "AtomCommands"
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
          line: 31
        },
        name: "AtomCommands"
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
          line: 31
        },
        name: "AtomCommands"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "addProject", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getProjectState() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 31
        },
        name: "AtomCommands"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getProjectState", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "ProjectState"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.registerAtomCommands = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileNotifier",
      type: {
        kind: "named",
        name: "FileNotifier"
      }
    }, {
      name: "atomCommands",
      type: {
        kind: "named",
        name: "AtomCommands"
      }
    }]).then(args => {
      return _client.callRemoteFunction("RemoteCommandService/registerAtomCommands", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Unregister"
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
    Unregister: {
      kind: "interface",
      name: "Unregister",
      location: {
        type: "source",
        fileName: "RemoteCommandService.js",
        line: 24
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        dispose: {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 25
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    FileVersion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 69
      },
      name: "FileVersion",
      definition: {
        kind: "object",
        fields: [{
          name: "notifier",
          type: {
            kind: "named",
            name: "FileNotifier"
          },
          optional: false
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "version",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    FileOpenEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "FileOpenEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "open"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "contents",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "languageId",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileCloseEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 29
      },
      name: "FileCloseEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "close"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }
    },
    FileEditEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 34
      },
      name: "FileEditEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "edit"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "oldRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "newRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "oldText",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "newText",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileSaveEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 43
      },
      name: "FileSaveEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "save"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }
    },
    FileSyncEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 22
      },
      name: "FileSyncEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "sync"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "contents",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "languageId",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 49
      },
      name: "FileEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "open"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "contents",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "languageId",
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
              value: "close"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "edit"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "oldRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "newRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "oldText",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "newText",
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
              value: "save"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "sync"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "contents",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "languageId",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    FileNotifier: {
      kind: "interface",
      name: "FileNotifier",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 62
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        onFileEvent: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 63
          },
          kind: "function",
          argumentTypes: [{
            name: "event",
            type: {
              kind: "named",
              name: "FileEvent"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        onDirectoriesChanged: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 64
          },
          kind: "function",
          argumentTypes: [{
            name: "openDirectories",
            type: {
              kind: "set",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getTotalBufferSize: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 65
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
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 66
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
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
    AtomCommands: {
      kind: "interface",
      name: "AtomCommands",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 31
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        openFile: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
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
            line: 39
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
            line: 52
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
        getProjectState: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 58
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "ProjectState"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 60
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    registerAtomCommands: {
      kind: "function",
      name: "registerAtomCommands",
      location: {
        type: "source",
        fileName: "RemoteCommandService.js",
        line: 31
      },
      type: {
        location: {
          type: "source",
          fileName: "RemoteCommandService.js",
          line: 31
        },
        kind: "function",
        argumentTypes: [{
          name: "fileNotifier",
          type: {
            kind: "named",
            name: "FileNotifier"
          }
        }, {
          name: "atomCommands",
          type: {
            kind: "named",
            name: "AtomCommands"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "Unregister"
          }
        }
      }
    }
  }
});