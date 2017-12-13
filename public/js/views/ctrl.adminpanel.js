angular.module("pinterest")
    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])
    .controller("AdminpanelCtrl", AdminpanelCtrl);

AdminpanelCtrl.$inject = ["$http", "$state", "$cookies", "$rootScope", "$scope"];

function AdminpanelCtrl($http, $state, $cookies, $rootScope, $scope) {
    var vm = this;

    $rootScope.userSession = false;

    vm.getHome = function () {
        console.log("WTF");
    };

    const option = {
        transformRequest: angular.identity,
        headers: {"Content-Type": undefined}
    };

    // var fileInput  = document.querySelector( ".input-file" ),
    //     the_return = document.querySelector(".file-return");
    //
    // fileInput.addEventListener( "change", function( event ) {
    //     console.log(event);
    //     console.log(this);
    //     the_return.innerHTML = this.value;
    // });

    vm.addMark = true;
    vm.editMark = false;

    vm.addMarkChoose = "chosen";
    vm.allMarksChoose = "unchosen";
    vm.addMarkShow = true;
    vm.allMarksShow = false;

    vm.allMarksArray = [];
    vm.downloadImages = [];
    vm.editMarkImages = [];

    vm.sumbitButton = true;
    vm.editButton = false;

    vm.addmarkError = false;

    vm.addMarkFunction = function () {
        vm.addMark = true;
        vm.editMark = false;

        vm.addMarkChoose = 'chosen';
        vm.allMarksChoose = 'unchosen';
        vm.addMarkShow = true;
        vm.allMarksShow = false;

        vm.markId = "";
        vm.markTitle = "";
        vm.markDescription = "";
    };

    vm.allMarksFunction = function () {
        vm.addMark = true;
        vm.editMark = false;

        vm.addMarkChoose = 'unchosen';
        vm.allMarksChoose = 'chosen';
        vm.addMarkShow = false;
        vm.allMarksShow = true;

        vm.markId = "";
        vm.markTitle = "";
        vm.markDescription = "";

        $http.get("/api/get/allMarks")
            .success(function (res) {
                vm.allMarksArray = res;
                vm.allMarksArray.forEach(function (t) {
                    $http.get("/api/get/markImage/" + t._id)
                        .success(function (res) {
                            t.image = res;
                        })
                        .error(function (err) {
                            console.log(err);
                        });
                });
                console.log(res);
            })
            .error(function (err) {
                console.log(err);
            });
    };

    $scope.getFileDetails = function (e) {
        $scope.$apply(function () {
            for (var i = 0; i < e.files.length; i++) {
                vm.downloadImages.push(e.files[i])
            }
        });
    };

    vm.addmarkChecking = function () {
        vm.addmarkError = false;

        if (!vm.markTitle) {vm.addmarkError = true; console.log("Error vm.markTitle");}
        if (!vm.markDescription) {vm.addmarkError = true; console.log("Error vm.markDescription");}
        if (vm.downloadImages.length === 0) {vm.addmarkError = true; console.log("Error vm.markImages");}
        if (vm.downloadImages.length > 10) vm.addmarkError = true;
        if (!vm.addmarkError) {
            createMark();
        }
    };

    function createMark() {
        var data = new FormData();

        data.append("title", vm.markTitle);
        data.append("text", vm.markDescription);
        data.append("images",  vm.downloadImages.length);
        data.append("imagegridstyle",  vm.downloadImages.length);
        for (var i in vm.downloadImages) {
            data.append("downloadImages",  vm.downloadImages[i]);
        }

        $http.post("/api/post/mark", data, option)
            .success(function (response) {
                vm.downloadImages = [];
                console.log(response);
            })
            .error(function (err) {
                console.log(err);
            });

        vm.markTitle = "";
        vm.markDescription = "";
    }

    vm.allMarksRemove = function (index) {
        var markId = vm.allMarksArray[index]._id;
        $http.delete("/api/delete/mark/" + markId)
            .success(function (res) {
                vm.allMarksArray.splice(index, 1);
                console.log(res);
            })
            .error(function (err) {
                console.log(err)
            });
    };

    vm.allMarksEdit = function (index) {
        vm.addMark = false;
        vm.editMark = true;

        vm.addMarkChoose = 'chosen';
        vm.allMarksChoose = 'unchosen';
        vm.addMarkShow = true;
        vm.allMarksShow = false;

        var markId = vm.allMarksArray[index]._id;
        vm.markId = markId;
        vm.markTitle = vm.allMarksArray[index].title;
        vm.markDescription = vm.allMarksArray[index].text;

        $http.get("/api/get/editMarkImages/" + markId)
            .success(function (res) {
                vm.editMarkImages = res;
                console.log(res);
            })
            .error(function (err) {
                console.log(err)
            });
    };

    vm.removeMarkImage = function (index) {
        var imageId = vm.editMarkImages[index]._id;
        $http.delete("/api/delete/markImage/" + imageId)
            .success(function (res) {
                vm.editMarkImages.splice(index, 1);
                console.log(res);
            })
            .error(function (err) {
                console.log(err)
            });
    };

    vm.editMarkChecking = function () {
        vm.addmarkError = false;

        if (!vm.markTitle) vm.addmarkError = true;
        if (!vm.markDescription) vm.addmarkError = true;
        if (vm.downloadImages.length + vm.editMarkImages.length === 0) vm.addmarkError = true;
        if (vm.downloadImages.length + vm.editMarkImages.length > 10) vm.addmarkError = true;
        if (!vm.addmarkError) {
            editMark();
        }
    };


    function editMark() {
        var data = new FormData();

        data.append("title", vm.markTitle);
        data.append("text", vm.markDescription);
        data.append("images",  vm.downloadImages.length + vm.editMarkImages.length);
        data.append("imagegridstyle",  vm.downloadImages.length + vm.editMarkImages.length);
        for (var i in vm.downloadImages) {
            data.append("downloadImages",  vm.downloadImages[i]);
        }

        $http.put("/api/put/mark/" + vm.markId, data, option)
            .success(function (response) {
                vm.downloadImages = [];
                console.log(response);
            })
            .error(function (err) {
                console.log(err);
            });

        vm.markId = "";
        vm.markTitle = "";
        vm.markDescription = "";
    }
}