describe("Trip Controller", function() {

    beforeEach(function(){
        module('flapperNews');
    });

    var TripController, scope;
    var factory_city, city;

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();

        var factory_auth = {
            isLoggedIn: function() { return true; }
        };

         city={
            'address': 'Address',
            'longitude': 1,
            'latitude': 1,

        };
        
        factory_city = {

            cities: [],

            addCity: function() {
                console.log(city);
                this.cities = [city];
                console.log(" ACA");
                console.log(this.cities);
                return this.cities;
            },

            removeCity: function() {
                this.cities = [];
                return this.cities;
            }
        };

        initialize = function(){
             TripController = $controller('TripsCtrl', {
                $scope: scope,
                cities: factory_city,
                trip:{'cities':factory_city.cities},
                trips:[],
                auth: factory_auth
            });
        }
    }));

    it('add city', function () {
        factory_city.addCity();
        initialize();
        expect(scope.cities).toEqual([city]);
    });

    it('remove city', function () {
        factory_city.removeCity();
        initialize();
        expect(scope.cities).toEqual([]);
    });

});