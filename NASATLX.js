part of WorkloadExperiment;

class Scale {
  static const int MENTAL_DEMAND = 0;
  static const int PHYSICAL_DEMAND = 1;
  static const int TEMPORAL_DEMAND = 2;
  static const int PERFORMANCE = 3;
  static const int EFFORT = 4;
  static const int FRUSTRATION = 5;
  
  /// The number of option pairs
  static const int NUMBER_PAIRS = 15;
  
  /// Which scale this is
  int scale;
  /// The number of times this scale was picked as more important
  int count = 0;
  /// The computed weight for the scale
  num get weight => count / NUMBER_PAIRS;
  /// The display title of the scale
  String title;
  
  
  // TODO these really should just be normal instances and we shouldn't deal with this
  static resetScaleCounts() {
    Scales.forEach((index, scale) => scale.count = 0);
  }
  
  static final Map<int, Scale> Scales = new Map<int, Scale>();
  
  factory Scale.named(int scale) {
    //return Scales[scale];
    if(!Scales.containsKey(scale)) {
      Scales[scale] = new Scale._named(scale);
    }
    return Scales[scale];
  }
  Scale._named(int scale) {
    this.scale = scale;
    this.title = ScaleTitles[scale];
  }
  static Map _scaleTitles;
  static Map get ScaleTitles {
    if(_scaleTitles == null) _createScaleTitles();
    return _scaleTitles;
  }
  static _createScaleTitles() {
    _scaleTitles = new Map<int, String>();
                                
    _scaleTitles[MENTAL_DEMAND] = "Mental Demand";
    _scaleTitles[PHYSICAL_DEMAND] = "Physical Demand";
    _scaleTitles[TEMPORAL_DEMAND] = "Temporal Demand";
    _scaleTitles[PERFORMANCE] = "Performance";
    _scaleTitles[EFFORT] = "Effort";
    _scaleTitles[FRUSTRATION] = "Frustration";
  }
}

/// Manages the retrieval and storage of scale weights
/// There should only be one instance of this
class TlxWeights {
  
  /// The main task controller
  TaskController controller;
  
  TlxWeights(TaskController this.controller) {
    // register click handlers on the option divs
    query("#scale-option-1").onClick.listen((event) {
      scaleClicked(0);
    });
    query("#scale-option-2").onClick.listen((event) {
      scaleClicked(1);
    });
    
    // show initial options
    presentOptions();
  }
  
  void scaleClicked(int which) {
    // increment the scale count
    scales[which].count++;
    
    // advance the current option pair
    currentOptionPairIndex++;
  }
  
  /// Reset weights survey state
  void reset() {
    // reset scale counts to 0
    Scale.resetScaleCounts();
    
    // set to first option pair
    currentOptionPairIndex = 0;
  }
  
  /// Present the two current options on the screen
  void presentOptions() {
    // show the scale titles in ui
    query("#scale-option-1").text = scales[0].title;
    query("#scale-option-2").text = scales[1].title;
  }
  
  /// The index of the current pair of options. [0, 14]
  int _currentOptionPairIndex = 0;
  int get currentOptionPairIndex => _currentOptionPairIndex;
  // this should be a method, but this is so we can do ++
  set currentOptionPairIndex(int newIndex) {
    if(newIndex >= Scale.NUMBER_PAIRS) {
      // if we're going past the last one, notify controller that we're done
      controller.weightsCollected(
          [Scale.MENTAL_DEMAND, Scale.PHYSICAL_DEMAND, Scale.TEMPORAL_DEMAND, Scale.PERFORMANCE, Scale.EFFORT, Scale.FRUSTRATION]
          .map((scale) => new Scale.named(scale))
      );
    } else {
      // update backing field
      _currentOptionPairIndex = newIndex;
      // update display
      presentOptions();
    }
  }
  
  /// Get the current options
  List<int> get options => getOptions(currentOptionPairIndex);
  
  /// Get the current scales
  List<Scale> get scales => options.map((scale) => new Scale.named(scale)).toList();
  
  // option pair order
  List<List<int>> _optionPairs = _makeOptionPairs();
  static List<List<int>> _makeOptionPairs() {
    var pairs = [
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
    var retPairs = [];
    Random rng = new Random(new DateTime.now().millisecond);
    
    // randomize pairs
    while(pairs.length > 0) {
      retPairs.add(pairs.removeAt(rng.nextInt(pairs.length)));
    }
    return retPairs;
  }
  /// Get the pair of options at a given index
  List<int> getOptions(int index) {
    return _optionPairs[index];
  }
}

