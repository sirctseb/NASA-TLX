library DataServer;
import "dart:io";
import "dart:json";

void main() {
  Server server = new Server();
}

class Server {
  File dataFile = null;
  IOSink sink;
  
  Server() {
    // listen on port 8000
    HttpServer.bind("127.0.0.1", 8000)
      .then((HttpServer server) {
        // log start of server
        print("server listening on port ${server.port}");
        
        // watch for web socket connections
        server.transform(new WebSocketTransformer())
        .listen((WebSocket webSocket) {
          
          // log new connection to console
          print('new connection');
          
          webSocket.listen((event) {
            handleMessage(event, webSocket);
          }, onDone: () { handleClose(webSocket.closeCode, webSocket.closeReason); });
        });
      });
  }
    
  void handleMessage(message, WebSocket socket) {
    // parse the json message
    var command = parse(message);

    if(command["type"] == "weights") {
      print("data server received weights");
      
      // create file object
      File weightsFile = new File.fromPath(new Path("results/${command['prefix']}-weights.txt"));
      
      // write weights to file
      weightsFile.writeAsString(command["data"]);
    }
    if(command["type"] == "survey") {
      print("data server received survey");

      // create file object
      File surveyFile = new File.fromPath(new Path("results/${command['prefix']}-survey.txt"));

      // write survey to file
      surveyFile.writeAsString(command["data"]);
    }
  }
  
  void handleClose(int closeCode, String closeReason) {
    print('closed with ${closeCode} for ${closeReason}');
    print(new DateTime.now().toString());
  }
}