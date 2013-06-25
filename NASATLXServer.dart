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
  IOSink sink;
  
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
    // parse the json message
    var command = parse(message);
    
    Logger.root.finest("data server received message: $message");
    
    if(command["type"] == "weights") {
      Logger.root.info("data server received weights");
      
      // create file object
      File weightsFile = new File.fromPath(new Path("${command['prefix']}-weights.txt"));
      
      // write weights to file
      weightsFile.writeAsString(command["data"]);
    }
    if(command["type"] == "survey") {
      Logger.root.info("data server received survey");

      // create file object
      File surveyFile = new File.fromPath(new Path("${command['prefix']}-survey.txt"));

      // write survey to file
      surveyFile.writeAsString(command["data"]);
    }
  }
  
  void handleClose(int closeCode, String closeReason) {
    Logger.root.info('closed with ${closeCode} for ${closeReason}');
    Logger.root.info(new DateTime.now().toString());
  }
}