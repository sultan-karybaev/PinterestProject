angular.module("pinterest")
    .controller("AuthorizationCtrl", AuthorizationCtrl);

AuthorizationCtrl.$inject = ["$http", "$state", "$cookies", "$rootScope"];

function AuthorizationCtrl($http, $state, $cookies, $rootScope) {
    var vm = this;

    $rootScope.userSession = false;

    var Ev = document.getElementById("authorization");
    console.log(Ev);
    Ev.addEventListener("keypress", function (e) {
        if (e.key === "Enter") vm.inputCkeckingLogin();
    });

    vm.loginForm = true;
    vm.signupForm = false;
    vm.male = "unchosen";
    vm.female = "unchosen";

    //Sing up
    vm.firstnameError = false;
    vm.lastnameError = false;
    vm.choosesexError = false;
    vm.ageError = false;
    vm.emailError = false;
    vm.passwordError = false;
    vm.repeatpasswordError = false;
    vm.samepasswordError = false;

    //Log in
    vm.emailLoginError = false;
    vm.passwordLoginError = false;

    //Sing up
    vm.firstnameClassInput = "pinterest--input--white";
    vm.lastnameClassInput = "pinterest--input--white";
    vm.choosesexClassInput = "pinterest--input--white";
    vm.ageClassInput = "pinterest--input--white";
    vm.emailClassInput = "pinterest--input--white";
    vm.passwordClassInput = "pinterest--input--white";
    vm.repeatpasswordClassInput = "pinterest--input--white";

    //Log in
    vm.emailLoginClassInput = "pinterest--input--white";
    vm.passwordLoginClassInput = "pinterest--input--white";

    vm.changeForm = function () {
        //Sing up
        vm.firstnameInput = "";
        vm.lastnameInput = "";
        vm.ageInput = "";
        vm.male = "unchosen";
        vm.female = "unchosen";
        vm.emailInput = "";
        vm.passwordInput = "";
        vm.repeatpasswordInput = "";

        //Log in
        vm.emailLoginInput = "";
        vm.passwordLoginInput = "";

        //Sing up
        vm.firstnameError = false;
        vm.lastnameError = false;
        vm.choosesexError = false;
        vm.ageError = false;
        vm.emailError = false;
        vm.passwordError = false;
        vm.repeatpasswordError = false;
        vm.samepasswordError = false;

        //Log in
        vm.emailLoginError = false;
        vm.passwordLoginError = false;

        //Sing up
        vm.firstnameClassInput = "pinterest--input--white";
        vm.lastnameClassInput = "pinterest--input--white";
        vm.choosesexClassInput = "pinterest--input--white";
        vm.ageClassInput = "pinterest--input--white";
        vm.emailClassInput = "pinterest--input--white";
        vm.passwordClassInput = "pinterest--input--white";
        vm.repeatpasswordClassInput = "pinterest--input--white";

        //Log in
        vm.emailLoginClassInput = "pinterest--input--white";
        vm.passwordLoginClassInput = "pinterest--input--white";
    };

    vm.inputCkeckingSingup = function () {
        vm.firstnameError = false;
        vm.lastnameError = false;
        vm.choosesexError = false;
        vm.ageError = false;
        vm.emailError = false;
        vm.passwordError = false;
        vm.repeatpasswordError = false;
        vm.samepasswordError = false;

        vm.firstnameClassInput = "pinterest--input--white";
        vm.lastnameClassInput = "pinterest--input--white";
        vm.choosesexClassInput = "pinterest--input--white";
        vm.ageClassInput = "pinterest--input--white";
        vm.emailClassInput = "pinterest--input--white";
        vm.passwordClassInput = "pinterest--input--white";
        vm.repeatpasswordClassInput = "pinterest--input--white";

        if (!vm.firstnameInput) {
            vm.firstnameError = true;
            vm.firstnameClassInput = "pinterest--input--red";
        }
        if (!vm.lastnameInput) {
            vm.lastnameError = true;
            vm.lastnameClassInput = "pinterest--input--red";
        }
        if (vm.male === "unchosen" && vm.female === "unchosen") {
            vm.choosesexError = true;
        }
        if (!vm.ageInput) {
            vm.ageError = true;
            vm.ageClassInput = "pinterest--input--red";
        }
        if (!vm.emailInput) {
            vm.emailError = true;
            vm.emailClassInput = "pinterest--input--red";
        }
        if (!vm.passwordInput) {
            vm.passwordError = true;
            vm.passwordClassInput = "pinterest--input--red";
        }
        if (!vm.repeatpasswordInput) {
            vm.repeatpasswordError = true;
            vm.repeatpasswordClassInput = "pinterest--input--red";
        }
        if (vm.passwordInput && vm.repeatpasswordInput) {
            if (vm.passwordInput !== vm.repeatpasswordInput) {
                vm.samepasswordError = true;
                vm.passwordClassInput = "pinterest--input--red";
                vm.repeatpasswordClassInput = "pinterest--input--red";
            }
        }

        if (!vm.firstnameError && !vm.lastnameError && !vm.choosesexError && !vm.ageError && !vm.emailError && !vm.passwordError
            && !vm.repeatpasswordError && !vm.samepasswordError) {
            console.log("You signed up!!!");
            SignUp();
        }
    };

    vm.inputCkeckingLogin = function () {
        vm.emailLoginError = false;
        vm.passwordLoginError = false;

        vm.emailLoginClassInput = "pinterest--input--white";
        vm.passwordLoginClassInput = "pinterest--input--white";

        if (!vm.emailLoginInput) {
            vm.emailLoginError = true;
            vm.emailLoginClassInput = "pinterest--input--red";
        }
        if (!vm.passwordLoginInput) {
            vm.passwordLoginError = true;
            vm.passwordLoginClassInput = "pinterest--input--red";
        }
        if (!vm.emailLoginError && !vm.passwordLoginError) {
            console.log("You logged in!!!");
            LogIn();
        }
    };

    var SignUp = function () {
        var sexCode;

        if (vm.male === "chosen") {
            sexCode = 2;
        } else {
            sexCode = 1;
        }

        var data = {
            firstname: vm.firstnameInput,
            lastname: vm.lastnameInput,
            sex: sexCode,
            age: vm.ageInput,
            email: vm.emailInput,
            password: vm.passwordInput
        };

        $http.post("/api/post/signup", data)
            .success(function (response) {
                $rootScope.session = true;
                console.log("Good");
                //vm.inputError = false;
                $state.go("home");
            })
            .error(function (err) {
                //vm.inputError = true;
                console.log("Bad");
                console.log(err);
            });
    };

    var LogIn = function () {
        var data = {
            email: vm.emailLoginInput,
            password: vm.passwordLoginInput
        };

        $http.post("/api/post/login", data)
            .success(function (response) {
                $rootScope.session = true;
                console.log("Good");
                //vm.inputError = false;
                $state.go("home");
            })
            .error(function (err) {
                //vm.inputError = true;
                console.log("Bad");
                console.log(err);
            });
    }
}