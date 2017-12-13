angular.module("pinterest")
    .controller("UserCtrl", UserCtrl);

UserCtrl.$inject = ["$http", "$state", "$cookies", "$rootScope"];

function UserCtrl($http, $state, $cookies, $rootScope) {
    var vm = this;

    $rootScope.userSession = true;

    var userId = $state.params.id;

    vm.collectionArray = [];

    $http.get("/api/get/user/" + userId)
        .success(function (res) {
            console.log(res);
            vm.user = res;
            document.getElementById("PinterestTitle").innerHTML = vm.user.firstname + " " + vm.user.lastname;
        })
        .error(function (err) {
            console.log(err);
        });

    $http.get("/api/get/usercollectionsID/" + userId)
        .success(function (res) {
            console.log(res);
            vm.collectionArray = res;
            vm.collectionArray.forEach(function (t) {
                $http.get("/api/get/collectionImages4/" + t._id)
                    .success(function (res) {
                        if (res[0]) {t.image1 = res[0].imageWay;} else {t.image1 = "images/slate-grey.jpg"}
                        if (res[1]) {t.image2 = res[1].imageWay;} else {t.image2 = "images/slate-grey.jpg"}
                        if (res[2]) {t.image3 = res[2].imageWay;} else {t.image3 = "images/slate-grey.jpg"}
                        if (res[3]) {t.image4 = res[3].imageWay;} else {t.image4 = "images/slate-grey.jpg"}
                    })
                    .error(function (err) {
                        console.log(err);
                    });
            })
        })
        .error(function (err) {
            console.log(err);
        });
}