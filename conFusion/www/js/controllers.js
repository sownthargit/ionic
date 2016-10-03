angular.module('conFusion.controllers',[])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $scope.reservation = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

   // Create the reserve modal that we will use later
  $ionicModal.fromTemplateUrl('templates/reserve.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.reserveform = modal;
  });


  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Triggered in the reserve modal to close it
  $scope.closeReserve = function() {
    $scope.reserveform.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

    // Open the reserve modal
  $scope.reserve = function() {
    $scope.reserveform.show();
  };

  // Perform the reserve action when the user submits the reserve form
  $scope.doReserve = function() {
    console.log('Doing reservation', $scope.reservation);

    // Simulate a reservation delay. Remove this and replace with your reservation
    // code if using a server system
    $timeout(function() {
      $scope.closeReserve();
    }, 1000);

};
  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

})

.controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', 'baseURL','promotionFactory',
             function($scope, menuFactory, corporateFactory, baseURL, promotionFactory) {

            //console.log("controller");
            $scope.baseURL = baseURL;
            $scope.leader = corporateFactory.get({id:3});
            $scope.showDish = false;
            $scope.message="Loading ...";
            $scope.dish = menuFactory.get({id:0})
            .$promise.then(
                function(response){
                    $scope.dish = response;
                    $scope.showDish = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );
            $scope.promotion = promotionFactory.get({id:0});
}])

.controller('MenuController', ['$scope', 'menuFactory', 'baseURL','favoriteFactory', '$ionicListDelegate',
       function($scope, menuFactory, baseURL, favoriteFactory, $ionicListDelegate) {

            $scope.baseURL = baseURL;
            //console.log(baseURL);
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.showMenu = false;
            $scope.message = "loading...";

            $scope.dishes = menuFactory.query(
              function(response){
              console.log(response);
                $scope.dishes = response;
                $scope.showMenu = true;
                
            },
                function(response){
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            
            );

            //Add Favourite 
            $scope.addFavorite = function (index) {
              console.log("index is " + index);
              favoriteFactory.addToFavorites(index);
              $ionicListDelegate.closeOptionButtons();
            };

             $scope.select = function(setTab) {
                $scope.tab = setTab;
                
                if (setTab === 2) {
                    $scope.filtText = "appetizer";
                }
                else if (setTab === 3) {
                    $scope.filtText = "mains";
                }
                else if (setTab === 4) {
                    $scope.filtText = "dessert";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };
    
            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };

}])

//Controller for Favourite
.controller('FavoritesController', ['$scope', 'menuFactory', 'favoriteFactory', 'baseURL',
         '$ionicListDelegate','$ionicPopup', '$ionicLoading', '$timeout','dishes', 'favorites',
           function ($scope, menuFactory, favoriteFactory, baseURL, $ionicListDelegate,$ionicPopup, 
                      $ionicLoading, $timeout, dishes,favorites) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    $ionicLoading.show({
        template: '<ion-spinner></ion-spinner> Loading...'
    });

    $scope.favorites = favorites;

    /*$scope.dishes = menuFactory.query(
        function (response) {
            $scope.dishes = response;
            $timeout(function () {
                $ionicLoading.hide();
            }, 1000);
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
            $timeout(function () {
                $ionicLoading.hide();
            }, 1000);
        });*/

    $scope.dishes = dishes;

    console.log($scope.dishes, $scope.favorites);

    $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    }

    $scope.deleteFavorite = function (index) {


        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm Delete',
            template: 'Are you sure you want to delete this item?'
        });
        
         confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                favoriteFactory.deleteFromFavorites(index);
            } else {
                console.log('Canceled delete');
            }
        });

        $scope.shouldShowDelete = false;

    }}])

  .filter('favoriteFilter', function () {
      return function (dishes, favorites) {
          var out = [];
          for (var i = 0; i < favorites.length; i++) {
              for (var j = 0; j < dishes.length; j++) {
                  if (dishes[j].id === favorites[i].id)
                      out.push(dishes[j]);
              }
          }
          return out;

    }})

.controller('DishDetailController', ['$scope', '$stateParams', 'menuFactory', 'baseURL','$ionicPopover','favoriteFactory',
            '$ionicModal','dish', 
  function($scope, $stateParams, menuFactory, baseURL, $ionicPopover, favoriteFactory, $ionicModal,dish) {
            
            $scope.comments = {};
            $scope.baseURL = baseURL;
            $scope.showDish = false;
            $scope.message="Loading ...";
            /*$scope.dish = menuFactory.get({id:parseInt($stateParams.id,10)})
                .$promise.then(
                            function(response){
                                $scope.dish = response;
                                $scope.showDish = true;
                            },
                            function(response) {
                                $scope.message = "Error: "+response.status + " " + response.statusText;
                            }
            );*/
            $scope.dish = dish;

            $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
                  scope: $scope
                }).then(function(popover) {
                  $scope.popover = popover;
            });

            $scope.openPopOver = function($event){
              $scope.popover.show($event);
            };

            //Add Favourite 
            $scope.addFavorite = function (index) {
              console.log("index is " + index);
              favoriteFactory.addToFavorites(index);
              $scope.popover.hide();
            };      

            $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
                scope: $scope
              }).then(function(modal) {
                $scope.commentModal = modal;
            });

          $scope.addComments = function(){
            $scope.commentModal.show();
            $scope.popover.hide();
          };

          $scope.closeComments = function(){
            $scope.commentModal.hide();
          };

          $scope.doComment = function(){
              console.log($scope.comments);

              $scope.comments.date = new Date().toISOString();
              $scope.dish.comments.push($scope.comments);
              menuFactory.update({id:$scope.dish.id},$scope.dish);
              $scope.commentModal.hide();
          };


 }])
.controller('AboutController', ['$scope','corporateFactory','baseURL', function($scope, corporateFactory,baseURL){
    
            
            $scope.baseURL = baseURL;
            $scope.leaderList = corporateFactory.query(
            function(response){
              console.log(response);
                $scope.leaderList = response;
                console.log($scope.leaderList);
                //$scope.showMenu = true;
                
            },
                function(response){
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            
            );


            
    
        }])

;           