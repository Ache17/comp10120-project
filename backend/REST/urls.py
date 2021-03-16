from rest_framework.authtoken.views import obtain_auth_token
from django.urls import path
from . import views


urlpatterns = [path("test", views.testView.as_view()),
               path("register", views.registerView.as_view()), 
               path("auth", obtain_auth_token, name="auth"),
               path("authTest", views.authenticatedTest.as_view()),
               path("userInfo", views.userInfoView.as_view()),
               path("userPlaylists", views.playlistsView.as_view()),
               path("searchPlaylist", views.searchPlaylistView.as_view()),
               path("searchUsers", views.searchUsersView.as_view()),
               path("share", views.sharing.as_view(), name='share'),
               path("song", views.songView.as_view(), name="songs"),
               path("upload", views.imageUpload.as_view(), name="upload_image"),
               path("spotifyIDs", views.spotifyQuery.as_view(), name="spotify"),
               path("othersPlaylists", views.othersPlaylists.as_view(), name="others_playlists")]