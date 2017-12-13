angular.module("pinterest")
    .controller("CollectionCtrl", CollectionCtrl);

CollectionCtrl.$inject = ["$http", "$state", "$cookies", "$rootScope"];

function CollectionCtrl($http, $state, $cookies, $rootScope) {
    var vm = this;

    console.log($state.params);
    var collectionId = $state.params.id;

    vm.collectionPins = [];
    vm.showModal = false;

    $http.get("/api/get/collection/" + collectionId)
        .success(function (res) {
            console.log(res);
            vm.collection = res;
            document.getElementById("PinterestTitle").innerHTML = vm.collection.title;
        })
        .error(function (err) {
            console.log(err);
        });

    $http.get("/api/get/collectionPins/" + collectionId)
        .success(function (res) {
            console.log(res);
            res.forEach(function (t) {
                $http.get("/api/get/collectionPin/" + t.image)
                    .success(function (res) {
                        vm.collectionPins.push(res);
                    })
                    .error(function (err) {
                        console.log(err);
                    });
            });
        })
        .error(function (err) {
            console.log(err);
        });

    vm.currentPin = function (index) {
        vm.index = index;
        vm.curPin = vm.collectionPins[index];
        vm.showModal = true;
        document.getElementById('body').style.overflowY = 'hidden';
    };

    vm.closePin = function () {
        vm.curPin = {};
        vm.showModal = false;
        vm.index = -1;
        document.getElementById('body').style.overflowY = 'visible';
        document.getElementById('modal-interest-center').scrollTop = 0;
    };

    vm.deletePinCollection = function (imageId) {
        $http.delete("/api/delete/save/" + collectionId + "/" + imageId)
            .success(function (res) {
                console.log(res);
                vm.collectionPins.splice(vm.index, 1);
                vm.closePin();
            })
            .error(function (err) {
                console.log(err);
            });
    };

    vm.ProfileOrUser = function (id) {
        $http.get("/api/get/ProfileOrUser/" + id)
            .success(function (res) {
                console.log(res);
                if (res) {
                    $state.go("profile");
                } else {
                    $state.go("user", {id: id});
                }
            })
            .error(function (err) {
                console.log(err);
            });
    }
}