// Initialize Firebase
var config = {
    apiKey: "AIzaSyCZ6TeAiNkV1QEFtAagMdl7OYFCE_8dNfc",
    authDomain: "jobmapper-bf9e0.firebaseapp.com",
    databaseURL: "https://jobmapper-bf9e0.firebaseio.com",
    projectId: "jobmapper-bf9e0",
    storageBucket: "jobmapper-bf9e0.appspot.com",
    messagingSenderId: "673548275473"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

//store user login information
var user = firebase.auth().currentUser;


// initalize global varables
var email_id = "";
var user_uid = "";

// Hide success message
$('#success').hide();
 // Hide delete message
 $('#delete-success').hide();



//This function displays success message after data is added to database
function successMessage() {
    $('#success').slideDown(1000);
    $('#success').delay(1000);
    $('#success').slideUp(1000);
}

//This function displays success message after data is removed from database
function removeMessage() {
    $('#delete-success').slideDown(1000);
    $('#delete-success').delay(1000);
    $('#delete-success').slideUp(1000);
}


//enable the search button if keyword-input and location-input have been filled
$("form").on('submit', function (e) {
    e.preventDefault();
});


firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        document.getElementById("user_div").style.display = "block";
        document.getElementById("login_div").style.display = "none";

        // display user information
        // console.log(user);
        // console.log(user.uid);

        // Store user login information
        var user = firebase.auth().currentUser;

        if (user != null) {
            email_id = user.email;
            user_uid = user.uid;
            document.getElementById("user_para").innerHTML = "Welcome: " + email_id;
        }
    } else {
        // No user is signed in.
        document.getElementById("user_div").style.display = "none";
        document.getElementById("login_div").style.display = "block";
        document.getElementById("user_para").innerHTML = "Good Bye: ";
    }
});

// login into fireBase database
function login() {

    var userEmail = document.getElementById("userEmail").value;
    var userPassword = document.getElementById("userPassword").value;

    firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).then(function () {

        // Sign-in successful.
        // window.alert("Sign-in successful.");

    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        window.alert("Error :" + errorMessage);
    });

}

// sign up for access to fireBase database
function signup() {

    var userEmail = document.getElementById("userEmail").value;
    var userPassword = document.getElementById("userPassword").value;

    // window.alert(userEmail + " " + userPassword);

    firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword).then(function (user) {


    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        //create a user node in real-time database


        // ...
    });
}

// login out fireBase database
function logout() {
    // alert("log out");

    // sign out of firebase database
    firebase.auth().signOut();

    // hide search results
    $(".content-wrapper").hide();

    // clear current email-id
    email_id = "";
    user_uid = "";
}

// Add event listner for when user clicks the save button
$(document).on("click", "#save-jobs", function (event) {
    event.preventDefault();

    // Grabs user input 
    var company = $(this).attr("data-company").trim();
    var title = $(this).attr("data-title").trim();
    var url = $(this).attr("data-url").trim();
    var postDate = $(this).attr("data-postdate").trim();
    var location = $(this).attr("data-location").trim();
    var search = $(this).attr("data-search").trim();
    var jobid = $(this).attr("data-jobid");


    // Creates local "temporary" object for holding jobs data
    var newJob = {
        jobUser: email_id,
        jobCompany: company,
        jobTitle: title,
        jobUrl: url,
        jobPostdate: postDate,
        jobLocation: location,
        jobsearch: search
    };

    // Push jobs data to the database
    // console.log(newJob);
    // console.log("here in doc click");
    // console.log(jobid);


    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            database.ref("users").child(user.uid).child(jobid).update(newJob);

            // ...
        } else {
            // User is signed out.
            // ...
        }
    });


    // alert("Add to database successfull");
    successMessage();

});


// Enable the search button if keyword-input and location-input have been filled
$("form").on('submit', function (e) {
    e.preventDefault();
});


// Add event listner for when user clicks the delete button
$(document).on("click", "#delete-jobs", function (event) {
    event.preventDefault();

    // key database key
    database.ref($(this).attr("data-dbkey")).remove();

    // alert("Delete job from database successfull");
    removeMessage();

    // load saved jobs from database into modal for display
    loadSavedjobs();

});

function loadSavedjobs() {

     // Empty search results this will prevent duplication of searches
     $("#savedJobs").empty();
     database.ref('/users/' + user_uid).once('value').then(function (snapshot) {
 
         // console.log(snapshot.val());
         snapshot.forEach(childSnapshot => {
 
             // console.log(childSnapshot.val());
             // console.log(childSnapshot.key);
             var childKey = "/users/" + user_uid + "/" + childSnapshot.key;
            //  console.log(childKey);
 
             // load search results to html with the save button if user not logged in
             var newRow = $("#savedJobs")
                 .append($('<tr>')
                     .append($('<td>').append(childSnapshot.val().jobTitle))
                     .append($('<td>').append(childSnapshot.val().jobCompany))
                     .append($('<td>').append(childSnapshot.val().jobLocation))
                     .append($('<td>').append(childSnapshot.val().jobPostdate))
                     .append($('<td>').html("<a href='" + childSnapshot.val().jobUrl + "' target='_blank'> Apply</a>").attr("data-url", childSnapshot.val().jobUrl))
                     .append($("<td>").html("<button data-dbkey='" + childKey + "' type='button' class='btn-sm btn-primary' id='delete-jobs'>Delete</button>"))
                 );
         });
 
     });

}


// Call for the saved jobs by checking the users UID directory
$("#callList").click(function () {

   // load saved jobs into modal for display
   loadSavedjobs();

});




