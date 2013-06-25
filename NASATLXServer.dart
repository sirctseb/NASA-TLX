library DataServer;
import "dart:io";
import "dart:json";
import "package:logging/logging.dart";

void main() {
  Server server = new Server();
  // print messages to console
  Logger.root.onRecord.listen((LogRecord record) {
    print(record.message);
  });
}

class Server {
  File dataFile = null;
  int trialNumber = 0;
  int subjectNumber = 0;
  var blockNumber = 0;
  bool logEvents = false;
  IOSink sink;
  Process recordingProcess;
  
  String get subjectDirStr => "output/subject$subjectNumber";
  String get blockDirStr => "$subjectDirStr/block$blockNumber";
  String get blockDescPathStr => "$blockDirStr/block.txt";
  String get trialDirStr => "$blockDirStr/trial$trialNumber";
  String get trialDescPathStr => "$trialDirStr/task.txt";
  String get dataFilePathStr => "$trialDirStr/data.txt";
  String get surveyPathStr => "$blockDirStr/survey.txt";
  String get weightsPathStr => "$subjectDirStr/weights.txt";
  
  Server() {
    // listen on port 8000
    HttpServer.bind("127.0.0.1", 8000)
      .then((HttpServer server) {
        // log start of server
        Logger.root.info("server listening on port ${server.port}");
        
        // watch for web socket connections
        server.transform(new WebSocketTransformer())
        .listen((WebSocket webSocket) {
          
          // log new connection to console
          Logger.root.info('new connection');
          
          webSocket.listen((event) {
            handleMessage(event, webSocket);
          }, onDone: () { handleClose(webSocket.closeCode, webSocket.closeReason); });
        });
      });
  }
    
  void handleMessage(message, WebSocket socket) {
    //var message = event.data;
    Logger.root.finest("data server received message: $message");
    
    if(message.startsWith("end trial")) {
      Logger.root.info("data server received end trial message");
      
      // set log events flag to stop logging
      logEvents = false;
      
      // close stream
      sink.close();
      
      // stop recording
      if(recordingProcess != null) {
        Logger.root.info("killing recording");
        if(recordingProcess.kill()) {
          Logger.root.info("recording process succsssfully killed");
        } else {
          Logger.root.info("killing recording failed. already dead?");
        }
        // TODO if not ^, send message to client
        recordingProcess = null;
      }
    }
    
    if(logEvents) {
      Logger.root.finest("data server logging message");
      
      // write event to file
      sink.write("$message\n");
    } else {
      // if we're not running, check for requests for trial replay data
      try {
        var request = parse(message);
        // check if it is a data file request
        if(request["cmd"] == "replay" && request["data"] == "datafile") {
          Logger.root.info("got request for data file in ${request['path']}");
          // load the block description file
          new File.fromPath(new Path(request["path"]).directoryPath.append("block.txt"))
            .readAsString()
            .then((blockContent) {
              // load the data file and send contents back
              new File.fromPath(new Path(request["path"]).append("data.txt"))
                .readAsString()
                .then((content) {
                  Logger.root.info("finished reading file, sending to client");
                  socket.add(stringify({"data": "datafile", "content": content, "block": blockContent}));
                });
            });
        } else if(request["cmd"] == "subjects") {
          // read the list of subjects and respond
          socket.add(
            stringify({"data": "subjects",
              "subjects": new Directory("output").listSync().where((entry) => entry is Directory).map((dir) => {"name": new Path(dir.path).filename}).toList()})
          );
        } else if(request["cmd"] == "blocks") {
          // read the list of blocks and respond
          socket.add(
            stringify({"data": "blocks",
              "blocks": new Directory.fromPath(new Path("output").append(request["subject"]))
                .listSync().where((entry) => entry is Directory).map(
                    (dir) {
                      // read the block description file
                      var blockDesc = parse(new File.fromPath(new Path("${dir.path}/block.txt")).readAsStringSync());
                      return {"name": new Path(dir.path).filename, "subject": request["subject"],
                        "blockDesc": blockDesc};
                    }
                 ).toList()})
          );
        } else if(request["cmd"] == "trials") {
          // read the list of trials and respond
          socket.add(
            stringify({"data": "trials",
              "trials": new Directory.fromPath(new Path("output").append(request["subject"]).append(request["block"]))
                .listSync().where((entry) => entry is Directory).map((dir) =>
                    {"name": new Path(dir.path).filename, "subject": request["subject"], "block": request["block"]}).toList()})
          );
        }
      } on FormatException catch(e) {
        // don't do anything
      }
    }
    
    // check for subject number command
    if(message.startsWith("set: ")) {
      
      // get subject number
      Map info = parse(message.substring("set: ".length));
      // read subject if it was sent
      if(info.containsKey("subject")) {
        subjectNumber = info["subject"];
        Logger.root.info("data server got subject number: $subjectNumber");
      }
      // read block if it was sent
      if(info.containsKey("block")) {
        blockNumber = info["block"];
        Logger.root.info("data server got block number: $blockNumber");
        // write block description if it was sent
        if(info.containsKey("blockDesc")) {
          Logger.root.info("data server got block description");
          
          // make file object
          File blockDescFile = new File.fromPath(new Path(blockDescPathStr));
          
          Logger.root.info("made block desc file object; ensuring dir exists");
          
          // make sure directory exists
          new Directory(blockDirStr).createSync(recursive:true);
          
          Logger.root.info("ensured dir exists, writing file contents");
          
          // write block description to file
          blockDescFile.writeAsStringSync(stringify(info["blockDesc"]));
          Logger.root.info("data server wrote block description to file");
        }
      }
      // read trial if it was sent
      if(info.containsKey("trial")) {
        trialNumber = info["trial"];
        Logger.root.info("data server got trial number $trialNumber");
      }
    }
    
    if(message.startsWith("survey: ")) {
      Logger.root.info("data server received survey results");
      
      // TODO make sure directory exists?
      
      // create file object
      File surveyFile = new File.fromPath(new Path(surveyPathStr));
      
      // write survey to file
      surveyFile.writeAsString(message);
      
    }
    
    if(message.startsWith("weights: ")) {
      Logger.root.info("data serve received weights");
      
      // TODO make sure directory exists?
      
      // create file object
      File weightsFile = new File.fromPath(new Path(weightsPathStr));
      
      // write weights to file
      weightsFile.writeAsString(message);
    }
    
    if(message.startsWith("start trial")) {
      Logger.root.info("data server received start trial message");
      
      // create data file object
      Path dataFilePath = new Path(dataFilePathStr);
      dataFile = new File.fromPath(dataFilePath);
      
      // create directory
      new Directory(trialDirStr).createSync(recursive:true);
      
      // open file stream
      sink = dataFile.openWrite();
      
      // write task description to separate file
      new File.fromPath(dataFilePath.directoryPath.append("task.txt")).writeAsString(message);
      
      // start recording
      Logger.root.info("starting recording");
      Logger.root.info("cwd: ${Directory.current.toString()}");
      Process.start("/opt/local/bin/sox", ["-d", "$trialDirStr/audio.mp3"])
      .then((Process process) {
        Logger.root.info("recording started");
        recordingProcess = process;
        // read all stdout and stderr data so it doesn't break the recording
        // TODO log to an invisible div?
        recordingProcess.stdout.listen((data) {
          // TODO do we have to do anything to extract the actual data so it doesn't back up?
        });
        recordingProcess.stderr.listen((data) {
          // TODO do we have to do anything to extract the actual data so it doesn't back up?
        });
        // TODO send message to client that recording started
        // TODO on error send message that we're not recording
      });
      
      // set log event flag
      logEvents = true;
    }
  }
  
  // TODO this happens when the web socket closes, not when the client disconnects.
  // TODO how to detect client disconnect?
  // TODO also, we don't really need to
  void handleClose(int closeCode, String closeReason) {
    Logger.root.info('closed with ${closeCode} for ${closeReason}');
    Logger.root.info(new DateTime.now().toString());
  }
}