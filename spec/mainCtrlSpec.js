/**
 * Created by erica on 21/06/15.
 */

describe("Main Controller", function() {

    beforeEach(function(){
        module('travelNotebook');
    });

    var MainController, scope;
    var factory_trip;

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();

        var factory_auth = {
            isLoggedIn: function() { return true; }
        };

        factory_trip = {
            trips: [],

            getAll: function() {
                this.trips = ["Trip1", "Trip2", "Trip3"];
                return this.trips;
            },

            remove: function() {
                this.trips = ["Trip1", "Trip2"];
                return this.trips;
            }
        };

        initialize = function(){
             MainController = $controller('MainCtrl', {
                $scope: scope,
                trips: factory_trip,
                auth: factory_auth
            });
        }
    }));

    it('fetch all trips', function () {
        factory_trip.getAll();
        initialize();
        expect(scope.trips).toEqual(["Trip1", "Trip2", "Trip3"]);
    });

    it('remove trip', function () {
        factory_trip.remove();
        initialize();
        expect(scope.trips).toEqual(["Trip1", "Trip2"]);
    });

});