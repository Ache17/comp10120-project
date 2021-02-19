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
        playlist_description : "",
        number_of_tracks : 0
    },
    delimiters: ['[%', '%]'],
    methods: {
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
        submitPlaylist(msg)
        {
            this.sucessNotification("Function was called.");
        }
    }
  });
