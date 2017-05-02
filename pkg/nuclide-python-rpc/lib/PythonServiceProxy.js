"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.initialize = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileNotifier",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 136
        },
        kind: "named",
        name: "FileNotifier"
      }
    }, {
      name: "config",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 137
        },
        kind: "named",
        name: "PythonServiceConfig"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/initialize", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 138
        },
        kind: "named",
        name: "LanguageService"
      });
    });
  };

  remoteModule.getReferences = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 371
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 372
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 373
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 374
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/getReferences", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 375
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 375
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 375
            },
            kind: "named",
            name: "PythonReference"
          }
        }
      });
    });
  };

  remoteModule.getDiagnostics = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 384
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 385
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/getDiagnostics", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 386
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 386
          },
          kind: "named",
          name: "PythonDiagnostic"
        }
      });
    });
  };

  remoteModule.FileNotifier = class {
    onFileEvent(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "event",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          kind: "named",
          name: "FileEvent"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          name: "FileNotifier"
        }).then(id => {
          return _client.callRemoteMethod(id, "onFileEvent", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          kind: "void"
        });
      });
    }

    onDirectoriesChanged(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "openDirectories",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 52
          },
          kind: "set",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 52
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          name: "FileNotifier"
        }).then(id => {
          return _client.callRemoteMethod(id, "onDirectoriesChanged", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 52
          },
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.LanguageService = class {
    getDiagnostics(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 72
          },
          kind: "named",
          name: "FileVersion"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getDiagnostics", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 72
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 72
            },
            kind: "named",
            name: "DiagnosticProviderUpdate"
          }
        });
      });
    }

    observeDiagnostics() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "observeDiagnostics", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 74
          },
          kind: "named",
          name: "FileDiagnosticUpdate"
        });
      }).publish();
    }

    getAutocompleteSuggestions(arg0, arg1, arg2, arg3) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 77
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 78
          },
          kind: "named",
          name: "atom$Point"
        }
      }, {
        name: "activatedManually",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 79
          },
          kind: "boolean"
        }
      }, {
        name: "prefix",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 80
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getAutocompleteSuggestions", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 81
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 81
            },
            kind: "named",
            name: "AutocompleteResult"
          }
        });
      });
    }

    getDefinition(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 84
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 85
          },
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getDefinition", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 86
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 86
            },
            kind: "named",
            name: "DefinitionQueryResult"
          }
        });
      });
    }

    getDefinitionById(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 88
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "id",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 88
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getDefinitionById", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 88
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 88
            },
            kind: "named",
            name: "Definition"
          }
        });
      });
    }

    findReferences(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 91
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 92
          },
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "findReferences", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 93
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 93
            },
            kind: "named",
            name: "FindReferencesReturn"
          }
        });
      });
    }

    getCoverage(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 95
          },
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getCoverage", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 95
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 95
            },
            kind: "named",
            name: "CoverageResult"
          }
        });
      });
    }

    getOutline(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 97
          },
          kind: "named",
          name: "FileVersion"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getOutline", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 97
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 97
            },
            kind: "named",
            name: "Outline"
          }
        });
      });
    }

    typeHint(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 99
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 99
          },
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "typeHint", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 99
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 99
            },
            kind: "named",
            name: "TypeHint"
          }
        });
      });
    }

    highlight(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 102
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 103
          },
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "highlight", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 104
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 104
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 104
              },
              kind: "named",
              name: "atom$Range"
            }
          }
        });
      });
    }

    formatSource(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 107
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 108
          },
          kind: "named",
          name: "atom$Range"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "formatSource", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 109
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 109
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 109
              },
              kind: "named",
              name: "TextEdit"
            }
          }
        });
      });
    }

    formatEntireFile(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 112
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 113
          },
          kind: "named",
          name: "atom$Range"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "formatEntireFile", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 115
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 115
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 116
              },
              name: "newCursor",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 116
                },
                kind: "number"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 117
              },
              name: "formatted",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 117
                },
                kind: "string"
              },
              optional: false
            }]
          }
        });
      });
    }

    getEvaluationExpression(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 122
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 123
          },
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getEvaluationExpression", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 124
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 124
            },
            kind: "named",
            name: "NuclideEvaluationExpression"
          }
        });
      });
    }

    supportsSymbolSearch(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "directories",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 126
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 126
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "supportsSymbolSearch", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 126
          },
          kind: "boolean"
        });
      });
    }

    symbolSearch(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "query",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 129
          },
          kind: "string"
        }
      }, {
        name: "directories",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 130
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 130
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "symbolSearch", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 131
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 131
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 131
              },
              kind: "named",
              name: "SymbolResult"
            }
          }
        });
      });
    }

    getProjectRoot(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 133
          },
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getProjectRoot", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 133
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 133
            },
            kind: "named",
            name: "NuclideUri"
          }
        });
      });
    }

    isFileInProject(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 135
          },
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 71
          },
          name: "LanguageService"
        }).then(id => {
          return _client.callRemoteMethod(id, "isFileInProject", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 135
          },
          kind: "boolean"
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
    PythonCompletion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 55
      },
      name: "PythonCompletion",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 55
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 56
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 56
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 57
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 57
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 58
          },
          name: "description",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 58
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 59
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 59
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 59
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    PythonDefinition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 62
      },
      name: "PythonDefinition",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 62
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 63
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 63
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 64
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 64
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 65
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 65
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 66
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 66
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 67
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 67
            },
            kind: "number"
          },
          optional: false
        }]
      }
    },
    PythonReference: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 70
      },
      name: "PythonReference",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 70
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 71
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 71
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 72
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 72
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 73
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 73
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 74
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 74
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 75
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 75
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 76
          },
          name: "parentName",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 76
            },
            kind: "string"
          },
          optional: true
        }]
      }
    },
    Position: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 79
      },
      name: "Position",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 79
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 80
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 80
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 81
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 81
            },
            kind: "number"
          },
          optional: false
        }]
      }
    },
    PythonFunctionItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 84
      },
      name: "PythonFunctionItem",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 84
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 85
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 85
            },
            kind: "string-literal",
            value: "function"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 86
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 86
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 87
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 87
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 88
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 88
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 89
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 89
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 89
              },
              kind: "named",
              name: "PythonOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 90
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 90
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 91
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 91
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 91
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    PythonClassItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 94
      },
      name: "PythonClassItem",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 94
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 95
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 95
            },
            kind: "string-literal",
            value: "class"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 96
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 96
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 97
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 97
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 98
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 98
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 99
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 99
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 99
              },
              kind: "named",
              name: "PythonOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 100
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 100
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 102
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 102
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 102
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    PythonStatementItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 105
      },
      name: "PythonStatementItem",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 105
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 106
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 106
            },
            kind: "string-literal",
            value: "statement"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 107
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 107
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 108
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 108
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 109
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 109
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 110
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 110
            },
            kind: "string"
          },
          optional: true
        }]
      }
    },
    PythonOutlineItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 113
      },
      name: "PythonOutlineItem",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 114
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 84
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 85
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 85
              },
              kind: "string-literal",
              value: "function"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 86
            },
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 86
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 87
            },
            name: "start",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 87
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 88
            },
            name: "end",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 88
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 89
            },
            name: "children",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 89
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "PythonService.js",
                  line: 89
                },
                kind: "named",
                name: "PythonOutlineItem"
              }
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 90
            },
            name: "docblock",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 90
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 91
            },
            name: "params",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 91
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "PythonService.js",
                  line: 91
                },
                kind: "string"
              }
            },
            optional: true
          }]
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 94
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 95
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 95
              },
              kind: "string-literal",
              value: "class"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 96
            },
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 96
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 97
            },
            name: "start",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 97
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 98
            },
            name: "end",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 98
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 99
            },
            name: "children",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 99
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "PythonService.js",
                  line: 99
                },
                kind: "named",
                name: "PythonOutlineItem"
              }
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 100
            },
            name: "docblock",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 100
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 102
            },
            name: "params",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 102
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "PythonService.js",
                  line: 102
                },
                kind: "string"
              }
            },
            optional: true
          }]
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 105
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 106
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 106
              },
              kind: "string-literal",
              value: "statement"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 107
            },
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 107
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 108
            },
            name: "start",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 108
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 109
            },
            name: "end",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 109
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 110
            },
            name: "docblock",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 110
              },
              kind: "string"
            },
            optional: true
          }]
        }],
        discriminantField: "kind"
      }
    },
    PythonDiagnostic: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 118
      },
      name: "PythonDiagnostic",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 118
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 119
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 119
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 120
          },
          name: "code",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 120
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 121
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 121
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 122
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 122
            },
            kind: "named",
            name: "MessageType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 123
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 123
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 124
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 124
            },
            kind: "number"
          },
          optional: false
        }]
      }
    },
    PythonServiceConfig: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 127
      },
      name: "PythonServiceConfig",
      definition: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 127
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 128
          },
          name: "showGlobalVariables",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 128
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 129
          },
          name: "autocompleteArguments",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 129
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 130
          },
          name: "includeOptionalArguments",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 130
            },
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    initialize: {
      kind: "function",
      name: "initialize",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 135
      },
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 135
        },
        kind: "function",
        argumentTypes: [{
          name: "fileNotifier",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 136
            },
            kind: "named",
            name: "FileNotifier"
          }
        }, {
          name: "config",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 137
            },
            kind: "named",
            name: "PythonServiceConfig"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 138
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 138
            },
            kind: "named",
            name: "LanguageService"
          }
        }
      }
    },
    getReferences: {
      kind: "function",
      name: "getReferences",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 370
      },
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 370
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 371
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 372
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 373
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 374
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 375
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 375
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 375
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "PythonService.js",
                  line: 375
                },
                kind: "named",
                name: "PythonReference"
              }
            }
          }
        }
      }
    },
    getDiagnostics: {
      kind: "function",
      name: "getDiagnostics",
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 383
      },
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 383
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 384
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 385
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 386
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 386
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 386
              },
              kind: "named",
              name: "PythonDiagnostic"
            }
          }
        }
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            kind: "string-literal",
            value: "open"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            kind: "string"
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
        line: 21
      },
      name: "FileSyncEvent",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "string-literal",
            value: "sync"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
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
        line: 27
      },
      name: "FileCloseEvent",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "string-literal",
            value: "close"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
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
        line: 32
      },
      name: "FileEditEvent",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 32
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "string-literal",
            value: "edit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          name: "oldRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          name: "newRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          name: "oldText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 38
          },
          name: "newText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 38
            },
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
        line: 42
      },
      name: "FileEvent",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 43
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "open"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 16
              },
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            name: "contents",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 17
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 28
              },
              kind: "string-literal",
              value: "close"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 29
              },
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 33
              },
              kind: "string-literal",
              value: "edit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 34
              },
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            name: "oldRange",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 35
              },
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            name: "newRange",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 36
              },
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            name: "oldText",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 37
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 38
            },
            name: "newText",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 38
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "sync"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 23
              },
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            name: "contents",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 24
              },
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    LocalFileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 48
      },
      name: "LocalFileEvent",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 48
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "open"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 16
              },
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            name: "contents",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 17
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 28
              },
              kind: "string-literal",
              value: "close"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 29
              },
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 33
              },
              kind: "string-literal",
              value: "edit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 34
              },
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            name: "oldRange",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 35
              },
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            name: "newRange",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 36
              },
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            name: "oldText",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 37
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 38
            },
            name: "newText",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 38
              },
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
        line: 50
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        onFileEvent: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          kind: "function",
          argumentTypes: [{
            name: "event",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 51
              },
              kind: "named",
              name: "FileEvent"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 51
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 51
              },
              kind: "void"
            }
          }
        },
        onDirectoriesChanged: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 52
          },
          kind: "function",
          argumentTypes: [{
            name: "openDirectories",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 52
              },
              kind: "set",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 52
                },
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 52
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 52
              },
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 53
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 53
            },
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
        line: 56
      },
      name: "FileVersion",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 56
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 57
          },
          name: "notifier",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 57
            },
            kind: "named",
            name: "FileNotifier"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 58
          },
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 58
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 59
          },
          name: "version",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 59
            },
            kind: "number"
          },
          optional: false
        }]
      }
    },
    Completion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 35
      },
      name: "Completion",
      definition: {
        location: {
          type: "source",
          fileName: "LanguageService.js",
          line: 35
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 36
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 36
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 37
          },
          name: "snippet",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 37
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 38
          },
          name: "displayText",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 38
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 39
          },
          name: "replacementPrefix",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 39
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 40
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 40
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 40
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 41
          },
          name: "leftLabel",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 41
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 41
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 42
          },
          name: "leftLabelHTML",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 42
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 42
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 43
          },
          name: "rightLabel",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 43
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 43
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 44
          },
          name: "rightLabelHTML",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 44
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 44
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 45
          },
          name: "className",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 45
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 45
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 46
          },
          name: "iconHTML",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 46
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 46
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 47
          },
          name: "description",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 47
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 47
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 48
          },
          name: "descriptionMoreURL",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 48
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 48
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 49
          },
          name: "extraData",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 49
            },
            kind: "mixed"
          },
          optional: true
        }]
      }
    },
    AutocompleteResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 56
      },
      name: "AutocompleteResult",
      definition: {
        location: {
          type: "source",
          fileName: "LanguageService.js",
          line: 56
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 57
          },
          name: "isIncomplete",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 57
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 58
          },
          name: "items",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 58
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 58
              },
              kind: "named",
              name: "Completion"
            }
          },
          optional: false
        }]
      }
    },
    SymbolResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 61
      },
      name: "SymbolResult",
      definition: {
        location: {
          type: "source",
          fileName: "LanguageService.js",
          line: 61
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 62
          },
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 62
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 63
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 63
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 64
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 64
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 65
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 65
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 66
          },
          name: "containerName",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 66
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 66
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 67
          },
          name: "icon",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 67
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 67
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 68
          },
          name: "hoverText",
          type: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 68
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 68
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    LanguageService: {
      kind: "interface",
      name: "LanguageService",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 71
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        getDiagnostics: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 72
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 72
              },
              kind: "named",
              name: "FileVersion"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 72
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 72
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 72
                },
                kind: "named",
                name: "DiagnosticProviderUpdate"
              }
            }
          }
        },
        observeDiagnostics: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 74
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 74
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 74
              },
              kind: "named",
              name: "FileDiagnosticUpdate"
            }
          }
        },
        getAutocompleteSuggestions: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 76
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 77
              },
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 78
              },
              kind: "named",
              name: "atom$Point"
            }
          }, {
            name: "activatedManually",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 79
              },
              kind: "boolean"
            }
          }, {
            name: "prefix",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 80
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 81
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 81
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 81
                },
                kind: "named",
                name: "AutocompleteResult"
              }
            }
          }
        },
        getDefinition: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 83
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 84
              },
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 85
              },
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 86
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 86
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 86
                },
                kind: "named",
                name: "DefinitionQueryResult"
              }
            }
          }
        },
        getDefinitionById: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 88
          },
          kind: "function",
          argumentTypes: [{
            name: "file",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 88
              },
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "id",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 88
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 88
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 88
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 88
                },
                kind: "named",
                name: "Definition"
              }
            }
          }
        },
        findReferences: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 90
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 91
              },
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 92
              },
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 93
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 93
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 93
                },
                kind: "named",
                name: "FindReferencesReturn"
              }
            }
          }
        },
        getCoverage: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 95
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 95
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 95
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 95
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 95
                },
                kind: "named",
                name: "CoverageResult"
              }
            }
          }
        },
        getOutline: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 97
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 97
              },
              kind: "named",
              name: "FileVersion"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 97
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 97
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 97
                },
                kind: "named",
                name: "Outline"
              }
            }
          }
        },
        typeHint: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 99
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 99
              },
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 99
              },
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 99
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 99
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 99
                },
                kind: "named",
                name: "TypeHint"
              }
            }
          }
        },
        highlight: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 101
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 102
              },
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 103
              },
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 104
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 104
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 104
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "LanguageService.js",
                    line: 104
                  },
                  kind: "named",
                  name: "atom$Range"
                }
              }
            }
          }
        },
        formatSource: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 106
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 107
              },
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "range",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 108
              },
              kind: "named",
              name: "atom$Range"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 109
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 109
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 109
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "LanguageService.js",
                    line: 109
                  },
                  kind: "named",
                  name: "TextEdit"
                }
              }
            }
          }
        },
        formatEntireFile: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 111
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 112
              },
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "range",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 113
              },
              kind: "named",
              name: "atom$Range"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 114
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 115
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 115
                },
                kind: "object",
                fields: [{
                  location: {
                    type: "source",
                    fileName: "LanguageService.js",
                    line: 116
                  },
                  name: "newCursor",
                  type: {
                    location: {
                      type: "source",
                      fileName: "LanguageService.js",
                      line: 116
                    },
                    kind: "number"
                  },
                  optional: true
                }, {
                  location: {
                    type: "source",
                    fileName: "LanguageService.js",
                    line: 117
                  },
                  name: "formatted",
                  type: {
                    location: {
                      type: "source",
                      fileName: "LanguageService.js",
                      line: 117
                    },
                    kind: "string"
                  },
                  optional: false
                }]
              }
            }
          }
        },
        getEvaluationExpression: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 121
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 122
              },
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 123
              },
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 124
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 124
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 124
                },
                kind: "named",
                name: "NuclideEvaluationExpression"
              }
            }
          }
        },
        supportsSymbolSearch: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 126
          },
          kind: "function",
          argumentTypes: [{
            name: "directories",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 126
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 126
                },
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 126
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 126
              },
              kind: "boolean"
            }
          }
        },
        symbolSearch: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 128
          },
          kind: "function",
          argumentTypes: [{
            name: "query",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 129
              },
              kind: "string"
            }
          }, {
            name: "directories",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 130
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 130
                },
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 131
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 131
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 131
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "LanguageService.js",
                    line: 131
                  },
                  kind: "named",
                  name: "SymbolResult"
                }
              }
            }
          }
        },
        getProjectRoot: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 133
          },
          kind: "function",
          argumentTypes: [{
            name: "fileUri",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 133
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 133
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 133
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "LanguageService.js",
                  line: 133
                },
                kind: "named",
                name: "NuclideUri"
              }
            }
          }
        },
        isFileInProject: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 135
          },
          kind: "function",
          argumentTypes: [{
            name: "fileUri",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 135
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 135
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "LanguageService.js",
                line: 135
              },
              kind: "boolean"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "LanguageService.js",
            line: 137
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "LanguageService.js",
              line: 137
            },
            kind: "void"
          }
        }
      }
    },
    NuclideEvaluationExpression: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "NuclideEvaluationExpression",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 13
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 13
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          name: "expression",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 14
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    TextEdit: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "TextEdit",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 13
          },
          name: "oldRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 13
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          name: "newText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 14
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "oldText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "string"
          },
          optional: true
        }]
      }
    },
    TypeHint: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "TypeHint",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "hint",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    OutlineTree: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "OutlineTree",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "icon",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          name: "plainText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 18
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 19
          },
          name: "tokenizedText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 19
            },
            kind: "named",
            name: "TokenizedText"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
          },
          name: "representativeName",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 20
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "startPosition",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "endPosition",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 24
              },
              kind: "named",
              name: "OutlineTree"
            }
          },
          optional: false
        }]
      }
    },
    Outline: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 27
      },
      name: "Outline",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "outlineTrees",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 28
              },
              kind: "named",
              name: "OutlineTree"
            }
          },
          optional: false
        }]
      }
    },
    TokenKind: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 14
      },
      name: "TokenKind",
      definition: {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 15
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 15
          },
          kind: "string-literal",
          value: "keyword"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 16
          },
          kind: "string-literal",
          value: "class-name"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 17
          },
          kind: "string-literal",
          value: "constructor"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 18
          },
          kind: "string-literal",
          value: "method"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 19
          },
          kind: "string-literal",
          value: "param"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 20
          },
          kind: "string-literal",
          value: "string"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 21
          },
          kind: "string-literal",
          value: "whitespace"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 22
          },
          kind: "string-literal",
          value: "plain"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 23
          },
          kind: "string-literal",
          value: "type"
        }]
      }
    },
    TextToken: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 25
      },
      name: "TextToken",
      definition: {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 25
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 26
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "tokenizedText-rpc-types.js",
              line: 26
            },
            kind: "named",
            name: "TokenKind"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 27
          },
          name: "value",
          type: {
            location: {
              type: "source",
              fileName: "tokenizedText-rpc-types.js",
              line: 27
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    TokenizedText: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 30
      },
      name: "TokenizedText",
      definition: {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 30
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 30
          },
          kind: "named",
          name: "TextToken"
        }
      }
    },
    UncoveredRegion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "UncoveredRegion",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 13
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 13
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 14
            },
            kind: "string"
          },
          optional: true
        }]
      }
    },
    CoverageResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 17
      },
      name: "CoverageResult",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          name: "percentage",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 18
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 19
          },
          name: "uncoveredRegions",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 19
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 19
              },
              kind: "named",
              name: "UncoveredRegion"
            }
          },
          optional: false
        }]
      }
    },
    Reference: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "Reference",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "uri",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 16
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    FindReferencesData: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 20
      },
      name: "FindReferencesData",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "string-literal",
            value: "data"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "baseUri",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "referencedSymbolName",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          name: "references",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 24
              },
              kind: "named",
              name: "Reference"
            }
          },
          optional: false
        }]
      }
    },
    FindReferencesError: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 27
      },
      name: "FindReferencesError",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "string-literal",
            value: "error"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FindReferencesReturn: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 32
      },
      name: "FindReferencesReturn",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 32
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 21
              },
              kind: "string-literal",
              value: "data"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            name: "baseUri",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            name: "referencedSymbolName",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            name: "references",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 24
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 24
                },
                kind: "named",
                name: "Reference"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 28
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 29
              },
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    Definition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 24
      },
      name: "Definition",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 24
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 25
          },
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 25
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 26
          },
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 26
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 30
          },
          name: "language",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 30
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 31
          },
          name: "projectRoot",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 31
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }]
      }
    },
    DefinitionQueryResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 37
      },
      name: "DefinitionQueryResult",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 37
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 38
          },
          name: "queryRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 38
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 38
              },
              kind: "named",
              name: "atom$Range"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 39
          },
          name: "definitions",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 39
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 39
              },
              kind: "named",
              name: "Definition"
            }
          },
          optional: false
        }]
      }
    },
    InvalidationMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 16
      },
      name: "InvalidationMessage",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 18
            },
            name: "scope",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 18
              },
              kind: "string-literal",
              value: "file"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 19
            },
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 19
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 19
                },
                kind: "named",
                name: "NuclideUri"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            name: "scope",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "project"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 25
            },
            name: "scope",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 25
              },
              kind: "string-literal",
              value: "all"
            },
            optional: false
          }]
        }],
        discriminantField: "scope"
      }
    },
    DiagnosticProviderUpdate: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 35
      },
      name: "DiagnosticProviderUpdate",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 35
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          name: "filePathToMessages",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 36
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 36
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 36
                },
                kind: "named",
                name: "FileDiagnosticMessage"
              }
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          name: "projectMessages",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 37
              },
              kind: "named",
              name: "ProjectDiagnosticMessage"
            }
          },
          optional: true
        }]
      }
    },
    FileDiagnosticUpdate: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 40
      },
      name: "FileDiagnosticUpdate",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 40
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 41
          },
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 41
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 42
          },
          name: "messages",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 42
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 42
              },
              kind: "named",
              name: "FileDiagnosticMessage"
            }
          },
          optional: false
        }]
      }
    },
    MessageType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 45
      },
      name: "MessageType",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 45
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 45
          },
          kind: "string-literal",
          value: "Error"
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 45
          },
          kind: "string-literal",
          value: "Warning"
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 45
          },
          kind: "string-literal",
          value: "Info"
        }]
      }
    },
    Trace: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 47
      },
      name: "Trace",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 47
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 48
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 48
            },
            kind: "string-literal",
            value: "Trace"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 49
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 49
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          name: "html",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 50
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 51
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 52
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 52
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }]
      }
    },
    Fix: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 55
      },
      name: "Fix",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 55
        },
        kind: "intersection",
        types: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 55
          },
          kind: "named",
          name: "TextEdit"
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 55
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 59
            },
            name: "speculative",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 59
              },
              kind: "boolean"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 61
            },
            name: "title",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 61
              },
              kind: "string"
            },
            optional: true
          }]
        }],
        flattened: {
          kind: "object",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 55
          },
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 13
            },
            name: "oldRange",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 13
              },
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 14
            },
            name: "newText",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 14
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            name: "oldText",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 16
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 59
            },
            name: "speculative",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 59
              },
              kind: "boolean"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 61
            },
            name: "title",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 61
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    },
    FileDiagnosticMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 64
      },
      name: "FileDiagnosticMessage",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 64
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 65
          },
          name: "scope",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 65
            },
            kind: "string-literal",
            value: "file"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 66
          },
          name: "providerName",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 66
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 67
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 67
            },
            kind: "named",
            name: "MessageType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 68
          },
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 68
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 69
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 69
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 70
          },
          name: "html",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 70
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 71
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 71
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 72
          },
          name: "trace",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 72
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 72
              },
              kind: "named",
              name: "Trace"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 73
          },
          name: "fix",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 73
            },
            kind: "named",
            name: "Fix"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 76
          },
          name: "stale",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 76
            },
            kind: "boolean"
          },
          optional: true
        }]
      }
    },
    ProjectDiagnosticMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 79
      },
      name: "ProjectDiagnosticMessage",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 79
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 80
          },
          name: "scope",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 80
            },
            kind: "string-literal",
            value: "project"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 81
          },
          name: "providerName",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 81
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 82
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 82
            },
            kind: "named",
            name: "MessageType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 83
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 83
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 84
          },
          name: "html",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 84
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 85
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 85
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 86
          },
          name: "trace",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 86
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 86
              },
              kind: "named",
              name: "Trace"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 87
          },
          name: "stale",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 87
            },
            kind: "boolean"
          },
          optional: true
        }]
      }
    }
  }
});