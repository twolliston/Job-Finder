//function to make both search fields required
function validate() {

  //Checking to make sure that the where field is filled out
  if (document.myForm.where.value == "") {
    //if not filled out launch whereMessage function
    whereMessage();
    document.myForm.where.focus();
    return false;
  }
  //Checking to make sure the type of job field is filled out
  if (document.myForm.type.value == "") {
    //if not filled out launch typeMessage function
    typeMessage();
    document.myForm.type.focus();
    return false;
  }
  return (true);
}

//Hides the 2 alerts for the input fields right away
$('#where').hide();
$('#type').hide();
//function to show the required message for the where input
function whereMessage() {
  $('#where').slideDown(1000);
  $('#where').delay(1000);
  $('#where').slideUp(1000);
}
//function to show the required message for the type input
function typeMessage() {
  $('#type').slideDown(1000);
  $('#type').delay(1000);
  $('#type').slideUp(1000);
}


// Global variables
// Empty arrays to collect location of search and company names from results
var searchArea = [];
var companies = [];

// Map variables
var map;
var service;
var infowindow;

// Map boolean for reset function, set to false
var isMapLoaded = false;

//---------------------------------------------------------------------------------------------------------------------

// Reset function
function resetMap() {
  // Clear out array data
  searchArea = [];
  companies = [];
  // Clear out content divs
  $("#map").empty();
  $("#resultsTable").empty();
}

//---------------------------------------------------------------------------------------------------------------------

// Main app logic
$("#submit-search").on("click", function (event) {
  event.preventDefault();

  // Check if map needs to be reset
  resetMap();
  validate();

  // Capture values entered
  var locationInput = $("#location-input").val().trim();
  var keywordInput = $("#keyword-input").val().trim();

  // Empty input fields
  $("#location-input").val("");
  $("#keyword-input").val("");

  // Set up URL for API request, include authorization token 
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.careeronestop.org/v1/jobsearch/lrBD3vbyFOxQtUb/" + keywordInput + "/" + locationInput + "/25/0/0/0/10/60",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer qA9NVS//BpInzmVsOODQ+tXhlgqTsKNa+ZFaOLvijHR04Jrr/3Jzdi2eJoOVrHE1/8L2MEnzLxeaJ4zV9uTkLA==",
      "Cache-Control": "no-cache",
      "Postman-Token": "0cab4fd0-14c7-44d0-8e24-ce787a7a188b"
    }
  }

  // Ajax request
  $.ajax(settings).done(function (response) {

    // Loop over response
    var resultsNum = response.Jobs.length;
    for (var i = 0; i < resultsNum; i++) {
      var jobListing = response.Jobs[i];

      // Convert job posting date/time result from returned format into days or months
      var dateConvert = jobListing.AccquisitionDate.split(" ");
      var calendarDate = dateConvert[0];
      var daysAgo = moment(calendarDate).fromNow();

      // Relevant job posting results stored as variables
      var title = jobListing.JobTitle;
      var company = jobListing.Company;
      var location = jobListing.Location;
      var postdate = jobListing.AccquisitionDate;
      var jobid = jobListing.JvId;
      var url = jobListing.URL;

      // Variable for location of jobListing to set map location context
      address = jobListing.Location;
      // Push to array         
      searchArea.push(address);

      // Variable for company names
      placeName = jobListing.Company;
      // Push to array
      companies.push(placeName);

      // Logic to determine if user is logged in
      if (email_id) {
        // Load search results to html with the save button if user is logged in
        var newRow = $("#resultsTable")
          .append($('<tr>')
            .append($('<td>').append(jobListing.JobTitle).attr("data-jobtitle", jobListing.JobTitle))
            .append($('<td>').append(jobListing.Company).attr("data-jobcompany", jobListing.Company))
            .append($('<td>').append(jobListing.Location).attr("data-joblocation", jobListing.Location))
            .append($('<td>').append(daysAgo).attr("data-dateposted", jobListing.AccquisitionDate))
            .append($('<td>').html("<a href='" + jobListing.URL + "' target='_blank'> Apply</a>").attr("data-url", jobListing.URL))
            .append($("<td>").html("<button data-title='" + title + "' data-company='" + company + "' data-location='" + location + "' data-postdate='" + postdate + "' data-url= '" + url + "' data-search= '" + keywordInput + "' data-jobid='" + jobid + "' type='button' class='btn-sm btn-primary' id='save-jobs'>Save</button>"))
          );
      } else {
        // Load search results to html without the save button if user not logged in
        var newRow = $("#resultsTable")
          .append($('<tr>')
            .append($('<td>').append(jobListing.JobTitle).attr("data-jobtitle", jobListing.JobTitle))
            .append($('<td>').append(jobListing.Company).attr("data-jobcompany", jobListing.Company))
            .append($('<td>').append(jobListing.Location).attr("data-joblocation", jobListing.Location))
            .append($('<td>').append(daysAgo).attr("data-dateposted", jobListing.AccquisitionDate))
            .append($('<td>').html("<a href='" + jobListing.URL + "' target='_blank'> Apply</a>").attr("data-url", jobListing.URL))
          );
      }
    }

    // Display content area 
    $(".content-wrapper").show();

    // Call map function, generate map with result markers
    initMap();

    // Set isMapLoaded to true
    isMapLoaded = true;

  });
});

//---------------------------------------------------------------------------------------------------------------------

// Initialize map function
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10.5
  });

  // Use Google's geocoder to center map to the area searched
  var geocoder = new google.maps.Geocoder;
  geocoder.geocode({ 'address': searchArea[0] }, function (results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
    } else {
      window.alert('Geocode was not successful for the following reason: ' +
        status);
    };
  });

  // Query the Places library for the company name within the search area
  for (var i = 0; i < companies.length; i++) {
    var request = {
      query: companies[i] + " in " + searchArea[i],
      fields: ['formatted_address', 'name'],
    }
    // console.log(request);
    service = new google.maps.places.PlacesService(map);
    infowindow = new google.maps.InfoWindow();
    service.textSearch(request, callback);
  }
}

// Return the query results
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      // console.log(place);
      createMarker(place);
    }
  }
}

// Create map markers for each result returned
function createMarker(place) {
  var marker = new google.maps.Marker({
    position: place.geometry.location,
    animation: google.maps.Animation.DROP,
    map: map
  });

  // Generate an info window when an individual marker is clicked
  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
      '<br>' +
      place.formatted_address + '</div>');
    infowindow.open(map, this);
  });
}

function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
