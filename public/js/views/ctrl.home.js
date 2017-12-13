angular.module("pinterest")
    .controller("HomeCtrl", HomeCtrl);

HomeCtrl.$inject = ["$http", "$state", "$cookies", "$rootScope"];

function HomeCtrl($http, $state, $cookies, $rootScope) {
    var vm = this;

    $rootScope.userSession = true;

    vm.pins = [];
    vm.userCollections = [];
    vm.curPin = {};

    vm.showModal = false;
    vm.showModalsavePin = false;

    document.getElementById("PinterestTitle").innerHTML = "Pinterest";

    $http.get("/api/get/pins")
        .success(function (response) {
            vm.pins = mix(response);
        })
        .error(function (err) {
            console.log(err);
        });

    function mix(array) {
        for (var i = 0; i < array.length; i++){
            var ran = Math.floor(Math.random() * array.length);
            var k = array[i];
            array[i] = array[ran];
            array[ran] = k;
        }
        return array
    }

    $http.get("/api/get/usercollections")
        .success(function (res) {
            vm.userCollections = res;
            vm.userCollections.forEach(function (t) {
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

    vm.currentPin = function (index) {
        vm.curPin = vm.pins[index];
        vm.showModal = true;
        document.getElementById('body').style.overflowY = 'hidden';
    };

    vm.closePin = function () {
        vm.curPin = {};
        vm.showModal = false;
        document.getElementById('body').style.overflowY = 'visible';
        document.getElementById('modal-interest-center').scrollTop = 0;
    };

    vm.pinSaveModal = function () {
        vm.showModalsavePin = true;
    };

    vm.pinSave = function (collectionId) {
        var data = {
            pin: vm.curPin._id,
            coll: collectionId,
            imageWay: vm.curPin.image
        };
        $http.post("/api/post/save", data)
            .success(function (res) {
                console.log(res);
                vm.showModalsavePin = false;
            })
            .error(function (err) {
                console.log(err);
            });
    }
}