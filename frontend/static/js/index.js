var app = new Vue({
    el: '#app',

    data: {
        left: false,
        right: false,
        maximizedToggle: true,
        my_playlists_dialog: false,
        create_playlist_dialog: false,
        search_dialog: false,
        account_dialog: false,
        about_us_dialog: false,
        contact_us_dialog: false,
        ethics_dialog: false,
        external_dialog: false,
        ownership_dialog: false,
        login_dialog: false,
        register_dialog: false,
        new_password_dialog: false,
        // Login / Signup Details
        username: "",
        password: "",
        mail: "",
        isPwd: true,
        token: "",
        discover_playlists: [],
        // Playlist creation details, some reused for playlist editing.
        create_playlist_step: 1,
        playlist_title: "",
        playlist_genre: "",
        playlist_description: "",
        number_of_tracks: 1,
        tracks: [],
        isPublic: false,
        public: false,
        rating: 0,
        dense: true,
        playlist_menu_dropdown: false,
        // adding from external service details,
        spotify_window: false,
        editing_idx: -1,
        query: "",
        query_data: [],

        // Search tab details.
        playlist_search_text: "",
        song_search_text: "",
        user_search_text: "",
        tab: "Playlists",
        // Account Details (when you view / edit your own profile)
        loc: "",
        first_name: "",
        last_name: "",
        last_login: "",
        date_joined: "",
        followers: [],
        following: [],
        follow_id: null,
        landing_dialog: true, // TODO: should be true 
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
        searchMade: false,
        profile_dialog: false,
        current_profile: 0,
        // Viewing Playlist Collection Stuff
        playlists: [],
        // image_name: "",
        playlist_image: null,
        view_own_playlist_dialog: false,
        current_playlist: {},
        sort_filter: "",
        // Sorting Through Album Collection
        sort_options: ["Playlist Title [Alphabetical]", "Users' Ratings", "Genre [Alphabetical]"],
        sort_selection: "Playlist Title [Alphabetical]",
        order_options: ["Ascending", "Descending"],
        order_selection: "Ascending",
        populated: false,

        // search users functionality
        search_users: [],
        user_search_pagination_idx: 1,
        inspect_user: false,
        inspected_user_data: {},
        user_search_pages: 0,

        // search playlists functionality
        search_playlists: [],
        playlist_search_pagination_idx: 1,
        inspect_playlist: false,
        inspected_playlist_data: {},
        playlist_search_pages: 0,

        spotify_user_id: null

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
            // Generic response messages which can be called and the message is
            // passed through as the msg parameter.
            sucessNotification(msg) {
                app.$q.notify({type: "positive", message: msg});
            },
            failureNotification(msg) {
                app.$q.notify({type: "negative", message: msg});
            },
            discoverTrigger() {
                var data = {};
                this.make_authenticated_request(data, "GET", "/api/discover", this.discoverSuccess, this.noMsg);
                this.landing_dialog = false;
                this.$forceUpdate();
            },
            discoverSuccess(req) {
                this.$forceUpdate();
                data = JSON.parse(req.response);
                var i;
                for (i = 0; i < data.length; i++) {
                    if (data[i].link == "") {
                        data[i].link = "testing.png";
                    }
                    this.discover_playlists[i] = data[i];
                }
            },
            // Success message, closes tab.
            playlistSubmissionSuccess(req) {
                app.$q.notify({type: "positive", message: "Playlist successfully created!"});
                this.create_playlist_dialog = false;
            },
            playlistSubmissionFailure(req) {
                app.$q.notify({type: "negative", message: "playlist not submitted"});
            },
            // Arbitrary authenticated request method.
            make_authenticated_request(data, method, path, success_callback, failure_callback) {
                // store token in cookies
                let token = $cookies.get("token");

                let addr = document.location.origin;
                var authRequest = new XMLHttpRequest();
                authRequest.open(method, addr + path, true);
                authRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                authRequest.setRequestHeader("Authorization", "Token " + token);
                authRequest.addEventListener("load", () => {
                    var response = authRequest.response;
                    var returned_json = JSON.parse(response);
                    if (authRequest.status < 300 && authRequest.status >= 200) {
                        success_callback(authRequest);
                    } else {
                        failure_callback(authRequest);
                    }
                });
                authRequest.send(JSON.stringify(data));
            },
            //    ___                              __         __                _                             __        ___                _        __
            //   / _ | ____ ____ ___  __ __  ___  / /_       / /  ___   ___ _  (_)  ___       ___ _  ___  ___/ /       / _ \ ___   ___ _  (_)  ___ / /_ ___   ____
            //  / __ |/ __// __// _ \/ // / / _ \/ __/      / /__/ _ \ / _ `/ / /  / _ \     / _ `/ / _ \/ _  /       / , _// -_) / _ `/ / /  (_-</ __// -_) / __/
            // /_/ |_|\__/ \__/ \___/\_,_/ /_//_/\__/      /____/\___/ \_, / /_/  /_//_/     \_,_/ /_//_/\_,_/       /_/|_| \__/  \_, / /_/  /___/\__/ \__/ /_/
            //                                                        /___/                                                      /___/
            // Submit a login given a username and password, and handles the
            // response from backend.
            submitLogin(evt) {
                // console.log("@submit login", evt);
                let addr = document.location.origin;
                var loginRequest = new XMLHttpRequest();
                loginRequest.open("POST", addr + "/api/auth", true);
                loginRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                loginRequest.addEventListener("load", () => {
                    var response = loginRequest.response;
                    var returned_json = JSON.parse(response);
                    if (loginRequest.status < 300 && loginRequest.status >= 200) {
                        this.token = returned_json["token"];
                        $cookies.set("token", this.token);
                        this.sucessNotification("Login Successful");
                        this.username_f = this.username;
                        this.password_f = this.password;
                        this.mail_f = this.mail;
                        var last_login = new Date();
                        data =
                            {
                                "last_login": last_login
                            };
                        this.make_authenticated_request(data, "PUT", "/api/userInfo", this.noMsg, this.noMsg);
                        this.login_dialog = false;
                        this.landing_dialog = false;
                        var data = {};
                        this.make_authenticated_request(data, "GET", "/api/userPlaylists", this.retrievePlaylistColectionSuccess, this.retrievePlaylistColectionFailure);
                    } else {
                        this.failureNotification("Login Unsuccessful");
                    }

                });
                loginRequest.send(JSON.stringify({"username": this.username, "password": this.password}));
            },
            // Registers a new user.
            submitRegister(evt) {
                let addr = document.location.origin;
                var registerRequest = new XMLHttpRequest();
                registerRequest.open("POST", addr + "/api/register", true);
                registerRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                registerRequest.addEventListener("load", () => {
                    if (registerRequest.status < 300 && registerRequest.status >= 200) {
                        this.sucessNotification("Registration sucessful!");
                        // Once registered, also logs them in.
                        this.submitLogin(evt);
                    } else {
                        this.failureNotification("Registration not sucessful!");
                    }
                });
                registerRequest.send(JSON.stringify({
                    "username": app.username,
                    "password": app.password,
                    "email": app.mail
                }));
            },
            // ___  _              _  _      _      ___                  _    _
            // | _ \| | __ _  _  _ | |(_) ___| |_   / __| _ _  ___  __ _ | |_ (_) ___  _ _
            // |  _/| |/ _` || || || || |(_-<|  _| | (__ | '_|/ -_)/ _` ||  _|| |/ _ \| ' \
            // |_|  |_|\__,_| \_, ||_||_|/__/ \__|  \___||_|  \___|\__,_| \__||_|\___/|_||_|
            //               |__/
            addNewSong() {
                this.tracks.push({"name": "Edit!", "author": "Edit!", "sp_id": "", "link": "", "dropdown_open": false});
            },
            removeSong(id) {
                this.tracks.splice(id, 1);
            },
            createPlaylist() {
                if ($cookies.get("token") != null) {
                    this.number_of_tracks = 1;
                    this.create_playlist_dialog = true;
                } else {
                    this.failureNotification("You aren't logged in!");
                }
            },
            playlistCreationDone() {
                //let data = {"name" : this.playlist_title,  "genre" : this.playlist_genre, "description" : this.playlist_description,
                //            "isPublic" : this.isPublic, "Tracks" : this.tracks, "image" : this.playlist_image};
                // this.make_authenticated_request(data, "POST", "/api/userPlaylists", this.playlistSubmissionSuccess, this.playlistSubmissionFailure);

                // store token in cookies
                this.token = $cookies.get("token");

                let addr = document.location.origin;
                var authRequest = new XMLHttpRequest();
                authRequest.open("POST", addr + "/api/userPlaylists", true);
                authRequest.setRequestHeader("Authorization", "Token " + this.token);
                authRequest.addEventListener("load", () => {
                    var response = authRequest.response;
                    var returned_json = JSON.parse(response);
                    if (authRequest.status < 300 && authRequest.status >= 200) {
                        this.playlistSubmissionSuccess(authRequest);
                    } else {
                        this.playlistSubmissionFailure(authRequest);
                    }
                });

                var formData = new FormData();
                formData.append("file", this.playlist_image);
                formData.append("name", this.playlist_title);
                formData.append("genre", this.playlist_genre);
                formData.append("description", this.playlist_description);
                formData.append("isPublic", this.isPublic);
                formData.append("rating", this.rating);
                formData.append("Tracks", JSON.stringify(this.tracks));
                console.log(formData);

                authRequest.send(formData);
            },
            playlistCreationTransition() {

                if (this.playlist_title === "") {
                    this.create_playlist_step = 1;
                    this.$refs.title_ref.validate();
                } else if (this.playlist_genre === "") {
                    this.create_playlist_step = 1;
                    this.$refs.genre_ref.validate();
                } else if (this.playlist_description === "") {
                    this.create_playlist_step = 1;
                    this.$refs.description_ref.validate();
                } else
                    this.create_playlist_step !== 3 ? this.$refs.playlist_stepper.next() : this.playlistCreationDone();
            },
            addSongFromSpotify(idx) {
                this.editing_idx = idx;
                this.spotify_window = true;
                console.log(idx);
            },
            spotifySearchSuccess(req) {
                let dat = JSON.parse(req.response);
                this.query_data = dat.data;

            },
            spotifySearchFailure(req) {
                this.failureNotification("Spotify service offline!");
            },
            spotifySearch() {
                this.make_authenticated_request({"q": this.query}, "POST", "/api/spotifyIDs", this.spotifySearchSuccess, this.spotifySearchFailure);
            },
            saveSpotify(idx) {
                console.log(this.query_data[idx]);
                console.log(this.tracks[this.editing_idx]);
                this.tracks[this.editing_idx].author = this.query_data[idx].artists;
                this.tracks[this.editing_idx].name = this.query_data[idx].name;
                this.tracks[this.editing_idx].sp_id = this.query_data[idx].spotify_id;
                this.spotify_window = false;
            },

            submitPlaylist() {
                // Cycles through each jQuery generated element and retrieves the track's
                // data. This is stored as an array of objects for passing through to the backend.
                var NumberOfTracks = this.number_of_tracks;
                var Tracks = [];
                var Track = {};
                for (var i = 1; i <= NumberOfTracks; i++) {
                    Track = {
                        "name": document.getElementById("TitleInput" + i).value,
                        "author": document.getElementById("ArtistInput" + i).value
                    }
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
            // These are placeholders waiting for integration.
            imgUploaded(info) {
                image_name = info.xhr.response;
            },
            imgNotUploaded(info) {
                image_name = "";
            },
            // Makes sure you're logged in before showing you the account page.
            //  _   __   _                      ___                              __
            // | | / /  (_) ___  _    __       / _ | ____ ____ ___  __ __  ___  / /_
            // | |/ /  / / / -_)| |/|/ /      / __ |/ __// __// _ \/ // / / _ \/ __/
            // |___/  /_/  \__/ |__,__/      /_/ |_|\__/ \__/ \___/\_,_/ /_//_/\__/
            retrieveAccount() {
                if ($cookies.get("token") != null) {
                    var data = {};
                    this.make_authenticated_request(data, "GET", "/api/userInfo", this.retrieveAccountSuccess, this.retrieveAccountFailure);
                    this.account_dialog = true;
                } else {
                    this.failureNotification("You aren't logged in!");
                }
            },
            // Plugs the retrieved account data into input fields.
            // These are readonly, so doubles as viewing and editing (upon selecting
            // the edit toggle)
            retrieveAccountSuccess(req) {
                data = JSON.parse(req.response);
                console.log(data);
                this.username_f = data.username;
                this.loc = data.location;
                this.mail_f = data.email;
                this.first_name = data.first_name;
                this.last_name = data.last_name;
                this.date_joined = this.dateClean(data.date_joined);
                this.last_login = this.dateClean(data.last_login);
                this.followers = data.followers;
                this.following = data.following;
                this.profile_edit = false;
            },
            retrieveAccountFailure(req) {
                this.failureNotification("Account Details Not Found");
            },
            // Handles the format in which the data is returned.
            dateClean(date) {
                var year = date.substring(0, 4);
                var month = date.substring(5, 7);
                var day = date.substring(8, 10);
                return day + "/" + month + "/" + year;
            },
            // Executes when the user submits their changed account details - object created and this is passed through to the server with a PUT request.
            submitAccountChanges() {
                data =
                    {
                        "username": this.username_f,
                        "first_name": this.first_name,
                        "last_name": this.last_name,
                        "email": this.mail_f,
                        "location": this.loc
                    };
                this.make_authenticated_request(data, "PUT", "/api/userInfo", this.submitAccountSuccess, this.submitAccountFailure);
            },
            // Displays success message upon the account details being updated.
            submitAccountSuccess() {
                this.sucessNotification("Account Details Updated");
            },
            // Displays failure message upon the account details not being updated.
            submitAccountFailure() {
                this.failureNotification("Account Details Not Updated");
            },
            // Requests an account password change. NEEDS BACKEND SUPPORT I THINK.
            submitPasswordChange() {
                data =
                    {
                        Username: this.username_current,
                        OldPassword: this.password_old,
                        NewPassword: this.password_new
                    };
                this.make_authenticated_request(data, "PUT", "/api/userInfo", this.submitAccountSuccess, this.submitAccountFailure);
            },


            //  ___   ___     _     ___    ___   _  _       ___    ___    ___       ___   _        _    __   __  _      ___   ___   _____   ___
            // / __| | __|   /_\   | _ \  / __| | || |     | __|  / _ \  | _ \     | _ \ | |      /_\   \ \ / / | |    |_ _| / __| |_   _| / __|
            // \__ \ | _|   / _ \  |   / | (__  | __ |     | _|  | (_) | |   /     |  _/ | |__   / _ \   \ V /  | |__   | |  \__ \   | |   \__ \
            // |___/ |___| /_/ \_\ |_|_\  \___| |_||_|     |_|    \___/  |_|_\     |_|   |____| /_/ \_\   |_|   |____| |___| |___/   |_|   |___/
            searchPlaylistsSuccess(req) {
                let data = JSON.parse(req.response);
                this.search_playlists = [];
                this.playlist_search_pages = data["pages"];

                data["data"].forEach(el => {
                    if (el.name == "")
                        el.name = "Unknown";
                    if (el.genre == "")
                        el.genre = "No genre";
                    if (el.description == "")
                        el.description = "No description";

                    app.search_playlists.push({
                        "id": el["id"], "creator": el.creator_username, "name": el.name, "genre": el.genre,
                        "description": el.description, "rating": el.rating
                    });
                });
            },
            searchPlaylistsFailure(req) {
                this.failureNotification("failed getting back playlists!");
            },
            playlistSearch() {
                let json = {"filter": this.playlist_search_text};
                this.make_authenticated_request(json, "POST", "/api/searchPlaylist", this.searchPlaylistsSuccess, this.searchPlaylistsFailure);
            },
            playlistSearchPage(val) {
                let json = {"filter": this.playlist_search_text, "page": this.playlist_search_pagination_idx};
                this.make_authenticated_request(json, "POST", "/api/searchPlaylist", this.searchPlaylistsSuccess, this.searchPlaylistsFailure);
            },
            inspectPlaylistSuccess(req) {
                this.inspected_playlist_data = JSON.parse(req.response);
                console.log(this.inspected_playlist_data);
                if (this.inspected_playlist_data["genre"] == "")
                    this.inspected_playlist_data["genre"] = "not specified";
                if (this.inspected_playlist_data["description"] == "")
                    this.inspected_playlist_data["genre"] = "not specified";

                this.inspect_playlist = true;
            },
            inspectPlaylistFailure(req) {
                this.failureNotification("Could not display playlist");
            },
            viewPlaylist(val) {
                this.make_authenticated_request({"playlist_id": val}, "POST", "/api/playlistView", this.inspectPlaylistSuccess, this.inspectPlaylistFailure);
            },
            //    ___ ___   _   ___  ___ _  _     ___ ___  ___     ___  ___  _  _  ___ ___
            //   / __| __| /_\ | _ \/ __| || |   | __/ _ \| _ \   / __|/ _ \| \| |/ __/ __|
            //   \__ \ _| / _ \|   / (__| __ |   | _| (_) |   /   \__ \ (_) | .` | (_ \__ \
            //   |___/___/_/ \_\_|_\\___|_||_|   |_| \___/|_|_\   |___/\___/|_|\_|\___|___/

            songSearch() {


            },

            displaySong(val) {
                console.log(val);
            },
            //    ____                         __         ___                  __  __
            //   / __/ ___  ___ _  ____ ____  / /        / _/ ___   ____      / / / /  ___ ___   ____  ___
            //  _\ \  / -_)/ _ `/ / __// __/ / _ \      / _/ / _ \ / __/     / /_/ /  (_-</ -_) / __/ (_-<
            // /___/  \__/ \_,_/ /_/   \__/ /_//_/     /_/   \___//_/        \____/  /___/\__/ /_/   /___/
            // retrieves ten user accounts' details upon the user entering their search
            userSearch() {
                let json = {"filter": this.user_search_text, "page": 1};
                this.make_authenticated_request(json, "POST", "/api/searchUsers", this.searchUsersSuccess, this.searchUsersFailure);
            },
            userSearchPage(val) {
                let json = {"filter": this.user_search_text, "page": this.user_search_pagination_idx};
                this.make_authenticated_request(json, "POST", "/api/searchUsers", this.searchUsersSuccess, this.searchUsersFailure);
            },


            inspectUserSuccess(req) {
                var data = JSON.parse(req.response);
                console.log(data);
                if (data.first_name === "" && data.last_name === "")
                    data.first_name = "Unknown";
                if (data.location == "")
                    data.location = "Unknown";
                if (data.date_joined == null)
                    data.date_joined = "Unknown";
                else
                    data.date_joined = this.dateClean(data.date_joined);
                if (data.last_login == null)
                    data.last_login = "Unknown";
                else
                    data.last_login = this.dateClean(data.last_login);
                this.inspected_user_data = data;
                this.inspect_user = true;
            },
            inspectUserFailure(req) {
                this.failureNotification("This User Couldn't be Retrieved");
            },

            // for when you select one of the returned users when searching
            viewUserProfile(username) {
                this.make_authenticated_request({"username": username}, "POST", "/api/inspectUser", this.inspectUserSuccess, this.inspectUserFailure);
            },
            // Adds all the retrieved data in the users array
            searchUsersSuccess(req) {
                data = JSON.parse(req.response);
                this.search_users = [];
                this.user_search_pages = data["page_nums"];

                data["data"].forEach(el => {
                    if (el["first_name"] === "" && el["last_name"] === "")
                        el["first_name"] = "Unknown";
                    else if (el["first_name"] === "")
                        el["first_name"] = "Unknown";
                    else if (el["last_name"] === "")
                        el["last_name"] = "Unknown";
                    if (el["location"] == "")
                        el["location"] = "Unknown";
                    if (el["date_joined"] != null)
                        el["date_joined"] = this.dateClean(el["date_joined"]);
                    else
                        el["date_joined"] = "Unknown";
                    if (el["last_login"] != null)
                        el["last_login"] = this.dateClean(el["last_login"]);
                    else
                        el["last_login"] = "Unknown";

                    app.search_users.push({
                        "id": el["id"],
                        "username": el["username"],
                        "first_name": el["first_name"],
                        "last_name": el["last_name"],
                        "location": el["location"],
                        "date_joined": el["date_joined"],
                        "last_login": el["last_login"]
                    });
                });
            },
            searchUsersFailure(req) {
                this.failureNotification("Search Failed.");
            },
            selectUser(num) {
                this.current_profile = num;
            },
            follow(id) {
                this.follow_id = id;
                var data = {
                    "id": id
                };
                this.make_authenticated_request(data, "PUT", "/api/checkFollow", this.checkSuccess, this.checkFailure);
            },
            checkSuccess(req) {
                data = JSON.parse(req.response);
                if (data.follows === false) {
                    var data = {
                        "id": this.follow_id
                    };
                    this.make_authenticated_request(data, "PUT", "/api/follow", this.followSuccess, this.followFailure);
                }
                if (data.follows === true) {
                    var data = {
                        "id": this.follow_id
                    };
                    this.make_authenticated_request(data, "PUT", "/api/unfollow", this.unfollowSuccess, this.unfollowFailure);
                }
            },
            checkFailure(req) {
                this.failureNotification("Failure to Follow/Unfollow");
            },
            followSuccess(req) {
                this.sucessNotification("Followed User");
            },
            followFailure(req) {
                this.failureNotification("Failed to Follow User");
            },
            unfollowSuccess(req) {
                this.sucessNotification("Unfollowed User");
            },
            unfollowFailure(req) {
                this.failureNotification("Failed to Unfollow User");
            },
            //  ___   _                 _   _        _        ___         _   _              _     _                  ___   _             __    __
            // | _ \ | |  __ _   _  _  | | (_)  ___ | |_     / __|  ___  | | | |  ___   __  | |_  (_)  ___   _ _     / __| | |_   _  _   / _|  / _|
            // |  _/ | | / _` | | || | | | | | (_-< |  _|   | (__  / _ \ | | | | / -_) / _| |  _| | | / _ \ | ' \    \__ \ |  _| | || | |  _| |  _|
            // |_|   |_| \__,_|  \_, | |_| |_| /__/  \__|    \___| \___/ |_| |_| \___| \__|  \__| |_| \___/ |_||_|   |___/  \__|  \_,_| |_|   |_|
            //                   |__/
            retrievePlaylistCollection() {
                if ($cookies.get("token") != null) {
                    var data = {};
                    this.make_authenticated_request(data, "GET", "/api/userPlaylists", this.retrievePlaylistColectionSuccess, this.retrievePlaylistColectionFailure);
                    this.my_playlists_dialog = true;
                } else {
                    this.failureNotification("You aren't logged in!");
                }
            },


            update_playlist_success(req) {
                this.sucessNotification("playlist update successfull!");

                let current_playlist = this.playlists.filter(el => el.id === this.own_playlist_view_id)[0];
                current_playlist.name = this.playlist_title;
                current_playlist.genre = this.playlist_genre;
                current_playlist.description = this.playlist_description;
                current_playlist.isPublic = this.isPublic;
                current_playlist.rating = this.rating;
                current_playlist.songs = this.tracks;
            },
            update_playlist_failure(re) {
                this.failureNotification("Update failed !");
            },

            own_playlist_update() {
                // this is sloppy : should do a partial update, not recreate a playlist
                this.make_authenticated_request({
                        "id": this.own_playlist_view_id, "title": this.playlist_title,
                        "genre": this.playlist_genre, "description": this.playlist_description,
                        "isPublic": this.isPublic, "rating": this.rating, "tracks": this.tracks
                    },
                    "PUT", "/api/userPlaylists", this.update_playlist_success, this.update_playlist_failure);
            },

            own_playlist_delete_success() {
                this.playlists.splice(this.playlist_idx, 1);
                this.$forceUpdate();
                this.sucessNotification("deleted successfully");
            },
            own_playlist_delete_failure() {
                this.failureNotification("deleted not successfully");
            },


            own_playlist_delete() {
                this.make_authenticated_request({"id": this.own_playlist_view_id}, "DELETE",
                    "/api/userPlaylists", this.own_playlist_delete_success, this.own_playlist_delete_failure);
            },

            spotify_export_other() {
                let songs = [];

                for (let i in this.inspected_playlist_data.songs)
                    songs.push(this.inspected_playlist_data.songs[i]["spotify_id"]);

                this.createSpotifyPlaylist(songs, this.inspected_playlist_data.name,
                    this.inspected_playlist_data.description);
            },

            spotify_export() {
                let songs = [];

                for (let i in this.tracks)
                    songs.push(this.tracks[i]["spotify_id"]);

                this.createSpotifyPlaylist(songs, this.playlist_title, this.playlist_description);
            },


            own_playlist_close() {
            },

            openViewingPlaylist(evt) {
                this.sortCollection();
            },

            // Resorts the playlists array according to the sorting parameters.
            sortCollection() {
                this.make_authenticated_request(data, "GET", "/api/userPlaylists", this.retrievePlaylistColectionSuccess, this.retrievePlaylistColectionFailure);
                if (this.sort_filter !== "") { // Filters for a specific substring.
                    this.playlists = this.playlists.filter(el => el.name.includes(this.sort_filter));
                }
                if (this.sort_selection === this.sort_options[0]) { // Alphabetically ordered names
                    this.playlists = this.playlists.sort(this.sorting("name"));
                } else if (this.sort_selection === this.sort_options[1]) { // Ordered ratings. Currently they're all 0.
                    this.playlists = this.playlists.sort(this.sorting("rating"));
                } else if (this.sort_selection === this.sort_options[2]) { // Alphabetical ordering of genre. Helps categorise.
                    this.playlists = this.playlists.sort(this.sorting("genre"));
                }
                if (this.order_selection === "Descending") { // Reverses order of the collection. So you can effectively sort by "Reverse Alphabetical, of Genre"
                    this.playlists = this.playlists.reverse();
                }
                this.$forceUpdate();
            },
            // Used for sorting an array of objects, in this case the array of playlists.
            sorting(sortby) {
                return function (a, b) {
                    var result = (a[sortby] < b[sortby]) ? -1 : (a[sortby] > b[sortby]) ? 1 : 0;
                    return result;
                }
            },
            // Opens the page for viewing / editing one of your selected playlists.
            selectPlaylist(id) {
                if ($cookies.get("token") !== "") {
                    // Filters the playlists for a specific id. There is only one
                    // playlist of this id, so the data will just be in the first element of the collected array.

                    let i = 0;
                    for (let el in this.playlists) {
                        console.log(el);
                        if (el.id === id) {
                            break;
                        }
                        i += 1;
                    }
                    this.playlist_idx = i;
                    this.current_playlist = this.playlists.filter(el => el.id == id)[0];
                    this.own_playlist_view_id = id;

                    this.playlist_title = this.current_playlist.name;
                    this.playlist_genre = this.current_playlist.genre;
                    this.playlist_description = this.current_playlist.description;
                    this.isPublic = this.current_playlist.isPublic;
                    this.rating = this.current_playlist.rating;
                    this.tracks = this.current_playlist.songs;

                    this.number_of_tracks = this.current_playlist.songs.length;
                    this.view_own_playlist_dialog = true;
                    this.populated = false; // This indicates the track listing isn't populated yet.
                } else {
                    this.failureNotification("You aren't logged in!");
                }
            },
            // When you select one of your playlists to edit, you can delete it too.
            deletePlaylist() {
                this.make_authenticated_request(this.current_playlist, "DELETE", "/api/userPlaylists", this.deletePlaylistSuccess, this.deletePlaylistFailure);
            },
            // When a request for one's playlists is successful, the response is parsed and stored in the relevant array.
            retrievePlaylistColectionSuccess(req) {
                data = JSON.parse(req.response);
                var i;
                for (i = 0; i < data.length; i++) {
                    if (data[i].link == "") {
                        data[i].link = "testing.png";
                    }
                    this.playlists[i] = data[i];
                }
                console.log(this.playlists);
            },
            // PUT method didn't work as I had thought (my fault), so repurposed it so
            // it just deletes the entire playlist and creates a new one.
            updatePlaylist() {
                this.make_authenticated_request(this.current_playlist, "DELETE", "/api/userPlaylists", this.noMsg, this.deletePlaylistFailure);
                var NumberOfTracks = this.number_of_tracks;
                var Tracks = [];
                var Track = {};
                for (var i = 1; i <= NumberOfTracks; i++) {
                    Track = {
                        "name": document.getElementById("TitleInput" + i).value,
                        "author": document.getElementById("ArtistInput" + i).value
                    }
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
            noMsg(req) {
            },
            retrievePlaylistColectionFailure(req) {
                this.failureNotification("Failed to retrieve collection.");
            },
            // For some reason, deleted playlists would only be removed if you
            // refreshed the page (even if you made a new get request).
            // The deletion DOES work on the backend, but I've just made it so it's
            // removed from the local array as this was the only way it wouldn't bug out.
            deletePlaylistSuccess(req) {
                this.sucessNotification("Playlist deleted.");
                var index = null;
                // Runs through the playlists and find the one which has the id of
                // the one deleted, and removes it from the array (by index).
                for (var i = 0; i < this.playlists.length; i++) {
                    if (this.playlists[i].id === this.current_playlist.id) {
                        index = i;
                    }
                }
                if (index != null) {
                    this.playlists.splice(index, 1);
                }
                console.log(this.playlists);
                this.view_own_playlist_dialog = false;
            },
            deletePlaylistFailure(req) {
                this.failureNotification("Failed to delete playlist! It may have already been deleted.");
                this.view_own_playlist_dialog = false;
            },
            // Success/Error handling for when a user updates an existing playlist.
            playlistUpdateSuccess(req) {
                this.sucessNotification("Successfully updated playlist!");
                this.view_own_playlist_dialog = false;
            },
            playlistUpdateFailure(req) {
                this.failureNotification("Failed to update playlist!");
            },
            Len(val) {
                return val == null ? "" : val.length;
            },

            generateRandomString(length) {
                var text = '';
                var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                for (var i = 0; i < length; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            },
            save_playlist_success() {
                this.sucessNotification("saved playlist!");
            },
            save_playlist_failure() {
                this.failureNotification("couldn't save playlist!");
            },

            //let data = {"name" : this.playlist_title,  "genre" : this.playlist_genre, "description" : this.playlist_description,
            //            "isPublic" : this.isPublic, "Tracks" : this.tracks, "image" : this.playlist_image};

            save_playlist() {
                let DATA = this.inspected_playlist_data;
                this.token = $cookies.get("token");

                let addr = document.location.origin;
                var authRequest = new XMLHttpRequest();
                authRequest.open("POST", addr + "/api/userPlaylists", true);
                authRequest.setRequestHeader("Authorization", "Token " + this.token);
                authRequest.addEventListener("load", () => {
                    var response = authRequest.response;
                    var returned_json = JSON.parse(response);
                    if (authRequest.status < 300 && authRequest.status >= 200) {
                        this.save_playlist_success(authRequest);
                    } else {
                        this.save_playlist_failure(authRequest);
                    }
                });

                var formData = new FormData();
                formData.append("name", DATA.name);
                formData.append("genre", DATA.genre);
                formData.append("description", DATA.description);
                formData.append("isPublic", false);
                formData.append("Tracks", JSON.stringify(DATA.songs));
                console.log(formData);

                authRequest.send(formData);


            },

            encode(d) {
                let v = [];
                for (let k in d)
                    v.push(encodeURIComponent(k) + "=" + encodeURIComponent(d[k]));

                let ret = v[0];

                for (let i = 1; i < v.length; ++i) {
                    ret = ret + "&" + v[i];
                }
                return ret;
            },

            get_spotify_auth() {
                let redirect = window.location.origin + "/";
                let q = {
                    "response_type": "code", "client_id": "5ef4bb85e1a9499593ac6a9477993c08",
                    "scope": "user-read-private user-read-email playlist-modify-private", "redirect_uri": redirect,
                    state: this.generateRandomString(16)
                };
                let p = this.encode(q);
                window.location.replace("https://accounts.spotify.com/authorize?" + p);
            },

            getTokenSuccess(req) {
                console.log("correctly received spotify token !");

                let DATA = JSON.parse(req.response);
                this.access_token = DATA['access_token'];
                this.token_type = DATA['token_type'];
                this.expires_in = DATA['expires_in'];
                this.refresh_token = DATA['refresh_token'];
                this.scope = DATA['scope'];

                // store in cookies token, is it secure tho ?
                $cookies.set("access_token", this.access_token);
                $cookies.set("token_type", this.token_type);
                $cookies.set("expires_in", this.expires_in);
                $cookies.set("refresh_token", this.refresh_token);
                $cookies.set("scope", this.scope);

                this.getSpotifyID();

            },

            getTokenFailure(req) {
                console.log("spotify token failure !");
            },

            getToken() {
                let req = new XMLHttpRequest();
                let param = {
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": window.location.origin + "/"
                };
                let p = this.encode(param);
                req.open("POST", "https://accounts.spotify.com/api/token", true);
                //console.log(p);

                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.setRequestHeader("Authorization", "Basic NWVmNGJiODVlMWE5NDk5NTkzYWM2YTk0Nzc5OTNjMDg6ZTdmYjIwYTc5N2U1NGI4OGJmYTM0MjIwZDgyYjdkM2Q=");

                req.addEventListener("load", () => {
                    if (req.status < 300 && req.status >= 200)
                        this.getTokenSuccess(req);
                    else
                        this.getTokenFailure(req);
                });

                req.send(p);
            },

            processSpotifySongs(songs) {
                let newSongs = [];
                for (let i in songs)
                    newSongs.push("spotify:track:" + songs[i]);
                return newSongs;
            },

            addToThePlaylistSuccess(req) {

            },

            addToThePlaylistFailure(req) {
                console.log("adding songs failure!");
                this.failureNotification("adding songs failure!");
            },

            addToThePlaylist(new_playlist_spotify_id, spotify_songs_ids) {
                let reqS = new XMLHttpRequest();
                reqS.open("POST", "https://api.spotify.com/v1/playlists/" + new_playlist_spotify_id + "/tracks", true);
                reqS.setRequestHeader("Accept", "application/json");
                reqS.setRequestHeader("Content-Type", "application/json");
                reqS.setRequestHeader("Authorization", "Bearer " + this.access_token);
                reqS.addEventListener("load", () => {
                    if (reqS.status < 300 && reqS.status >= 200)
                        this.addToThePlaylistSuccess(reqS);
                    else
                        this.addToThePlaylistFailure(reqS);
                });
                let newSongs = this.processSpotifySongs(spotify_songs_ids);
                console.log(newSongs);
                reqS.send(JSON.stringify({"uris": newSongs}));
            },

            createSpotifyPlaylistSuccess(req, songs) {
                console.log("successfully created playlist");
                let DATA = JSON.parse(req.response);
                let new_playlist_spotify_id = DATA["id"];
                this.addToThePlaylist(new_playlist_spotify_id, songs);
            },
            createSpotifyPlaylistFailure(req) {
                console.log("failure during creating playlist !");
                this.failureNotification("failure during creating playlist !");
                let DATA = JSON.parse(req.response);
                // console.log(data);
            },

            createSpotifyPlaylist(songs, name = "spotify_songspace_test", description = "some sample text") {
                let reqS = new XMLHttpRequest();
                reqS.open("POST", "	https://api.spotify.com/v1/users/" + this.spotify_user_id + "/playlists");
                reqS.setRequestHeader("Accept", "application/json");
                reqS.setRequestHeader("Content-Type", "application/json");
                reqS.setRequestHeader("Authorization", "Bearer " + this.access_token);
                reqS.addEventListener("load", () => {
                    if (reqS.status < 300 && reqS.status >= 200)
                        this.createSpotifyPlaylistSuccess(reqS, songs);
                    else
                        this.createSpotifyPlaylistFailure(reqS);
                });

                reqS.send(JSON.stringify({
                    "name": name,
                    "description": description,
                    "public": false
                }));
            },

            getSpotifyIDSuccess(req) {
                let DATA = JSON.parse(req.response);
                this.spotify_user_id = DATA['id'];
            },

            getSpotifyIDFailure(req) {
                //console.log("NOT CEWL");
                //console.log(req.response);
            },

            getSpotifyID() {
                let reqS = new XMLHttpRequest();
                reqS.open("GET", "https://api.spotify.com/v1/me", true);
                reqS.setRequestHeader("Accept", "application/json");
                reqS.setRequestHeader("Content-Type", "application/json");
                reqS.setRequestHeader("Authorization", "Bearer " + this.access_token);

                reqS.addEventListener("load", () => {
                    if (reqS.status < 300 && reqS.status >= 200)
                        this.getSpotifyIDSuccess(reqS);
                    else
                        this.getSpotifyIDFailure(reqS);
                });
                reqS.send();
            },

            linkInSpotify(evt, navFn) {
                this.get_spotify_auth();
            },


        }
    ,
    mounted: function () {
        let u = new URL(window.location.href);
        code = u.searchParams.get("code");
        state = u.searchParams.get("state");

        if (code !== null) {
            console.log("spotify connected !");
            this.getToken();
        }
    }

});
