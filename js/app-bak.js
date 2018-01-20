/**
 * Description:
 * Author: apple
 * Date: 2018/1/19.
 */

var filterInputText = ko.observable("");
var apiUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&api-key=3b7cde7f451b40c188a24572f14dbc45&q=';
var map, infoWindow;

var Place = function(data) {
    "use strict";
    var self = this
    this.title = data.title
    this.position = data.value
    this.query = data.query

    this.visible = ko.computed(function(){
        var re = filterInputText().toLowerCase();
        var placeName = self.title.toLowerCase();

        return (placeName.indexOf(re) !== -1)
    });

    this.marker = new google.maps.Marker({
        position: self.position,
        title: self.title,
        animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(self.marker, "click", function(){
        // open infoWindow
        infoWindow.setContent(self.title);
        infoWindow.open(map, self.marker);

        if(self.marker.getAnimation() !== null){
            self.marker.setAnimation(null);
        } else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){
                self.marker.setAnimation(null);
            }, 2000)
        }

        $.ajax({
            url: apiUrl + self.query + ', shenzhen',
            datType: 'json',
            timeout: 5000
        }).done(function(data){
            console.log(data)
            infoWindow.setContent(data.response.docs[0].snippet)
        })
    })
};

var viewModel = function () {
    "use strict";
    this.placesList = [];
    var self = this;
    positionList.forEach(function(position){
        self.placesList.push(new Place(position))
    });

    this.placesList.forEach(function(place){
        console.log(place.position)
        place.marker.setMap(map, place.position)
    });

    this.filteredList = ko.computed(function(){
        var result = [];
        self.placesList.forEach(function(place){
            if (place.visible()) {
                result.push(place)
                place.marker.setMap(map, place.positon);
            } else {
                place.marker.setMap(null)
            }
        });

        return result;
    })

    this.listClick = function(place) {
        google.maps.event.trigger(place.marker, 'click');
    }
}

function init() {
    "use strict";
    map = new google.maps.Map(document.getElementById('map'), {center: positionList[3].value, zoom: 13  });
    infoWindow = new google.maps.InfoWindow();
    ko.applyBindings(new viewModel());
}

function loadMapError() {
    "use strict";
    alert('error load map');
}