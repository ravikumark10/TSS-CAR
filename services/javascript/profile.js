var app=angular.module("hms", [])
app.controller("controller", function ($scope,$http) {

  $http.get('/user_val').then(function(data){
    $scope.user=data.data;
  });
})