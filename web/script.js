function Camera($scope, $http) {
  $scope.fullDetails = [];
  $scope.fullStats = [];

  $scope.filteredDetails = [];
  $scope.searchKey = '';
  $scope.selectedItem = null;

  $scope.getData = function() {

    $scope.fullDetails = [];
    $scope.fullStats = [];


    $http.jsonp('http://dati.camera.it/sparql', {
        method: 'GET',
        params: {
            query: "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10",
            output: 'json'
        }
    }).success(function(res){
        console.log(res);
    });


    $http.get('dati.json')
    .success(function (data) {
      if (angular.isDefined(data.results)) {
        $scope.processDetails(data.results.bindings);
      }
    });

    $http.get('firme.json')
    .success(function (data) {
      if (angular.isDefined(data.results)) {
        $scope.processStatistics(data.results.bindings);
      }
    });

  };

  $scope.processDetails = function(dataFromCamera) {
    var deputato = [];

    dataFromCamera.forEach(function(element, index) {

      deputato = [];

      deputato.id = index;
      deputato.nome = element.nome.value.toLowerCase();
      deputato.cognome = element.cognome.value.toLowerCase();
      deputato.foto = element.foto.value;
      deputato.luogoNascita = element.luogoNascita.value.toLowerCase();
      deputato.dataNascita = $scope.parseDate(element.dataNascita.value);
      deputato.collegio = element.collegio.value.toLowerCase();
      deputato.uri = element.persona.value;

      if(angular.isDefined(element.facebook)) { deputato.facebook = element.facebook.value; }
      if(angular.isDefined(element.twitter)) { deputato.twitter = element.twitter.value; }
      if(angular.isDefined(element.youtube)) { deputato.youtube = element.youtube.value; }

      element.sigla.value == "MISTO" ? deputato.gruppo = element.nomeComponente.value.toLowerCase() : deputato.gruppo = element.nomeGruppo.value.toLowerCase();




      deputato.scheda = element.persona.value.toLowerCase();


      $scope.fullDetails.push(deputato);
    });
  }

  $scope.processStatistics = function(dataFromCamera) {
    var statistica = [];

    dataFromCamera.forEach(function(element, index) {

      statistica = [];
      statistica.uri = element.Uri.value;
      statistica.voti = element.Voti.value;

      $scope.fullStats.push(statistica);
    });
  }

  $scope.filterByName = function(data){
    $scope.filteredDetails = [];

    data.forEach(function(deputato) {

      if(($scope.matchRegularExp(deputato.nome + ' ' + deputato.cognome, $scope.searchKey) || $scope.matchRegularExp(deputato.cognome + ' ' + deputato.nome, $scope.searchKey)) && $scope.searchKey != '')
        {
          $scope.filteredDetails.push(deputato);
        }
    });
  }

  $scope.selectItem = function(id){
    $scope.fullDetails.forEach(function(item){
      if (item.id == id) {
        $scope.selectedItem = item;
      }
    });

    $scope.fullStats.forEach(function(stat){
      if (angular.equals(stat.uri,$scope.selectedItem.uri)) {
        $scope.selectedItem.stat = stat;
      }
    });
  }

  $scope.parseDate = function(date){

    var formattedDate = date.substring(6,8) + '/' + date.substring(4,6) + '/' + date.substring(0,4);
    return formattedDate;
  }

  $scope.resetSelectedItem = function(){
    $scope.selectedItem = null;
    $scope.searchKey = '';
  }

  $scope.matchRegularExp = function(field, keyword) {
    var include = false;
    try {include = new RegExp(keyword, "i").test(field)} catch(err) {console.log("Errore")};
    return include;
  }

  $scope.getData();
  $scope.$watch('searchKey', function(){$scope.filterByName($scope.fullDetails)}, true);

}