
var locations = [{
    name: 'Cubbon Park',
    coordinates: {lat: 12.976347, lng: 77.592928},
},
{
    name: 'Ranga Shankara',
    coordinates: {lat: 12.911468, lng: 77.587120},
},
{
    name: 'Ameoba',
    coordinates: {lat: 12.974678, lng: 77.604903},
},
{
    name: 'Bangalore Turf Club',
    coordinates: {lat: 12.984151, lng: 77.582604},
},
{
    name: 'WonderLa',
    coordinates: {lat: 12.834556, lng: 77.400972},
},
{
    name: 'Dyu Art Cafe',
    coordinates: {lat: 12.937331, lng: 77.617650},
},
{
    name: 'IamGame',
    coordinates: {lat: 12.942260, lng: 77.622240},
}
];


// array with data for Foursquare API
var foursquareLoginData = {
    url: 'https://api.foursquare.com/v2/venues/search',
    dataType: 'json',
    clientID: 'P3PO3R001WTA2J40KSMAJT4SUNAFTHZXJMUO4HLTRM4AHYZP',
    clientSecret: 'WKXD1AWUUG2VZKNTCSP4FB2XC15HAESYY00LUIWTDRQ3ILDY',
    searchNear: 'Bangalore',
    requestDate: 20180121,
    venueLink: "https://foursquare.com/v/"
};

// global map variable
var map;

// Map marker variable
var marker;

// InfoWindow element
var infoWindow;

// array to store map markers
var markers = [];

//function that does initial site loading

function initMap() {

    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 12.972442, lng: 77.580643},
        zoom: 11
    });

    infoWindow = new google.maps.InfoWindow();

    for (var i = 0; i < locations.length; i++) {
            marker = new google.maps.Marker({
                map: map,
                position: locations[i].coordinates,
                title: locations[i].name,
                animation: google.maps.Animation.DROP,
            });

            markers.push(marker);
            appViewModel.listLocations()[i].marker = marker;
            marker.addListener('click', );
    }
}


// Setup googleMapError function
function googleMapError() {
    alert("Google Map could not be loaded at this moment. Please try again later");
}

// Display all data in InfoWindow
function populateInfoWindow(marker, infoWindow) {

    var venue;
    var infoWindowOutput;

    $.ajax({
        //  type: 'GET',
        url: foursquareLoginData.url,
        dataType: foursquareLoginData.dataType,
        data: {
            client_id: foursquareLoginData.clientID,
            client_secret: foursquareLoginData.clientSecret,
            query: marker.title,
            near: foursquareLoginData.searchNear,
            v: foursquareLoginData.requestDate // version equals date
        },
        success: function(data) {
            // get venue data
            venue = data.response.venues[0];

            // check to see whether any data is returned
            if (venue === null) {
                infoWindowOutput = "<div class='name'>No Venues are found. Please try again later.</div>";
            }
            else {
                // populates infowindow
                infoWindowOutput = "<div class='name'>" + "Name: " + "<span class='info'>" + marker.title + "</span></div>" +
                                "<div class='address'>" + "Location: " + "<span class='info'>" + venue.location.formattedAddress[0] + "</span></div>" +
                                "<div class='foursquareInfo'>" + "Checkout on Foresquare: " + "<a href='" + foursquareLoginData.venueLink + venue.id + "'>" + "More" + "</a></div>";
            }

            infoWindow.setContent(infoWindowOutput);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);

            infoWindow.open(map, marker);

            infoWindow.addListener('closeclick', function() {
                infoWindow.setMarker = null;
            });
        },
        error: function() {
            alert('Foursquare data could not be loaded at this moment. Please try again later.');
        }
    });
}

// Location object Constructor
var Location = function(data) {
    var self = this;
    self.title = data.name;
    self.location = data.coordinates;
    self.isShown = ko.observable(true);
};

// VIEWMODEL function //
var ViewModel = function() {
    var self = this;
    self.listLocations = ko.observableArray();
    self.userFilterInput = ko.observable('');

    for (var i = 0; i < locations.length; i++) {
        self.listLocations.push(new Location(locations[i]));
    }

    self.searchFilter = ko.computed(function() {
        var userInput = self.userFilterInput().toLowerCase();
        var currentLocation;

        for (var j = 0; j < self.listLocations().length; j++) {
            currentLocation = self.listLocations()[j];
            if (currentLocation.title.toLowerCase().indexOf(userInput) > -1) {
                // shows only locations that match
                currentLocation.isShown(true);

                // show the ones that match
                if (currentLocation.marker) {
                    currentLocation.marker.setVisible(true);
                }
            } else {
                currentLocation.isShown(false);
                if (currentLocation.marker) {
                    currentLocation.marker.setVisible(false);
                }
            }
        } 
    });

    // trigger marker
    self.clickedLocationOnMap = function(clickedListItem) {
        google.maps.event.trigger(clickedListItem.marker, 'click');
    };
};

// create new the ViewModel object
var appViewModel = new ViewModel();

// apply binding
ko.applyBindings(appViewModel);
