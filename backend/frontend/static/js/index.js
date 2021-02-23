let test;

var app = new Vue({
    el: '#app',
    data: {
        message : "Hello world!",
        left : false,
        right : false,
        maximizedToggle : true,
        my_playlists_dialog: false,
        create_playlist_dialog: false,
        search_dialog : false,
        login_dialog : false,
        settings_dialog : false,
        login_dialog : false,
        register_dialog: false,
        username : "",
        password : "",
        mail : "",
        isPwd : true,
        token : "",
        playlist_title : "",
        playlist_genre : "",
        playlist_description : "",
        number_of_tracks : 0,
        public: false
    },
    delimiters: ['[%', '%]'],
    methods: 
    {
        sucessNotification(msg)
        {
            app.$q.notify({
                    type : "positive",
                    message : msg});
        },
        failureNotification(msg)
        {
            app.$q.notify({
                    type : "negative",
                    message : msg
                });
        },
        submitLogin(evt)
        {
            // console.log("@submit login", evt);
            let addr = document.location.origin;
            var loginRequest = new XMLHttpRequest();
            loginRequest.open("POST", addr + "/api/auth", true);
            loginRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            loginRequest.addEventListener("load", () =>
            {
                var response = loginRequest.response;
                var returned_json = JSON.parse(response);
                if (loginRequest.status < 300 && loginRequest.status >= 200)
                {
                    this.token = returned_json["token"];
                    this.sucessNotification("login sucessfull !");
                    this.login_dialog = false;
                }
                else
                {
                    this.failureNotification("login not sucessfull !");
                }

            });
            console.log({"username" : this.username, "password" : this.password});
            loginRequest.send(JSON.stringify({"username" : this.username, "password" : this.password}));

        },
        submitRegister(evt)
        {
            //console.log("register submitted", evt);
            let addr = document.location.origin;
            var registerRequest = new XMLHttpRequest();
            registerRequest.open("POST", addr + "/api/register", true);
            registerRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            registerRequest.addEventListener("load", () => {
                if (registerRequest.status < 300 && registerRequest.status >= 200)
                {
                    this.sucessNotification("Registration sucessful!");
                }
                else
                {
                    this.failureNotification("Registration not sucessful!");
                }
            });


            registerRequest.send(JSON.stringify({"username" : app.username, "password" : app.password, "mail" : app.mail}));

            // do XHR
        },
        // This is performed upon the user clicking the Submit Playlist button.
        submitPlaylist()
        {
          var NumberOfTracks = this.number_of_tracks;
          var Tracks = [];
          var Track = {};
          for (var i = 1; i <= NumberOfTracks; i++)
          {
            Track = {Title:document.getElementById("TitleInput" + i).value, 
                     Artist:document.getElementById("ArtistInput" + i).value, 
                     Year:document.getElementById("YearInput" + i).value, 
                     Rating:document.getElementById("YearInput" + i).value}
            Tracks.push(Track)
          }
          data =
          {
            PlaylistTitle: this.playlist_title,
          	PlaylistGenre: this.playlist_genre,
          	// ImageURL: ImageURL,
          	Description: this.playlist_description,
            Public: this.public,
            Tracks: Tracks
          };

          let addr = document.location.origin;
          var addPlaylistRequest = new XMLHttpRequest();
          addPlaylistRequest.open("POST", addr + "/api/addPlaylist", true);
          addPlaylistRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          addPlaylistRequest.addEventListener("load", () =>
          {
              var response = addPlaylistRequest.response;
              var returned_json = JSON.parse(response);
              console.log(returned_json);
              if (addPlaylistRequest.status < 300 && addPlaylistRequest.status >= 200)
              {

              }
              else
              {

              }
          });
          console.log("nice@");
          console.log(data);
          addPlaylistRequest.send(JSON.stringify(data));
        }
    }
  });

// Function is called whenever the user changes the counter for the number of tracks to be in the playlist, and essentially generates the suitable number of inputs that is required.
function TrackNumberChange()
{
  var number_of_tracks = app.number_of_tracks;
  // Cycles through the number of tracks determined by the user. If they have increased the number of tracks, then there will be track inputs that need to be created, and so performs this when necessary.
  for (var i = 1; i <= number_of_tracks; i++)
  {
    var element = document.getElementById("TitleInput" + i);
    if(!element)
    {
      CreateTrackInput(i);
    }
  }
  // If the user decreases the counter, then the no longer required track inputs can be removed from the document, using jQuery.
  for (var i = number_of_tracks + 1; i <= 50; i++)
  {
    $("#TitleInput" + i).remove();
    $("#ArtistInput" + i).remove();
    $("#YearInput" + i).remove();
    $("#RatingInput" + i).remove();
    $("#Break" + i).remove();
  }
}

// Takes a track number, and uses jQuery to dynamically append HTML elements to the document which can be identified by their track number.
function CreateTrackInput(i)
{
  // Elements + attributes etc. for the appending of track inputs.
  TitleInput = $("<input>").attr("id", "TitleInput" + i).attr("placeholder", "Track Title").attr("size", "40");
  ArtistInput = $("<input>").attr("id", "ArtistInput" + i).attr("placeholder", "Artist Name").attr("size", "30"); // The value of the artist name can be automatically populated as the user has already entered this during the album's creation, although can be altered if desired.
  YearInput = $("<input>").attr("id", "YearInput" + i).attr("type", "number").attr("min", "1860").attr("max", "2030").attr("placeholder", "Year");
  RatingInput = $("<input>").attr("id", "RatingInput" + i).attr("type", "number").attr("min", "1").attr("max", "5").attr("placeholder", "Rating").attr("style", "width: 7em");;
  BreakLine = $("<br><br>").attr("id", "Break" + i);
  // Appends all of these elements to the HTML document.
  $("#TrackInputs").append(TitleInput, ArtistInput, YearInput, RatingInput, BreakLine);
}
