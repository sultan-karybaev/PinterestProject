angular.module("pinterest")
    .controller("HeaderCtrl", HeaderCtrl);

HeaderCtrl.$inject = ["$http", "$state", "$cookies", "$rootScope"];

function HeaderCtrl($http, $state, $cookies, $rootScope) {
    var vm = this;

    vm.allCollections = function () {
        $rootScope.allColl = true;
    };

    vm.logout = function () {
        $http.post("/api/post/logout")
            .success(function (response) {
                //$rootScope.session = false;
                $state.go("authorization");
            })
            .error(function (err) {
                console.log(err);
            });
    }
}