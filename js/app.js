/**
 * Description:
 * Author: apple
 * Date: 2018/1/19.
 */

var filterInputText = ko.observable("");
var map, infoWindow;

var Location = function(data) {
    this.data = data
    var _this = this

    this.isMatched = ko.computed(function(){
        return isFilterMatched(filterInputText(), _this.data.title)
    });

    this.marker = new google.maps.Marker({
        title: _this.data.title,
        position: _this.data.position,
        animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(_this.marker, "click", function(){
        infoWindow.setContent(_this.data.title);
        infoWindow.open(map, _this.marker);
        doMarkClick(_this.marker);
        getNews(_this.data.query);
    })
};

var viewModel = function () {
    this.locationList = [];
    var _this = this;

    positionList.forEach(function(position){
        let location = new Location(position);
        _this.locationList.push(location);
        location.marker.setMap(map, location.data.position);
    });

    this.filteredList = ko.computed(function(){
        var result = [];
        _this.locationList.forEach(function(location){
            if (location.isMatched()) {
                result.push(location)
                location.marker.setMap(map, location.data.positon);
            } else {
                location.marker.setMap(null)
            }
        });

        return result;
    });

    this.listItemClick = function(location) {
        google.maps.event.trigger(location.marker, 'click');
        if (screen.width <= 600) {
            $('#filter').hide();
            $('#right-panel').removeClass('show-filter').addClass('full-screen');
        }
    }
}

function init() {
    const zoom =  13;
    map = new google.maps.Map(document.getElementById('map'), {center: positionList[4].position, zoom: zoom});
    infoWindow = new google.maps.InfoWindow();
    // menu bind click event
    $('#menu-icon').click(function(){
        var isHiddenFilter = !$('#filter').is(':hidden')
        menuClick(isHiddenFilter);
    });
    ko.applyBindings(new viewModel());
}

function isFilterMatched (filterText, fullText) {
    var formatFilterText = filterText.toLowerCase();
    var formatFullText = fullText.toLowerCase();
    return (formatFullText.indexOf(formatFilterText) !== -1);
}

function doMarkClick (marker) {
    if(marker.getAnimation() !== null){
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            marker.setAnimation(null);
        }, 3000)
    }
}

function getNews(query) {
    var apiUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&api-key=3b7cde7f451b40c188a24572f14dbc45&q=';
    $.ajax({
        url: apiUrl + query + ', shenzhen',
        datType: 'json',
        timeout: 10000
    }).done(function(data){
        if(data && data.response && data.response.docs.length > 0 ) {
            infoWindow.setContent(data.response.docs[0].snippet);
        } else{
            infoWindow.setContent('暂无数据');
        }
    }).fail(function(){
        infoWindow.setContent('数据获取失败');
    })
}

function menuClick(isHiddenFilter) {
    if (isHiddenFilter) {
        $('#filter').hide();
        $('#right-panel').removeClass('show-filter').addClass('full-screen');
    } else {
        $('#filter').show();
        $('#right-panel').removeClass('full-screen').addClass('show-filter');
    }
}

function loadMapError() {
    $('#map').html('<p class="error-tips">地图数据加载失败！</p>')
}
