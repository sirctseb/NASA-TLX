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
    Scale.scaleTitle[MENTAL_DEMAND] = "Mental Demand";
    Scale.scaletitle[PHYSICAL_DEMAND] = "Physical Demand";
    Scale.scaleTitle[TEMPORAL_DEMAND] = "Temporal Demand";
    Scale.scaleTitle[PERFORMANCE] = "Performance";
    Scale.scaleTitle[EFFORT] = "Effort";
    Scale.scaleTitle[FRUSTRATION] = "Frustration";
    Scale.staticInit = true;
    Scale.NUMBER_PAIRS = NUMBER_PAIRS;
  }
  
  return {
    /// Which scale this is
    scale: type,
    /// The number of times this scale was picked as more important
    count: 0,
    /// The computed weight for the scale
    weight: function() { return this.count / NUMBER_PAIRS },
    /// The display title of the scale
    title: Scale.scaleTitle[type]
  }
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
  
  /// Reset weights survey state
  var reset = function() {
    // reset scales
    scales = [0,1,2,3,4,5].map(Scale);

    // set to first option pair
    currentOptionPairIndex = 0;
  }
  
  /// Present the two current options on the screen
  var presentOptions = function() {
    // show the scale titles in ui
    querySelector("#scale-option-1").textContent = scales[getCurrentOptions()[0]].title;
    querySelector("#scale-option-2").textContent = scales[getCurrentOptions()[1]].title;
  }
  
  // this should be a method, but this is so we can do ++
  var incrementCurrentOptionPairIndex = function() {
    // calculate new index
    var newIndex = currentOptionPairIndex + 1;

    if(newIndex >= Scale.NUMBER_PAIRS) {
      // if we're going past the last one, notify controller that we're done
      // TODO grab this from the controller code
      controller.weightsCollected(scales);
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
  var optionPairsOrdered = [
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

  // TODO randomize
  var retPairs = [];
  Random rng = new Random(new DateTime.now().millisecond);
  
  // randomize pairs
  while(pairs.length > 0) {
    retPairs.add(pairs.removeAt(rng.nextInt(pairs.length)));
  }

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
    
  // show initial options
  presentOptions();

  return ret;
  
})();
