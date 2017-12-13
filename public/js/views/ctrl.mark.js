angular.module("pinterest")
    .controller("MarkCtrl", MarkCtrl);

MarkCtrl.$inject = ["$http", "$state", "$cookies", "$rootScope"];

function MarkCtrl($http, $state, $cookies, $rootScope) {
    var vm = this;

    $rootScope.userSession = true;

    vm.markId = $state.params.id;

    vm.markImages = [];
    vm.userCollections = [];
    vm.markComments = [];
    vm.curPin = {};

    vm.showModal = false;
    vm.showModalsavePin = false;
    vm.addMarkCommentError = false;

    vm.markComment = "";

    $http.get("/api/get/mark/" + vm.markId)
        .success(function (res) {
            console.log(res);
            vm.mark = res;
            document.getElementById("PinterestTitle").innerHTML = vm.mark.title;
            $http.get("/api/get/markImages/" + vm.markId)
                .success(function (res) {
                    console.log(res);
                    vm.markImages = res;
                    if (vm.mark.imagegridstyle === 4) {
                        var a = vm.markImages[0];
                        a.widthShow = 800;
                        a.heightShow = 450;
                        a.topShow = 0;
                        a.leftShow = 0;
                        var b = vm.markImages[1];
                        b.widthShow = 264;
                        b.heightShow = 200;
                        b.topShow = a.heightShow + 4;
                        b.leftShow = 0;
                        var c = vm.markImages[2];
                        c.widthShow = 264;
                        c.heightShow = 200;
                        c.topShow = a.heightShow + 4;
                        c.leftShow = b.widthShow + 4;
                        var d = vm.markImages[3];
                        d.widthShow = 264;
                        d.heightShow = 200;
                        d.topShow = a.heightShow + 4;
                        d.leftShow = c.leftShow + b.widthShow + 4;

                        vm.mark.height = b.topShow + b.heightShow;
                    }
                })
                .error(function (err) {
                    console.log(err);
                });
        })
        .error(function (err) {
            console.log(err);
        });

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

    $http.get("/api/get/markComments/" + vm.markId)
        .success(function (res) {
            console.log(res);
            vm.markComments = res;
        })
        .error(function (err) {
            console.log(err);
        });

    vm.currentPin = function (index) {
        vm.curPin = vm.markImages[index];
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
    };

    vm.addMarkCommentChecking = function () {
        vm.addMarkCommentError = false;
        if (vm.markComment === "") vm.addMarkCommentError = true;
        if (!vm.addMarkCommentError) addMarkComment();
    };

    function addMarkComment() {
        var data = {
            mark: vm.markId,
            text: vm.markComment
        };
        $http.post("/api/post/markComment", data)
            .success(function (res) {
                console.log(res);
                vm.markComments.push(res);
                vm.markComment = "";
            })
            .error(function (err) {
                console.log(err);
            });
    }

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