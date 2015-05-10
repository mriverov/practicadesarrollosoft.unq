var app = angular.module('flapperNews', ['ui.router', 'angularMoment', 'google.places','uiGmapgoogle-maps']);

app.factory('auth', ['$http', '$window', function($http, $window){
   	var auth = {};

   	auth.saveToken = function (token){
	  $window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['flapper-news-token'];
	};

	auth.isLoggedIn = function(){
	  var token = auth.getToken();

	  if(token){
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.exp > Date.now() / 1000;
	  } else {
	    return false;
	  }
	};

	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));

	    return payload.username;
	  }
	};

	auth.register = function(user){
	  return $http.post('/register', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logIn = function(user){
	  return $http.post('/login', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logOut = function(){
	  $window.localStorage.removeItem('flapper-news-token');
	};

  return auth;
}]);

app.factory('trips', ['$http', 'auth', function($http, auth){
	var o = {
		trips: []
	};

	o.getAll = function() {
		return $http.get('/trips', {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
			angular.copy(data, o.trips);
		});
	};


	o.create = function(trip) {
		return $http.post('/trips', trip, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			o.trips.push(data);
		});
	};

	o.get = function(id) {
		return $http.get('/trips/' + id).then(function(res){
			console.log("BBBBBBBBH");
			console.log(res.data);
			return res.data;
		});
	};

	o.remove = function(id) {
		return $http.post('/trips/' + id + '/remove');
	};

	o.addCity = function(id, city) {
		return $http.post('/trips/' + id + '/cities', city, {
		    headers: {Authorization: 'Bearer '+auth.getToken()}
		  });
	  };

	return o;
}]);

app.controller('MainCtrl', [ '$scope', '$window', 'trips', 'auth',
	function($scope, $window, trips, auth){
		$scope.trips = trips.trips;
		$scope.isLoggedIn = auth.isLoggedIn;

		$scope.addTrip = function(){
			if(!$scope.name || $scope.name === '') { return; }
			trips.create({
				name: $scope.name,
				description: $scope.description,
				dateOfDeparture: $scope.dateOfDeparture,
				arrivalDate: $scope.arrivalDate,
				author: auth.currentUser,
			});
			$scope.name = '';
			$scope.description = '';
			$scope.dateOfDeparture = '';
			$scope.arrivalDate = '';
		};

		$scope.predicate = '-name';

		$scope.removeTrip = function(trip){
			var deleteTrip = $window.confirm('Are you sure you want to delete?');
			if(deleteTrip){
				trips.remove(trip._id);
				var _trip = $scope.trips.indexOf(trip);
				$scope.trips.splice(_trip, 1);
			}
		}

	}
]);

app.controller('TripsCtrl', [ '$scope', 'trips', 'trip', 'auth', '$state',
	function($scope, trips, trip, auth, $state){
		$scope.trip = trip;
		$scope.isLoggedIn = auth.isLoggedIn;

		// Agrego esta logica para centrar el mapa siempre que hayan cuidades guardadas.
		// Al tener varias cuidades necesitamos tener una de referencia para centrar el mapa.
		if(!$scope.trip.cities || $scope.trip.cities=== '' || $scope.trip.cities.length<1) {
			$scope.map = { center: { latitude: -34.6037232, longitude:  -58.38159310000003}, zoom: 8 }; 
		}else{
			var city = $scope.trip.cities.pop();
			$scope.map = { center: { latitude: city.latitude, longitude:  city.longitude}, zoom: 8 }; 
		}


		$scope.addCity = function(){
		  if($scope.city === '') { return;}

		  trips.addCity(trip._id, {
		    address: $scope.city.formatted_address,
		    longitude: $scope.city.geometry.location.F, 
		    latitude: $scope.city.geometry.location.A,
		    icon: $scope.city.icon,
		  }).success(function(city) {
		    $scope.trip.cities.push(city);
		  });

		  $scope.city = '';
		};

	}
]);

app.controller('AuthCtrl', [ '$scope', '$state', 'auth',
	function($scope, $state, auth){
		$scope.user = {};

		$scope.register = function(){
			auth.register($scope.user).error(function(error){
			  $scope.error = error;
			}).then(function(){
			  $state.go('home');
			});
		};

		$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
			  $scope.error = error;
			}).then(function(){
			  $state.go('home');
			});
		};
	}
]);

app.controller('NavCtrl', [ '$scope', 'auth',
	function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}
]);

app.config([ '$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		
		$stateProvider.state('home', {
		  url: '/home',
		  templateUrl: '/home.html',
		  controller: 'MainCtrl',
		  onEnter: ['$state', 'auth', function($state, auth){
			if(!auth.isLoggedIn()){
			  $state.go('gettingStarted');
			}
		  }],
		  resolve: {
			postPromise: ['trips', function(trips){
			  return trips.getAll();
			}]
		  }
		  
		});

		$stateProvider.state('gettingStarted', {
		  url: '/gettingStarted',
		  templateUrl: '/gettingStarted.html',
		  controller: 'NavCtrl',
		  onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
			  $state.go('home');
			}
		  }]
		});

		$stateProvider.state('trips', {
		  url: '/trips/{id}',
		  templateUrl: '/trips.html',
		  controller: 'TripsCtrl',
		  resolve: {
			trip: ['$stateParams', 'trips', function($stateParams, trips) {
			  return trips.get($stateParams.id);
			}]
		  }
		});

		$stateProvider.state('login', {
		  url: '/login',
		  templateUrl: '/login.html',
		  controller: 'AuthCtrl',
		  onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
			  $state.go('home');
			}
		  }]
		});

		$stateProvider.state('register', {
		  url: '/register',
		  templateUrl: '/register.html',
		  controller: 'AuthCtrl',
		  onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
			  $state.go('home');
			}
		  }]
		});

		$urlRouterProvider.otherwise('gettingStarted');
	}
]);