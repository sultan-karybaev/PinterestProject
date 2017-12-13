angular.module('pinterest',[
    'ui.router',
    'ngCookies'
])
    .config(routeConfig);

routeConfig.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider'];

    function routeConfig($stateProvider, $locationProvider, $urlRouterProvider) {

        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state("any", {
                url: '/',
                controller: function($http, $state, $cookies, $rootScope) {
                    if($cookies.get("sessionPinterestUserID")){
                        $state.go("home");
                    } else {
                        $state.go('authorization');
                        console.log($state);
                    }
                },
                controllerAs: "vm"
            })
            .state("home", {
                url: "/",
                templateUrl: "/views/home.html",
                controller: "HomeCtrl",
                controllerAs: "vm"
            })
            .state("authorization", {
                url: "/authorization",
                templateUrl: "/views/authorization.html",
                controller: "AuthorizationCtrl",
                controllerAs: "vm"
            })
            .state("adminpanel", {
                url: "/adminpanel",
                templateUrl: "/views/adminpanel.html",
                controller: "AdminpanelCtrl",
                controllerAs: "vm"
            })
            .state("mark", {
                url: "/mark/:id",
                templateUrl: "/views/mark.html",
                controller: "MarkCtrl",
                controllerAs: "vm"
            })
            .state("profile", {
                url: "/profile",
                templateUrl: "/views/profile.html",
                controller: "ProfileCtrl",
                controllerAs: "vm"
            })
            .state("user", {
                url: "/user/:id",
                templateUrl: "/views/user.html",
                controller: "UserCtrl",
                controllerAs: "vm"
            })
            .state("profile.collection", {
                url: "/collection/:id",
                templateUrl: "/views/collection.html",
                controller: "CollectionCtrl",
                controllerAs: "vm"
            })
            .state("collection", {
                url: "/collection/:id",
                templateUrl: "/views/collection.html",
                controller: "CollectionCtrl",
                controllerAs: "vm"
            });
    }
