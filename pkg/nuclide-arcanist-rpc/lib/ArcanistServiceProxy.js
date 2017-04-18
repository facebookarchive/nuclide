"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.findArcConfigDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 57
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcConfigDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 57
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 57
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.readArcConfig = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 65
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/readArcConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 65
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 65
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.getArcConfigKey = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 81
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "key",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 82
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getArcConfigKey", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 83
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 83
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findArcProjectIdOfPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 91
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdOfPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 91
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 91
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findArcProjectIdAndDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 96
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdAndDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 96
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 96
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 97
            },
            name: "projectId",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 97
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 98
            },
            name: "directory",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 98
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }]
        }
      });
    });
  };

  remoteModule.getProjectRelativePath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 111
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getProjectRelativePath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 111
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 111
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findDiagnostics = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 117
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "skip",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 118
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 118
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findDiagnostics", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 119
        },
        kind: "named",
        name: "ArcDiagnostic"
      });
    }).publish();
  };

  remoteModule.createPhabricatorRevision = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 230
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "isPrepareMode",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 231
        },
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 232
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 232
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/createPhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 233
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 233
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 233
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 233
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 233
            },
            kind: "string"
          },
          optional: true
        }]
      });
    }).publish();
  };

  remoteModule.updatePhabricatorRevision = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 239
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "message",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 240
        },
        kind: "string"
      }
    }, {
      name: "allowUntracked",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 241
        },
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 242
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 242
          },
          kind: "string"
        }
      }
    }, {
      name: "verbatimModeEnabled",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 243
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/updatePhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 244
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 244
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 244
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 244
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 244
            },
            kind: "string"
          },
          optional: true
        }]
      });
    }).publish();
  };

  remoteModule.execArcPull = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 258
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "fetchLatest",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 259
        },
        kind: "boolean"
      }
    }, {
      name: "allowDirtyChanges",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 260
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcPull", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 261
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.execArcLand = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 281
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcLand", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 282
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.execArcPatch = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 294
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "differentialRevision",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 295
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcPatch", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 296
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
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
    ArcDiagnostic: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 41
      },
      name: "ArcDiagnostic",
      definition: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 41
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 42
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 42
            },
            kind: "union",
            types: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 42
              },
              kind: "string-literal",
              value: "Error"
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 42
              },
              kind: "string-literal",
              value: "Warning"
            }]
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 43
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 43
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 44
          },
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 44
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 45
          },
          name: "row",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 45
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 46
          },
          name: "col",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 46
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 47
          },
          name: "code",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 47
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 47
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 50
          },
          name: "original",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 50
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 51
          },
          name: "replacement",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 51
            },
            kind: "string"
          },
          optional: true
        }]
      }
    },
    findArcConfigDirectory: {
      kind: "function",
      name: "findArcConfigDirectory",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 57
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 57
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 57
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 57
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 57
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 57
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    readArcConfig: {
      kind: "function",
      name: "readArcConfig",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 65
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 65
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 65
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 65
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 65
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 65
              },
              kind: "any"
            }
          }
        }
      }
    },
    getArcConfigKey: {
      kind: "function",
      name: "getArcConfigKey",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 80
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 80
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 81
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "key",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 82
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 83
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 83
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 83
              },
              kind: "string"
            }
          }
        }
      }
    },
    findArcProjectIdOfPath: {
      kind: "function",
      name: "findArcProjectIdOfPath",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 91
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 91
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 91
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 91
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 91
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 91
              },
              kind: "string"
            }
          }
        }
      }
    },
    findArcProjectIdAndDirectory: {
      kind: "function",
      name: "findArcProjectIdAndDirectory",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 96
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 96
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 96
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 96
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 96
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 96
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 97
                },
                name: "projectId",
                type: {
                  location: {
                    type: "source",
                    fileName: "ArcanistService.js",
                    line: 97
                  },
                  kind: "string"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 98
                },
                name: "directory",
                type: {
                  location: {
                    type: "source",
                    fileName: "ArcanistService.js",
                    line: 98
                  },
                  kind: "named",
                  name: "NuclideUri"
                },
                optional: false
              }]
            }
          }
        }
      }
    },
    getProjectRelativePath: {
      kind: "function",
      name: "getProjectRelativePath",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 111
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 111
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 111
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 111
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 111
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 111
              },
              kind: "string"
            }
          }
        }
      }
    },
    findDiagnostics: {
      kind: "function",
      name: "findDiagnostics",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 116
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 116
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 117
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "skip",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 118
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 118
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 119
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 119
            },
            kind: "named",
            name: "ArcDiagnostic"
          }
        }
      }
    },
    createPhabricatorRevision: {
      kind: "function",
      name: "createPhabricatorRevision",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 229
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 229
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 230
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "isPrepareMode",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 231
            },
            kind: "boolean"
          }
        }, {
          name: "lintExcuse",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 232
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 232
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 233
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 233
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 233
              },
              name: "stderr",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 233
                },
                kind: "string"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 233
              },
              name: "stdout",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 233
                },
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }
    },
    updatePhabricatorRevision: {
      kind: "function",
      name: "updatePhabricatorRevision",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 238
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 238
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 239
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 240
            },
            kind: "string"
          }
        }, {
          name: "allowUntracked",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 241
            },
            kind: "boolean"
          }
        }, {
          name: "lintExcuse",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 242
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 242
              },
              kind: "string"
            }
          }
        }, {
          name: "verbatimModeEnabled",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 243
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 244
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 244
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 244
              },
              name: "stderr",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 244
                },
                kind: "string"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 244
              },
              name: "stdout",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 244
                },
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }
    },
    execArcPull: {
      kind: "function",
      name: "execArcPull",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 257
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 257
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 258
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "fetchLatest",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 259
            },
            kind: "boolean"
          }
        }, {
          name: "allowDirtyChanges",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 260
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 261
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 261
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    execArcLand: {
      kind: "function",
      name: "execArcLand",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 280
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 280
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 281
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 282
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 282
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    execArcPatch: {
      kind: "function",
      name: "execArcPatch",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 293
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 293
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 294
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "differentialRevision",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 295
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 296
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 296
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 17
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 21
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 21
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 24
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 25
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 25
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
                kind: "string"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 27
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 29
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 29
              },
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 32
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 32
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 34
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 34
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 35
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 35
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});