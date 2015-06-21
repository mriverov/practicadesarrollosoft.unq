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
        MainController = $controller('MainCtrl', {
            $scope: scope
        });
    }));

    it('says hello world!', function () {
        expect(scope.predicate).toEqual("-name");
    });

});