var appControllers = angular.module("appControllers",[]);

appControllers.
	controller("CentreCubeCtrl",["$scope","$http","$routeParams","$timeout","FormData", function($scope,$http,$routeParams,$timeout,formData) {
		var url = "api/bi/parser";
		// var url = "data/data.json";
		var parsedParam = formData.parseParam( formData.defaultFormValues );

		$http.get(url, {params: parsedParam}).success(function(data){
			$scope.data = data;
			
			$scope.$emit("current_cube", data);
			$scope.$emit("new_cardinals", formData.parseCardinalValues(data));
			
		});
		$scope.visible = true;
		$scope.$on("data_changed", getNewData);		//watch data changes

		function getNewData(e, queryParams) {
			//get data 
			// var newUrl = 'data/data2';
			$http.get(url, {params: queryParams}).success(function(newData){
				$scope.$emit("current_cube", newData);
				$scope.$emit("new_cardinals", formData.parseCardinalValues(newData));
				
				$scope.visible = false;				//hide current data

				$scope.data = newData;

				$timeout(function(){				//turn it back on
					$scope.visible = true;
				});
				
				
			});
		}
	}]).	
	controller("OptionsCtrl",["$scope","$http","$routeParams","FormData", function($scope,$http,$routeParams,formData) {
		$scope.form = formData.defaultFormValues;
		$scope.disable = false;
		$scope.dimensionError = false;
		$scope.dimensionErrorDice = false;
		$scope.cardinalError = false;

		$scope.currentCube = {};

		$scope.$on("current_cube", function(e, data) {		//listen for current cube
			$scope.currentCube = data;
		})

		$scope.$on("new_cardinals", function(e, cardinals) {		//listen for cardinal values
//			console.log(cardinals);
			$scope.form.cardinals = cardinals;
		})

		$scope.changeView = function(d) {
			// console.log(d);
			// console.log($scope.currentCube);
			// console.log("action is: ", determineAction(d,$scope.currentCube) );

			var parsedFormParams = formData.parseParam(d);
			parsedFormParams["action"] = determineAction(d,$scope.currentCube);
			
			$scope.cardinalError = parsedFormParams.cardinalError;
			console.log(parsedFormParams);
			//broadcast it to centrecubctrl
			$scope.$broadcast("data_changed", parsedFormParams );
		};

		$scope.dimensionCheck = function(form) {
			// console.log(form);
			var dim = form.dimension;
			var keys = Object.keys(dim);
			var uncheckedDimension = 0;
			$scope.disable = false;
			$scope.dimensionError = false;
			$scope.dimensionErrorDice = false;
			$scope.dimensionErrorSlice = false;
			$scope.dimensionErrorCentralCube = false;

			for(var i = 0; i < keys.length; i++) {
				var currentValue = dim[ keys[i] ];
				if( currentValue == false ) {
					uncheckedDimension++;
				}
			}

			if(uncheckedDimension >= 2 && form["action"] == "dice") {		//unselected is more than or equal to 2
				$scope.disable = true;
				$scope.dimensionErrorDice = true;
			} else if(uncheckedDimension < 2 && form["action"] == "slice") { //selected more than 2 dimension when doing slide operation
				$scope.disable = true;
				$scope.dimensionErrorSlice = true;
			} else if (uncheckedDimension > 0 && form["action"] == "central_cube") { //no dimension selected
				$scope.disable = true;
				$scope.dimensionErrorCentralCube = true;
			} else if (uncheckedDimension > 2) {
				$scope.disable = true;
				$scope.dimensionError = true;
			}

		}

		function determineAction(newData, currentData) {
			
			if(newData["action"] != "roll_up" && newData["action"] != "drill_down") { //base case
//				console.log("action is not roll_up or drill_down central_cube " + newData["action"]);
				return newData["action"];
			}
			
		    console.log(newData, currentData);
			var selectedDim = 0;
			var currentDim = currentData.dimension.length;
			Object.keys(newData.dimension).forEach(function(value, key) {
				if(newData.dimension[value]) {
					selectedDim++;
				}
			});
			
			if(selectedDim != currentDim){	//by dimention
				return newData["action"] + "_dimension";
			} else {
				return newData["action"] + "_hierachy";
			}
		}
	}]);