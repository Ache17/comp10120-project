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
        account_dialog : false,
        about_us_dialog : false,
        contact_us_dialog : false,
        ethics_dialog: false,
        external_dialog: false,
        ownership_dialog: false,
        login_dialog : false,
        register_dialog: false,
        new_password_dialog: false,
        username : "",
        password : "",
        mail : "",
        isPwd : true,
        token : "",
        playlist_title : "",
        playlist_genre : "",
        playlist_description : "",
        number_of_tracks : 1,
        public: false,
        private: false,
        dense: true,
        playlist_search_text: "",
        song_search_text: "",
        user_search_text: "",
        tab: true,
        loc: "",
        first_name: "",
        last_name: "",
        last_login: "",
        date_joined: "",
        landing_dialog: false,               // REMEMBER TO CHANGE THIS BACK
        fab1: false,
        hideLabels: false,
        num_of_playlists: 0,
        profile_edit: false,
        username_f: "",
        mail_f: "",
        password_f: "",
        barStyle: {
          right: '2px',
          borderRadius: '9px',
          backgroundColor: 'light-blue-10',
          width: '9px',
          opacity: 0.2
        },
        username_current: "",
        password_old: "",
        password_new: "",
        searchUsers: [{"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""},
                      {"username":"","first_name":"","last_name":""}],
          searchMade: false,
          profile_dialog: false,
          current_profile: 0,
          playlists: [],

          // image_name: "",
          playlist_image: null,
          view_own_playlist_dialog: false,
          current_playlist: {},
          sort_filter: "",
          sort_options: ["Playlist Title [Alphabetical]", "Users' Ratings", "Genre [Alphabetical]"],
          sort_selection: "Playlist Title [Alphabetical]",
          order_options: ["Ascending", "Descending"],
          order_selection: "Ascending",
          populated: false,
          tracks_shown: false
    },
    delimiters: ['[%', '%]'],

    methods:
    {
        // getHeaders()
        // {
        //   return [{name: 'Authorization', value: "Token " + this.token }];
        // },
        // getUrl(files)
        // {
        //     return document.location.origin + "/api/upload";
        // },
        sucessNotification(msg)
        {
            app.$q.notify({type : "positive", message : msg});
        },
        failureNotification(msg)
        {
            app.$q.notify({type : "negative", message : msg});
        },
        playlistSubmissionSuccess(req)
        {
          app.$q.notify({ type : "positive", message : "Playlist successfully created!"});
          this.create_playlist_dialog = false;
        },
        playlistSubmissionFailure(req)
        {
          app.$q.notify({type : "negative", message : "playlist not submitted"});
        },
        make_authenticated_request(data, method, path, success_callback, failure_callback)
        {
          if (this.token === "")
            return;

          let addr = document.location.origin;
          var authRequest = new XMLHttpRequest();
          authRequest.open(method, addr + path, true);
          authRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          authRequest.setRequestHeader("Authorization", "Token " + this.token);
          authRequest.addEventListener("load", () =>
          {
              var response = authRequest.response;
              var returned_json = JSON.parse(response);
              if (authRequest.status < 300 && authRequest.status >= 200)
              {
                success_callback(authRequest);
              }
              else
              {
                failure_callback(authRequest);
              }
          });
          authRequest.send(JSON.stringify(data));

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
                    document.cookie = "test" + "=" + (returned_json["token"]);
                    this.sucessNotification("Login Successful");
                    this.username_f = this.username;
                    this.password_f = this.password;
                    this.mail_f = this.mail;
                    this.login_dialog = false;
                    this.landing_dialog = false;
                    var data = {};
                    this.make_authenticated_request(data, "GET", "/api/userPlaylists", this.retrievePlaylistColectionSuccess, this.retrievePlaylistColectionFailure);
                }
                else
                {
                    this.failureNotification("Login Unsuccessful");
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
                    this.submitLogin(evt);
                }
                else
                {
                    this.failureNotification("Registration not sucessful!");
                }
            });
            registerRequest.send(JSON.stringify({"username" : app.username, "password" : app.password, "email" : app.mail}));
        },
        // ___  _              _  _      _      ___                  _    _
        // | _ \| | __ _  _  _ | |(_) ___| |_   / __| _ _  ___  __ _ | |_ (_) ___  _ _
        // |  _/| |/ _` || || || || |(_-<|  _| | (__ | '_|/ -_)/ _` ||  _|| |/ _ \| ' \
        // |_|  |_|\__,_| \_, ||_||_|/__/ \__|  \___||_|  \___|\__,_| \__||_|\___/|_||_|
        //               |__/
        createPlaylist(){
          if (this.token != ""){
            this.number_of_tracks = 1;
            this.create_playlist_dialog = true;
          }
          else{
            this.failureNotification("You aren't logged in!");
          }
        },
        // This is performed upon the user clicking the Submit Playlist button.
        submitPlaylist()
        {
          var NumberOfTracks = this.number_of_tracks;
          var Tracks = [];
          var Track = {};
          for (var i = 1; i <= NumberOfTracks; i++)
          {
            Track = {"name":document.getElementById("TitleInput" + i).value,
                     "author":document.getElementById("ArtistInput" + i).value}
            Tracks.push(Track)
          }
          // This here is the file that is submitted.
          console.log(this.playlist_image)
          // Then this is the playlist data JSON file.
          data =
          {
            "name": this.playlist_title,
          	"genre": this.playlist_genre,
          	"image": this.playlist_image,
          	"description": this.playlist_description,
            "isPublic": this.public,
            "Tracks": Tracks
          };
          this.make_authenticated_request(data, "POST", "/api/userPlaylists", this.playlistSubmissionSuccess, this.playlistSubmissionFailure);
        },
        imgUploaded(info){
          image_name = info.xhr.response;
        },
        imgNotUploaded(info){
          image_name = "";
        },
        // Makes sure you're logged in before showing you the account page.
        retrieveAccount(){
          if (this.token != ""){
            var data = {};
            this.make_authenticated_request(data, "GET", "/api/userInfo", this.retrieveAccountSuccess, this.retrieveAccountFailure);
            this.account_dialog = true;
          }
          else{
            this.failureNotification("You aren't logged in!");
          }
        },
        retrieveAccountSuccess(req){
          data = JSON.parse(req.response);
          this.loc = data.location;
          this.mail_f = data.email;
          this.first_name = data.first_name;
          this.last_name = data.last_name;
          this.date_joined = this.dateClean(data.date_joined);
          this.last_login = data.last_login;
          this.profile_edit = false;
        },
        retrieveAccountFailure(req){
          this.failureNotification("Account Details Not Found");
        },
        dateClean(date){
          var year = date.substring(0,4);
          var month = date.substring(5,7);
          var day = date.substring(8,10);
          return day + "/" + month + "/" + year;
        },
        // Executes when the user submits their changed account details - object created and this is passed through to the server with a PUT request.
        submitAccountChanges(){
          data =
          {
            "username": this.username_f,
            "first_name": this.first_name,
            "last_name": this.last_name,
          	"email": this.mail_f,
            "last_login": this.last_login,
            "date_joined": this.date_joined,
            "location": this.loc
          };
          this.make_authenticated_request(data, "PUT", "/api/userInfo", this.submitAccountSuccess, this.submitAccountFailure);
        },
        // Displays success message upon the account details being updated.
        submitAccountSuccess(){
          this.sucessNotification("Account Details Updated");
        },
        // Displays failure message upon the account details not being updated.
        submitAccountFailure(){
          this.failureNotification("Account Details Not Updated");
        },
        // Requests an account password change.
        submitPasswordChange(){
          data =
          {
            Username: this.username_current,
          	OldPassword: this.password_old,
            NewPassword: this.password_new
          };
          this.make_authenticated_request(data, "PUT", "/api/userInfo", this.submitAccountSuccess, this.submitAccountFailure);
        },
        // retrieves ten user accounts' details upon the user entering their search
        userSearch(){
          var data = this.user_search_text;
          this.make_authenticated_request(data, "GET", "/api/searchUsers", this.searchUsersSuccess, this.searchUsersFailure);
        },
        // Adds all the retrieved data in the users array
        searchUsersSuccess(req){
          data = JSON.parse(req.response);
          var i;
          for (i = 0; i < data.length; i++){
            this.searchUsers[i] = data[i];
          }
          this.searchMade = true;
        },
        searchUsersFailure(req){
          this.failureNotification("Search Failed.");
        },
        selectUser(num){
          this.current_profile = num;
        },
         //  ___   _                 _   _        _        ___         _   _              _     _                  ___   _             __    __
         // | _ \ | |  __ _   _  _  | | (_)  ___ | |_     / __|  ___  | | | |  ___   __  | |_  (_)  ___   _ _     / __| | |_   _  _   / _|  / _|
         // |  _/ | | / _` | | || | | | | | (_-< |  _|   | (__  / _ \ | | | | / -_) / _| |  _| | | / _ \ | ' \    \__ \ |  _| | || | |  _| |  _|
         // |_|   |_| \__,_|  \_, | |_| |_| /__/  \__|    \___| \___/ |_| |_| \___| \__|  \__| |_| \___/ |_||_|   |___/  \__|  \_,_| |_|   |_|
         //                   |__/
        retrievePlaylistCollection(){
          if (this.token != ""){
            var data = {};
            this.make_authenticated_request(data, "GET", "/api/userPlaylists", this.retrievePlaylistColectionSuccess, this.retrievePlaylistColectionFailure);
            this.my_playlists_dialog = true;
          }
          else{
            this.failureNotification("You aren't logged in!");
          }
        },
        sortCollection(){
          this.make_authenticated_request(data, "GET", "/api/userPlaylists", this.retrievePlaylistColectionSuccess, this.retrievePlaylistColectionFailure);
          if (this.sort_filter != ""){
            this.playlists = this.playlists.filter(el => el.name.includes(this.sort_filter));
          }
          if (this.sort_selection == this.sort_options[0]){
            this.playlists = this.playlists.sort(this.sorting("name"));
          }
          else if (this.sort_selection == this.sort_options[1]){
            this.playlists = this.playlists.sort(this.sorting("rating"));
          }
          else if (this.sort_selection == this.sort_options[2]){
            this.playlists = this.playlists.sort(this.sorting("genre"));
          }
          if (this.order_selection == "Descending"){
            this.playlists = this.playlists.reverse();
          }
        },
        // Used for sorting an array of objects, in this case the array of playlists.
        sorting(sortby) {
            return function (a,b) {
                var result = (a[sortby] < b[sortby]) ? -1 : (a[sortby] > b[sortby]) ? 1 : 0;
                return result;
            }
        },
        // Opens the page for viewing / editing one of your selected playlists.
        selectPlaylist(id){
          if (this.token != ""){
            this.current_playlist = this.playlists.filter(el => el.id == id)[0];
            this.number_of_tracks = this.current_playlist.songs.length;
            this.view_own_playlist_dialog = true;
            console.log(this.current_playlist);
            this.tracks_shown = false;
            this.populated = false;
          }
          else{
            this.failureNotification("You aren't logged in!");
          }
        },
        // When you select one of your playlists to edit, you can delete it too.
        deletePlaylist(){
          this.make_authenticated_request(this.current_playlist, "DELETE", "/api/userPlaylists", this.deletePlaylistSuccess, this.deletePlaylistFailure);
        },
        // When a request for one's playlists is successful, the response is parsed and stored in the relevant array.
        retrievePlaylistColectionSuccess(req){
          data = JSON.parse(req.response);
          var i;
          for (i = 0; i < data.length; i++){
            this.playlists[i] = data[i];
          }
        },
        updatePlaylist(){
          this.make_authenticated_request(this.current_playlist, "DELETE", "/api/userPlaylists", this.noMsg, this.deletePlaylistFailure);
          var NumberOfTracks = this.number_of_tracks;
          var Tracks = [];
          var Track = {};
          for (var i = 1; i <= NumberOfTracks; i++)
          {
            Track = {"name":document.getElementById("TitleInput" + i).value,
                     "author":document.getElementById("ArtistInput" + i).value}
            Tracks.push(Track)
          }
          // This here is the file that is submitted.
          console.log(this.playlist_image)
          // Then this is the playlist data JSON file.
          data =
          {
            "name": this.current_playlist.name,
          	"genre": this.current_playlist.genre,
          	"image": this.playlist_image,
          	"description": this.current_playlist.description,
            "isPublic": this.public,
            "Tracks": Tracks
          };
          this.make_authenticated_request(data, "POST", "/api/userPlaylists", this.playlistUpdateSuccess, this.playlistUpdateFailure);
        },
        noMsg(req){

        },
        retrievePlaylistColectionFailure(req){
          this.failureNotification("Failed to retrieve collection.");
        },
        // For some reason, deleted playlists would only be removed if you
        // refreshed the page (even if you made a new get request).
        // The deletion DOES work on the backend, but I've just made it so it's
        // removed from the local array as this was the only way it wouldn't bug out.
        deletePlaylistSuccess(req){
          this.sucessNotification("Playlist deleted.");
          var index = null;
          // runs through the playlists and find the one which has the id of
          // the one deleted, and removes it from the array.
          for (var i = 0; i < this.playlists.length; i++){
            if (this.playlists[i].id == this.current_playlist.id){
              index = i;
            }
          }
          if (index !=null){
            this.playlists.splice(index,1);
          }
          console.log(this.playlists);
          this.view_own_playlist_dialog = false;
        },
        deletePlaylistFailure(req){
          this.failureNotification("Failed to delete playlist! It may have already been deleted.");
          this.view_own_playlist_dialog = false;
        },
        // Success/Error handling for when a user updates an existing playlist.
        playlistUpdateSuccess(req){
          this.sucessNotification("Successfully updated playlist!");
          this.view_own_playlist_dialog = false;
        },
        playlistUpdateFailure(req){
          this.failureNotification("Failed to update playlist!");
        }
    }
  });

 //  ______ ______ ______ ______ ______ ______ ______ ______ ______ ______ ______ ______ ______ ______ ______
 // |______|______|______|______|______|______|______|______|______|______|______|______|______|______|______|
 // |  __ \| |           | (_)   | |   |__   __|           | |    | |  | |               | | (_)
 // | |__) | | __ _ _   _| |_ ___| |_     | |_ __ __ _  ___| | __ | |__| | __ _ _ __   __| | |_ _ __   __ _
 // |  ___/| |/ _` | | | | | / __| __|    | | '__/ _` |/ __| |/ / |  __  |/ _` | '_ \ / _` | | | '_ \ / _` |
 // | |    | | (_| | |_| | | \__ \ |_     | | | | (_| | (__|   <  | |  | | (_| | | | | (_| | | | | | | (_| |
 // |_|    |_|\__,_|\__, |_|_|___/\__|    |_|_|  \__,_|\___|_|\_\ |_|  |_|\__,_|_| |_|\__,_|_|_|_| |_|\__, |
 //                  __/ |                                                                             __/ |
 //  ______ ______ _|___/ ______ ______ ______ ______ ______ ______ ______ ______ ______ ______ ______|___/__
 // |______|______|______|______|______|______|______|______|______|______|______|______|______|______|______|

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
  if (app.populated == false && app.view_own_playlist_dialog == true){
    console.log(app.current_playlist);
    PopulateExistingTracks(app.current_playlist.songs.length, app.current_playlist.songs);
    app.populated = true;
  }
}

// Takes a track number, and uses jQuery to dynamically append HTML elements to the document which can be identified by their track number.
function CreateTrackInput(i)
{
  // Elements + attributes etc. for the appending of track inputs.
  TitleInput = $("<input>").attr("id", "TitleInput" + i).attr("placeholder", "Track Title").css("width", "40%").css("margin-left", "5%");
  ArtistInput = $("<input>").attr("id", "ArtistInput" + i).attr("placeholder", "Artist Name").css("width", "30%"); // The value of the artist name can be automatically populated as the user has already entered this during the album's creation, although can be altered if desired.
  YearInput = $("<input>").attr("id", "YearInput" + i).attr("type", "number").attr("min", "1860").attr("max", "2030").attr("placeholder", "Year").css("width", "10%");
  RatingInput = $("<input>").attr("id", "RatingInput" + i).attr("type", "number").attr("min", "1").attr("max", "5").attr("placeholder", "Rating").css("width", "10%");;
  BreakLine = $("<br><br>").attr("id", "Break" + i);
  // Appends all of these elements to the HTML document.
  $("#TrackInputs").append(TitleInput, ArtistInput, YearInput, RatingInput, BreakLine);
}

function PopulateExistingTracks(number, data){
  for (var i = 1; i <= number; i++){
    document.getElementById("TitleInput" + i).value = data[i-1].name;
    document.getElementById("ArtistInput" + i).value = data[i-1].author;
    // document.getElementById("YearInput" + i).value = data[0].year;
    // document.getElementById("TitleInput" + i).value = data[0].name;
  }
}
