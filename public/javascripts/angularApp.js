var app = angular.module('travelNotebook', ['ui.router', 'angularMoment', 'google.places','uiGmapgoogle-maps']);

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
		trips: [],
		cities: []
	};

	o.getAll = function() {
		return $http.get('/trips', {
				headers: {Authorization: 'Bearer '+ auth.getToken()}
			}).success(function(data){
			angular.copy(data, o.trips);
		});
	};

	o.create = function(trip) {
		return $http.post('/trips', trip, {
			headers: {Authorization: 'Bearer '+ auth.getToken()}
		}).success(function(data){
			o.trips.push(data);
		});
	};

	o.get = function(id) {
		return $http.get('/trips/' + id).then(function(res){
			return res.data;
		});
	};

	o.remove = function(id) {
		return $http.post('/trips/' + id + '/remove');
	};

	o.addCity = function(id, city) {
		return $http.post('/trips/' + id + '/cities', city, {
		    headers: {Authorization: 'Bearer '+ auth.getToken()}
		  }).success(function(data){
			o.cities.push(data);
		});
	  };

	o.removeCity = function(id, city) {
		return $http.post('/trips/' + id + '/cities/' + city + '/remove', {
			headers: {Authorization: 'Bearer '+ auth.getToken()}}
		);
	};

	o.getCity = function(id, city) {
		return $http.get('/trips/' + id+'/city/'+city).then(function(res){
			return res.data;
		});
	};

	return o;
}]);

app.factory('cities', ['$http', 'auth', function($http, auth){
	var o = {
		hotels:[],
		points:[]
	};

	o.addHotel = function(city, hotel) {
		return $http.post('/city/' + city + '/hotel', hotel, {
		    headers: {Authorization: 'Bearer '+ auth.getToken()}
		  }).success(function(data){
			o.hotels.push(data);
		});
	  };

	o.getHotel = function(city, hotel) {
		return $http.get('/city/' + city+'/hotel/'+hotel).then(function(res){
			return res.data;
		});
	}; 

	o.removeHotel = function(id, hotel) {
		return $http.post('/city/' + id + '/hotel/' + hotel + '/remove', {
			headers: {Authorization: 'Bearer '+ auth.getToken()}}
		);
	};

	o.addPoint = function(city, point) {
		return $http.post('/city/' + city + '/point', point, {
			headers: {Authorization: 'Bearer '+ auth.getToken()}
		}).success(function(data){
			o.points.push(data);
		});
	};

	o.getPoint = function(city, point) {
		return $http.get('/city/' + city + '/point/' + point).then(function(res){
			return res.data;
		});
	};

	o.removePoint = function(id, point) {
		return $http.post('/city/' + id + '/point/' + point + '/remove', {
			headers: {Authorization: 'Bearer '+ auth.getToken()}}
		);
	};

	return o;
}]);

app.factory('hotels', ['$http', 'auth', function($http, auth){
	var o = {
		
	};

	return o;
}]);

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
				author: auth.currentUser
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

app.controller('TripsCtrl', [ '$scope',  '$window', 'trips', 'trip', 'auth',
	function($scope,  $window, trips, trip, auth){
		$scope.trip = trip;
		$scope.cities = trip.cities;
		$scope.isLoggedIn = auth.isLoggedIn;

		// Agrego esta logica para centrar el mapa siempre que hayan cuidades guardadas.
		// Al tener varias cuidades necesitamos tener una de referencia para centrar el mapa.

		if(!$scope.cities || $scope.cities === '' || $scope.cities.length < 1) {
			$scope.map = { center: { latitude: -34.6037232, longitude:  -58.38159310000003}, zoom: 8 };

		} else {
			centerMap();
		}

		$scope.addCity = function(){
			if($scope.city === '') { return; }

			trips.addCity(trip._id, {
				address: $scope.city.formatted_address,
				longitude: $scope.city.geometry.location.F,
				latitude: $scope.city.geometry.location.A,
				icon: $scope.city.icon
			}).success(function(city) {
				$scope.cities.push(city);
				centerMap();
			});
			$scope.city = '';
		};

		$scope.removeCity = function(city){
			var deleteCity = $window.confirm('Are you sure you want to delete?');
			if(deleteCity){
				trips.removeCity(trip._id, city._id);
				var _city = $scope.cities.indexOf(city);
				$scope.cities.splice(_city, 1);
			}
		};

		$scope.viewMap = false;

		function centerMap(){
			var city = $scope.cities.pop();
			$scope.map = { center: { latitude: city.latitude, longitude:  city.longitude}, zoom: 8 };
			$scope.cities.push(city);

		}
	}
]);

app.controller('CityCtrl', [ '$scope', '$window', 'city', 'cities', 'auth',
	function($scope, $window, city, cities, auth){
		$scope.city = city;
		$scope.hotels = city.hotels;
		$scope.points = city.points;
		$scope.isLoggedIn = auth.isLoggedIn;

        $scope.autocompleteOptions = {
            types: ['establishment']
        };

        $scope.addHotel = function(){
			if($scope.place === '') { return; }

			console.log(city);

			cities.addHotel(city._id, {
				name: $scope.place.name,
				address: $scope.place.formatted_address,
				telephone:$scope.place.formatted_phone_number,
				longitude: $scope.place.geometry.location.F,
				latitude: $scope.place.geometry.location.A,
				icon: $scope.place.icon
			}).success(function(place) {
				$scope.hotels.push(place);
				//centerMap();
			});
			$scope.place = '';
		};

		$scope.removeHotel = function(hotel){
			var deleteHotel = $window.confirm('Are you sure you want to delete?');
			if(deleteHotel){
				cities.removeHotel(city._id, hotel._id);
				var _hotel = $scope.hotels.indexOf(hotel);
				$scope.hotels.splice(_hotel, 1);
			}
		};

		$scope.addPoint = function(){
			if($scope.newPoint === '') { return; }

			cities.addPoint(city._id, {
				name: $scope.newPoint.name,
				address: $scope.newPoint.formatted_address,
				longitude: $scope.newPoint.geometry.location.F,
				latitude: $scope.newPoint.geometry.location.A,
				icon: $scope.newPoint.icon
			}).success(function(place) {
				$scope.points.push(place);
			});
			$scope.newPoint = '';
		};

		$scope.removePoint = function(point){
			var deletePoint = $window.confirm('Are you sure you want to delete?');
			if(deletePoint){
				cities.removePoint(city._id, point._id);
				var _point = $scope.points.indexOf(point);
				$scope.points.splice(_point, 1);
			}
		};

	}
]);

app.controller('HotelCtrl', [ '$scope', 'hotel', 'hotels', 'auth',
	function($scope, hotel, hotels, auth){
		$scope.hotel = hotel;
		$scope.isLoggedIn = auth.isLoggedIn;
	}
]);

app.controller('PointCtrl', [ '$scope', 'point', 'auth', 'cities',
	function($scope, point, auth, cities){
		$scope.point = point;
		$scope.isLoggedIn = auth.isLoggedIn;
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

		$stateProvider.state('city', {
		  url: '/trips/{id}/city/{city}',
		  templateUrl: '/cityDescription.html',
		  controller: 'CityCtrl',
		  resolve: {
			city: ['$stateParams', 'trips', function($stateParams, trips) {
			  return trips.getCity($stateParams.id, $stateParams.city);
			}]
		  }
		});

		$stateProvider.state('hotel', {
		  url: '/city/{city}/hotel/{hotel}',
		  templateUrl: '/hotelDescription.html',
		  controller: 'HotelCtrl',
		  resolve: {
			hotel: ['$stateParams', 'cities', function($stateParams, cities) {
			  return cities.getHotel($stateParams.city, $stateParams.hotel);
			}]
		  }
		});

		$stateProvider.state('pointOfInterest', {
		  url: '/city/{city}/point/{point}',
		  templateUrl: '/pointDetails.html',
		  controller: 'PointCtrl',
		  resolve: {
			point: ['$stateParams', 'cities', function($stateParams, cities) {
			  return cities.getPoint($stateParams.city, $stateParams.point);
			}]
		  }
		});

		$urlRouterProvider.otherwise('gettingStarted');
	}
]);