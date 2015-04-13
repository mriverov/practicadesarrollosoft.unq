var app = angular.module('flapperNews', ['ui.router', 'angularMoment']);

app.factory('auth', ['$http', '$window', function($http, $window){
   	var auth = {};

   	auth.saveToken = function (token){
	  $window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['flapper-news-token'];
	}

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
}])

app.factory('trips', ['$http', 'auth', function($http, auth){
	  var o = {
	    trips: []
	  };

	  o.getAll = function() {
	    return $http.get('/trips').success(function(data){
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
			return res.data;
		});
	  };
	  		  
	  return o;
}]);

app.controller('MainCtrl', [
'$scope',
'trips',
'auth',
function($scope, trips, auth){
	$scope.trips = trips.trips;
	$scope.isLoggedIn = auth.isLoggedIn;


	$scope.addTrip = function(){
	  if(!$scope.name || $scope.name === '') { return; }
	  trips.create({
	    name: $scope.name,
	    description: $scope.description,
	  });
	  $scope.name = '';
	  $scope.description = '';
	};

	$scope.setOrder = function (order, reverse) {
        $scope.order = order;
        $scope.reverse = reverse; 
    };

}]);

app.controller('TripsCtrl', [
'$scope',
'trips',
'trip',
'auth',
'$state',
function($scope, trips, trip, auth, $state){
  	$scope.trip = trip;
  	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.returnHome = function(){
	  $state.go('home');
	}

}]);

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
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
}])

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
	    postPromise: ['trips', function(trips){
	      return trips.getAll();
	    }]
  	  }
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

  $urlRouterProvider.otherwise('home');
}]);