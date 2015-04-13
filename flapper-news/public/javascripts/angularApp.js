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

app.factory('posts', ['$http', 'auth', function($http, auth){
	  var o = {
	    posts: []
	  };

	  o.getAll = function() {
	    return $http.get('/posts').success(function(data){
	      angular.copy(data, o.posts);
	    });
	  };

	  
	  o.create = function(post) {
		return $http.post('/posts', post, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			o.posts.push(data);
		});
	  };

	  o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res){
			return res.data;
		});
	  };
	  		  
	  return o;
}]);

app.controller('MainCtrl', [
'$scope',
'posts',
'auth',
function($scope, posts, auth){
	$scope.posts = posts.posts;
	$scope.isLoggedIn = auth.isLoggedIn;


	$scope.addPost = function(){
	  if(!$scope.name || $scope.name === '') { return; }
	  posts.create({
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

app.controller('PostsCtrl', [
'$scope',
'posts',
'post',
'auth',
'$state',
function($scope, posts, post, auth, $state){
  	$scope.post = post;
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
	    postPromise: ['posts', function(posts){
	      return posts.getAll();
	    }]
  	  }
    });
  
  $stateProvider.state('posts', {
	  url: '/posts/{id}',
	  templateUrl: '/posts.html',
	  controller: 'PostsCtrl',
	  resolve: {
	    post: ['$stateParams', 'posts', function($stateParams, posts) {
	      return posts.get($stateParams.id);
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