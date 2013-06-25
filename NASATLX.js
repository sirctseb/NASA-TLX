var Scale = function(type) {
  /// The number of option pairs
  var NUMBER_PAIRS = 15;
  
  /// Scale identifiers
  if(!Scale.staticInit) {
    Scale.MENTAL_DEMAND = 0;
    Scale.PHYSICAL_DEMAND = 1;
    Scale.TEMPORAL_DEMAND = 2;
    Scale.PERFORMANCE = 3;
    Scale.EFFORT = 4;
    Scale.FRUSTRATION = 5;
    Scale.scaleTitle = {};
    Scale.scaleTitle[Scale.MENTAL_DEMAND] = "Mental Demand";
    Scale.scaleTitle[Scale.PHYSICAL_DEMAND] = "Physical Demand";
    Scale.scaleTitle[Scale.TEMPORAL_DEMAND] = "Temporal Demand";
    Scale.scaleTitle[Scale.PERFORMANCE] = "Performance";
    Scale.scaleTitle[Scale.EFFORT] = "Effort";
    Scale.scaleTitle[Scale.FRUSTRATION] = "Frustration";
    Scale.staticInit = true;
    Scale.NUMBER_PAIRS = NUMBER_PAIRS;
  }
  
  var ret = {
    /// Which scale this is
    scale: type,
    /// The number of times this scale was picked as more important
    count: 0,
    /// The display title of the scale
    title: Scale.scaleTitle[type],
    /// A method to produce a string output
    pretty: function() {
      return this.title + ", " + this.scale + ", " + this.count + ", " + this.weight;
    }
  }
  /// The computed weight for the scale
  ret.__defineGetter__("weight", function() {
    return this.count / NUMBER_PAIRS;
  });
  return ret;
}


/// Manages the retrieval and storage of scale weights
/// There should only be one instance of this
var TlxWeights = (function() {
  // TODO initialize list of scales
  var scales = [0,1,2,3,4,5].map(Scale);
  /// The index of the current pair of options. [0, 14]
  var currentOptionPairIndex = 0;

  // click handler
  var scaleClicked = function(which) {
    // increment the scale count
    scales[getCurrentOptions()[which]].count++;
    
    // advance the current option pair
    incrementCurrentOptionPairIndex();
  }

  var randomizeArray = function(arr) {
    var i = arr.length, j, temp;
    if ( i === 0 ) return false;
    while ( --i ) {
      j = Math.floor( Math.random() * ( i + 1 ) );
      temp = arr[i];
      arr[i] = arr[j]; 
      arr[j] = temp;
    }
  }

  var tabs = ["nasa-tlx", "weights", "results"];
  var showTab = function(name) {
    for(var i = 0; i < tabs.length; i++) {
      if(tabs[i] != name) {
        document.querySelector("#"+tabs[i]).classList.add("hidden");
      }
    }
    document.querySelector("#" + name).classList.remove("hidden");
  }

  /// Reset weights survey state
  var reset = function() {
    // reset scales
    scales = [0,1,2,3,4,5].map(Scale);

    // set to first option pair
    currentOptionPairIndex = 0;

    // randomize the order of the pairs
    randomizeArray(optionPairs);

    // make sure the input ui shows instead of the finish message
    document.querySelector("#weight-input-ui").classList.remove("hidden");
    document.querySelector("#weight-finish-ui").classList.add("hidden");
  }
  
  /// Present the two current options on the screen
  var presentOptions = function() {
    // show the scale titles in ui
    document.querySelector("#scale-option-1").textContent = scales[getCurrentOptions()[0]].title;
    document.querySelector("#scale-option-2").textContent = scales[getCurrentOptions()[1]].title;
  }
  
  // this should be a method, but this is so we can do ++
  var incrementCurrentOptionPairIndex = function() {
    // calculate new index
    var newIndex = currentOptionPairIndex + 1;

    if(newIndex >= Scale.NUMBER_PAIRS) {
      // hide input ui and show finish message
      document.querySelector("#weight-input-ui").classList.add("hidden");
      document.querySelector("#weight-finish-ui").classList.remove("hidden");
    } else {
      // update backing field
      currentOptionPairIndex = newIndex;
      // update display
      presentOptions();
    }
  }
  
  /// Get the current scales
  var ret = {
    scales: function() {
      return scales;
    }
  };
  
  // option pair order
  var optionPairs = [
      [Scale.MENTAL_DEMAND, Scale.PHYSICAL_DEMAND],
      [Scale.TEMPORAL_DEMAND, Scale.MENTAL_DEMAND],
      [Scale.PERFORMANCE, Scale.MENTAL_DEMAND],
      [Scale.MENTAL_DEMAND, Scale.EFFORT],
      [Scale.FRUSTRATION, Scale.MENTAL_DEMAND],
      [Scale.PHYSICAL_DEMAND, Scale.TEMPORAL_DEMAND],
      [Scale.PHYSICAL_DEMAND, Scale.PERFORMANCE],
      [Scale.EFFORT, Scale.PHYSICAL_DEMAND],
      [Scale.PHYSICAL_DEMAND, Scale.FRUSTRATION],
      [Scale.PERFORMANCE, Scale.TEMPORAL_DEMAND],
      [Scale.TEMPORAL_DEMAND, Scale.EFFORT],
      [Scale.TEMPORAL_DEMAND, Scale.FRUSTRATION],
      [Scale.EFFORT, Scale.PERFORMANCE],
      [Scale.PERFORMANCE, Scale.FRUSTRATION],
      [Scale.FRUSTRATION, Scale.EFFORT]
  ];

  /// Get the pair of options at a given index
  var getOptions = function(index) {
    return optionPairs[index];
  }
  var getCurrentOptions = function() {
    return getOptions(currentOptionPairIndex);
  }

  // register click handlers on the option divs
  document.querySelector("#scale-option-1").onclick = function(event) {
    scaleClicked(0);
  };
  document.querySelector("#scale-option-2").onclick = function(event) {
    scaleClicked(1);
  };
  var surveyResults = function() {
    // store ratings
    var ratings = {};
    ratings[Scale.MENTAL_DEMAND] = document.querySelector("#mental-demand").value;
    ratings[Scale.PHYSICAL_DEMAND] = document.querySelector("#physical-demand").value;
    ratings[Scale.TEMPORAL_DEMAND] = document.querySelector("#temporal-demand").value;
    ratings[Scale.PERFORMANCE] = document.querySelector("#performance").value;
    ratings[Scale.EFFORT] = document.querySelector("#effort").value;
    ratings[Scale.FRUSTRATION] = document.querySelector("#frustration").value;
    // result string, initialize with header
    var result = "scale, index, value";
    for(var i in ratings) {
      result = result + "\n" + Scale.scaleTitle[i] + ", " + i + ", " + ratings[i];
    }
    return result;
  }
  document.querySelector("#tlx-submit").onclick = function(event) {
    // get results string
    var results = surveyResults();
    // put in results tab
    document.querySelector("#results textarea").value = results;
    // send to server
    sendToServer({
      type: "survey",
      prefix: document.querySelector("#prefix").value,
      data: results
    });
  };
  document.querySelector("#tlx-reset").onclick = function(event) {
    // reset scales to 0
    var inputs = document.querySelectorAll(".tlx-section input");
    for(var i = 0; i < inputs.length; i++) {
      inputs.item(i).value = 0;
    }
  };
  var weightsResults = function() {
    // result string, initialize with header
    var results = "scale, index, count, weight";
    for(var i in scales) {
      results = results + "\n" + scales[i].pretty();
    }
    return results;
  }
  document.querySelector("#weights-submit").onclick = function(event) {
    // get results string
    var results = weightsResults();
    // put in results tab
    document.querySelector("#results textarea").value = results;
    // send to server
    sendToServer({
      type: "weights",
      prefix: document.querySelector("#prefix").value,
      data: results
    });
  };
  document.querySelector("#weights-reset").onclick = function(event) {
    // reset scales
    reset();
    // show scales
    presentOptions();
  };
  document.querySelector("#show-workload").onclick = function(event) {
    showTab("nasa-tlx");
  };
  document.querySelector("#show-weights").onclick = function(event) {
    showTab("weights");
  };
  document.querySelector("#show-results").onclick = function(event) {
    showTab("results");
  };

  // show initial options
  presentOptions();

  var socket = null;
  var sendToServer = function(obj) {
    if(socket != null) {
      socket.send(JSON.stringify(obj));
    } else {
      // TODO error message
    }
  }
  var warnServerOpen = function() {
    // TODO make green?
    document.querySelector("#server-state").textContent = "Server connected";
  }
  var warnServerClose = function() {
    // TODO make red?
    document.querySelector("#server-state").textContent = "Server not connected";
  }
  var connectToServer = function() {
    try{
      var host = "ws://127.0.0.1:8000/";
      socket = new WebSocket(host);
      socket.onclose = function(e) {
        warnServerClose();
      }
      socket.onopen = function(e) {
        warnServerOpen();
      }
    } catch(exception){
      // TODO make less intrusive
      alert("error connecting to server");
    }
  }

  connectToServer();
  return ret;
  
})();
