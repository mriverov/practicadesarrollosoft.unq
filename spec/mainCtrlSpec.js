/**
 * Created by erica on 21/06/15.
 */

describe("Main Controller", function() {

    beforeEach(function(){
        module('travelNotebook');
    });

    var MainController, scope;

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();

        var factory_auth = {
            isLoggedIn: function() { return true; }
        };

        var factory_trip = {
            trips: [],
            getAll: function() {
                this.trips = ["Trip1", "Trip2", "Trip3"];
                return this.trips;
            }
        };

        factory_trip.getAll();

        MainController = $controller('MainCtrl', {
            $scope: scope,
            trips: factory_trip,
            auth: factory_auth
        });
    }));

    it('fetch all trips', function () {
        expect(scope.trips).toEqual(["Trip1", "Trip2", "Trip3"]);
    });

});