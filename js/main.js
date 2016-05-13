/**
 * Main script
 */
var app = angular.module("app", ["ngRoute","appControllers"]);

app.factory("FormData", function(){

	var defaultFormValues = {		//init form values
		action: "central_cube",
		dimension: {
			date_time: true,
			store: true,
			product: true
		},
		category: {
			date_time: "year",
			store: "store_state",
			product: "category"
		},
		cardinals: {}
	};

	/*
	 * Parse the dimension params
	 */
	var parseParam = function(d) {
		var isSliceOrDice = (d["action"] == 'slice' || d["action"] == 'dice') ? true : false;

		//parsed params
		var qParams = {
			cardinalError: false
		};

		// get cardinals
		var cardinals = {};
		if(d.cardinals && isSliceOrDice) {			//if there is a cardinal property
			Object.keys(d.cardinals).forEach(function(value,index, arr) { //parsing cardinal values
				d.cardinals[value].forEach(function(cardinal,i,arr) {

					if(!cardinals[value])
						cardinals[value] = [];		//init an array

					if(arr[cardinal]) {			//cardinal value was selected
						cardinals[value].push(cardinal.trim());
					}
				});
			});
		}

		//create query parameters
		var dimensionQuery = [];
		Object.keys(d.dimension).forEach(function(value) {
			if(d.dimension[value]) { 				//check if dimension is selected
				var attrName = d.category[value];

				//find the cardinals based on dimension value
				var cardinalString = "";
				var query = "";
				if(cardinals[attrName]) {
					cardinalString = cardinals[attrName].join("+"); //combine attrs
				}

				if(cardinalString === "") {						//no cardinal val found
					query = [ value, attrName ].join(".");
					if(isSliceOrDice)
						qParams["cardinalError"] = true;
				} else 
					query = [ value, attrName, cardinalString ].join(".");

				dimensionQuery.push( query );		//parse attributes
				
			}
		});

		qParams["action"] = d.action;
		qParams["dimension"] = dimensionQuery.join(",");

		return qParams;
	}


	/**
	  * Get the cardinal of datas
 	  */
	var parseCardinalValues = function(d) {
		
		var keys = d["attributes"];
		var data = d["data"];
		var result = {};

		data.forEach(function(val,index){
			var cardinalValues = val.key;
			cardinalValues.forEach(function(c,i){
				var castedCardinal = [c," "].join("");	//casting the value to a string
				if(!result[keys[i]]) //base case when there isnt a array initialized
					result[keys[i]] = [];

				if(result[keys[i]].indexOf(castedCardinal) == -1)  //check if value is in there
					result[keys[i]].push(castedCardinal);

				// console.log(result);
			});
		});
		return result;
	}

	return {
		parseParam: parseParam,
		parseCardinalValues: parseCardinalValues,
		defaultFormValues: defaultFormValues
	}
});

app.config(["$routeProvider", function($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: 'views/table-template.html',
			controller: 'CentreCubeCtrl',
		}).
		otherwise({
			redirectTo: "/"
		});
}]);
