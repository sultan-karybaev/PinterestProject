angular.module("pinterest")
    .controller("ProfileCtrl", ProfileCtrl);

ProfileCtrl.$inject = ["$http", "$state", "$cookies", "$rootScope"];

function ProfileCtrl($http, $state, $cookies, $rootScope) {
    var vm = this;

    $rootScope.userSession = true;

    vm.collectionArray = [];

    vm.showModalCollection = false;
    vm.collectionNameError = false;
    vm.createCollectionButton = true;
    vm.editCollectionButton = false;

    vm.profileClearing = function () {
        vm.showModalCollection = false;
        vm.createCollectionButton = true;
        vm.editCollectionButton = false;
        vm.collectionId = "";
        vm.collectionName = "";
    };

    vm.showModal = function () {
        vm.showModalCollection = true;
    };

    $http.get("/api/get/profile")
        .success(function (res) {
            console.log(res);
            vm.profile = res;
            document.getElementById("PinterestTitle").innerHTML = vm.profile.firstname + " " + vm.profile.lastname;
        })
        .error(function (err) {
            console.log(err);
        });

    $http.get("/api/get/usercollections")
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

    vm.createCollectionChecking = function () {
        vm.collectionNameError = false;
        if (vm.collectionName === "") vm.collectionNameError = true;
        if (!vm.collectionNameError) createCollection();
    };

    function createCollection() {
        var data = {
            collectionName: vm.collectionName
        };
        $http.post("/api/post/collection", data)
            .success(function (resColl) {
                console.log(resColl);
                $http.get("/api/get/collectionImages4/" + resColl._id)
                    .success(function (res) {
                        if (res[0]) {resColl.image1 = res[0].imageWay;} else {resColl.image1 = "images/slate-grey.jpg"}
                        if (res[1]) {resColl.image2 = res[1].imageWay;} else {resColl.image2 = "images/slate-grey.jpg"}
                        if (res[2]) {resColl.image3 = res[2].imageWay;} else {resColl.image3 = "images/slate-grey.jpg"}
                        if (res[3]) {resColl.image4 = res[3].imageWay;} else {resColl.image4 = "images/slate-grey.jpg"}
                    })
                    .error(function (err) {
                        console.log(err);
                    });
                vm.collectionArray.push(resColl);
                vm.profileClearing();
            })
            .error(function (err) {
                console.log(err);
            });
    }

    vm.removeCollection = function (index) {
        var collectionId = vm.collectionArray[index]._id;
        $http.delete("/api/delete/collection/" + collectionId)
            .success(function (res) {
                console.log(res);
                vm.collectionArray.splice(index, 1);
            })
            .error(function (err) {
                console.log(err);
            });
    };

    var editIndex = -1;
    vm.editCollection = function (index) {
        editIndex = index;
        var coll = vm.collectionArray[index];
        vm.showModalCollection = true;
        vm.createCollectionButton = false;
        vm.editCollectionButton = true;
        vm.collectionName = coll.title;
        vm.collectionId = coll._id;
    };

    vm.editCollectionChecking = function () {
        vm.collectionNameError = false;
        if (vm.collectionId === "") vm.collectionNameError = true;
        if (vm.collectionName === "") vm.collectionNameError = true;
        if (!vm.collectionNameError) editCollection();
    };

    function editCollection() {
        var data = {
            collectionName: vm.collectionName
        };
        $http.put("/api/put/collection/" + vm.collectionId, data)
            .success(function (res) {
                console.log(res);
                vm.collectionArray[editIndex].title = vm.collectionName;
                editIndex = -1;
                vm.profileClearing();
            })
            .error(function (err) {
                console.log(err);
            });
    }
}