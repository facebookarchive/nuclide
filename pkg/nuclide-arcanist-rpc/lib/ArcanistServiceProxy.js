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
          line: 62
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
          line: 63
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 63
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
          line: 74
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
          line: 74
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 74
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
          line: 93
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
          line: 94
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
          line: 95
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 95
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
          line: 102
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
          line: 103
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 103
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
          line: 109
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
          line: 110
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 110
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 111
            },
            name: "projectId",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 111
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 112
            },
            name: "directory",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 112
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
          line: 126
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
          line: 127
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 127
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
          line: 133
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
          line: 134
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 134
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
          line: 135
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
          line: 257
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
          line: 258
        },
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 259
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 259
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
          line: 260
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 260
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 260
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 260
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 260
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
          line: 266
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
          line: 267
        },
        kind: "string"
      }
    }, {
      name: "allowUntracked",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 268
        },
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 269
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 269
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
          line: 270
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
          line: 271
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 271
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 271
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 271
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 271
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
          line: 282
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
          line: 283
        },
        kind: "boolean"
      }
    }, {
      name: "allowDirtyChanges",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 284
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
          line: 285
        },
        kind: "named",
        name: "LegacyProcessMessage"
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
          line: 308
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
          line: 309
        },
        kind: "named",
        name: "LegacyProcessMessage"
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
          line: 324
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
          line: 325
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
          line: 326
        },
        kind: "named",
        name: "LegacyProcessMessage"
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
        line: 42
      },
      name: "ArcDiagnostic",
      definition: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 42
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 43
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 43
            },
            kind: "union",
            types: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 43
              },
              kind: "string-literal",
              value: "Error"
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 43
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
            line: 44
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 44
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 45
          },
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 45
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 46
          },
          name: "row",
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
          name: "col",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 47
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 48
          },
          name: "code",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 48
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 48
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 51
          },
          name: "original",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 51
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 52
          },
          name: "replacement",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 52
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
        line: 61
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 61
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 62
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 63
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 63
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 63
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
        line: 74
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 74
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 74
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 74
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 74
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 74
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
        line: 92
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 92
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 93
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
              line: 94
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 95
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 95
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 95
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
        line: 101
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 101
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 102
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 103
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 103
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 103
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
        line: 108
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 108
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 109
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 110
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 110
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 110
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 111
                },
                name: "projectId",
                type: {
                  location: {
                    type: "source",
                    fileName: "ArcanistService.js",
                    line: 111
                  },
                  kind: "string"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 112
                },
                name: "directory",
                type: {
                  location: {
                    type: "source",
                    fileName: "ArcanistService.js",
                    line: 112
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
        line: 125
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 125
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 126
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 127
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 127
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 127
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
        line: 132
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 132
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 133
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
              line: 134
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 134
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 135
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 135
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
        line: 256
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 256
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 257
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
              line: 258
            },
            kind: "boolean"
          }
        }, {
          name: "lintExcuse",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 259
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 259
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 260
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 260
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 260
              },
              name: "stderr",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 260
                },
                kind: "string"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 260
              },
              name: "stdout",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 260
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
        line: 265
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 265
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 266
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
              line: 267
            },
            kind: "string"
          }
        }, {
          name: "allowUntracked",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 268
            },
            kind: "boolean"
          }
        }, {
          name: "lintExcuse",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 269
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 269
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
              line: 270
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 271
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 271
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 271
              },
              name: "stderr",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 271
                },
                kind: "string"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 271
              },
              name: "stdout",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 271
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
        line: 281
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 281
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 282
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
              line: 283
            },
            kind: "boolean"
          }
        }, {
          name: "allowDirtyChanges",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 284
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 285
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 285
            },
            kind: "named",
            name: "LegacyProcessMessage"
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
        line: 307
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 307
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 308
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 309
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 309
            },
            kind: "named",
            name: "LegacyProcessMessage"
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
        line: 323
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 323
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 324
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
              line: 325
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 326
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 326
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 14
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "exitCode",
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
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 17
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
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
        fileName: "process-rpc-types.js",
        line: 21
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 22
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 26
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "exitCode",
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
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 17
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 34
      },
      name: "LegacyProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 35
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 26
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "exitCode",
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
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 17
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 36
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 36
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 36
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
        line: 38
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 38
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 39
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 39
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 40
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 40
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 41
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 41
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    Level: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 44
      },
      name: "Level",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 44
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "info"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "log"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "warning"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "error"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "debug"
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "success"
        }]
      }
    },
    Message: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 45
      },
      name: "Message",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 45
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 45
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 45
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 45
          },
          name: "level",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 45
            },
            kind: "named",
            name: "Level"
          },
          optional: false
        }]
      }
    },
    MessageEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 47
      },
      name: "MessageEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 47
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 48
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 48
            },
            kind: "string-literal",
            value: "message"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 49
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 49
            },
            kind: "named",
            name: "Message"
          },
          optional: false
        }]
      }
    },
    ProgressEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 52
      },
      name: "ProgressEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 52
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 53
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 53
            },
            kind: "string-literal",
            value: "progress"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 54
          },
          name: "progress",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 54
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 54
              },
              kind: "number"
            }
          },
          optional: false
        }]
      }
    },
    ResultEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 57
      },
      name: "ResultEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 57
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 58
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 58
            },
            kind: "string-literal",
            value: "result"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 59
          },
          name: "result",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 59
            },
            kind: "mixed"
          },
          optional: false
        }]
      }
    },
    StatusEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 62
      },
      name: "StatusEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 62
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 63
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 63
            },
            kind: "string-literal",
            value: "status"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 64
          },
          name: "status",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 64
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 64
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    TaskEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 67
      },
      name: "TaskEvent",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 68
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 47
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 48
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 48
              },
              kind: "string-literal",
              value: "message"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 49
            },
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 49
              },
              kind: "named",
              name: "Message"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 52
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 53
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 53
              },
              kind: "string-literal",
              value: "progress"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 54
            },
            name: "progress",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 54
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 54
                },
                kind: "number"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 57
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 58
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 58
              },
              kind: "string-literal",
              value: "result"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 59
            },
            name: "result",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 59
              },
              kind: "mixed"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 62
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 63
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 63
              },
              kind: "string-literal",
              value: "status"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 64
            },
            name: "status",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 64
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 64
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    }
  }
});