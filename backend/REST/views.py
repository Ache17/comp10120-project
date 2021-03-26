import re
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import response, serializers, status, authentication, permissions
from django.contrib.auth.hashers import is_password_usable, make_password
from django.contrib.auth.models import User
from .serializers import UserSerializer, playlistSerializer, ItemSerializer, displayPlaylistSerializer, ItemDisplaySerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import UserProfile, Playlist, Item
from django.core.paginator import Paginator, EmptyPage
from django.shortcuts import render
from rest_framework.renderers import JSONRenderer

from string import ascii_letters, digits
from random import choice
import os
import json

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id="5ef4bb85e1a9499593ac6a9477993c08",  client_secret="e7fb20a797e54b88bfa34220d82b7d3d"))

sigma = "".join([ascii_letters, digits])
PER_PAGE = 10

def getRand(n=16):
    return "".join([choice(sigma) for _ in range(n)])

# Create your views here.
class testView(APIView):
    def get(self, request):
        return Response("just a test")

    def post(self, request):
        return Response("post request")

class authenticatedTest(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response("get  success !")

    def post(self, request):
        return Response("post success !")

class userInfoView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)

        following = profile.follows.all()
        following_ser = []
        for f in following:
            _user = f.user
            following_ser.append({"id" : f.id, "username" : _user.username})

        followers = profile.followed_by.all()
        followers_ser = []
        for f in followers:
            _user = f.user
            followers_ser.append({"id" : f.id, "username" : _user.username})

        return Response({"username": user.username, "first_name": user.first_name,
                         "last_name": user.last_name, "email": user.email,
                         "last_login": user.last_login, "date_joined": user.date_joined,
                         "location": profile.location, "followers" : followers_ser, "following" : following_ser})

    def put(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)
        changed = False
        data = request.data

        if "last_login" in data:
            user.last_login = data["last_login"]
            changed = True

        if "first_name" in data:
            user.first_name = data["first_name"]
            changed = True

        if "last_name" in data:
            user.last_name = data["last_name"]
            changed = True

        if "location" in data:
            profile.location = data["location"]
            changed = True

        # updating password / email should have different mechanism for security reasons
        # TODO: changing the way we update email and password
        # not wonderful idea
        if "email" in data:
            user.email = data["email"]
            changed = True

        # even worst idea
        if "password" in data:
            user.password = make_password(data["password"])
            changed = True

        if changed:
            profile.save()
            user.save()
            return Response({"message": "Update sucessfull "}, status=status.HTTP_200_OK)
        return Response({"message": "Update not sucessfull"}, status=status.HTTP_400_BAD_REQUEST)

class searchPlaylistView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):

        page = 1
        if "page" in request.data:
            page = int(request.data["page"])

        if "filter" in request.data:
            entries = Playlist.objects.filter(name__icontains=request.data["filter"], isPublic=True)
        else:
            entries = Playlist.objects.filter(isPublic=True)
        paginator = Paginator(entries, PER_PAGE)
        try:
            playlists = paginator.page(page)
        except EmptyPage:
            return Response({"message": "bad page !"}, status=status.HTTP_400_BAD_REQUEST)

        ret = []
        for playlist in playlists:
            creator = playlist.creator
            user = creator.user
            ret.append({"id" : playlist.id, "creator_username": user.username, "name": playlist.name, "genre": playlist.genre,
                        "description": playlist.description, "rating" : playlist.rating})
        return Response({"pages" : paginator.num_pages, "data" : ret}, status=status.HTTP_200_OK)

class searchUsersView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        page = 1
        if "page" in request.data:
            page = int(request.data["page"])

        if "filter" in request.data:
            entries = User.objects.filter(username__icontains=request.data["filter"])
        else:
            entries = User.objects.filter()

        paginator = Paginator(entries, PER_PAGE)


        try:
            users = paginator.page(page)
        except EmptyPage:
            return Response({"message": "bad page !"}, status=status.HTTP_400_BAD_REQUEST)

        profiles = UserProfile.objects.filter(user__in=users)

        ret = []
        for idx, user in enumerate(users):
            up = profiles[idx]
            ret.append({"username": user.username, "first_name": user.first_name, "last_name": user.last_name, "location" : up.location, "date_joined" : user.date_joined, "last_login" : user.last_login})


        return Response({ "page_nums" : paginator.num_pages, "data" : ret}, status=status.HTTP_200_OK)

class playlistsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)
        playlists = Playlist.objects.filter(creator=profile)
        response = []
        for p in playlists:
            songs_serialized = []
            songs = Item.objects.filter(whichPlaylist=p)

            for song in songs:
                songs_serialized.append({"id" : song.id, "name": song.name, "author": song.author})
            response.append({"id" : p.id, "name": p.name, "genre": p.genre, "description": p.description,
                             "rating": p.rating, "songs": songs_serialized})
        return Response(response)

    def delete(self, request):
        try:
            playlist_id = request.data['id']
        except KeyError:
            return Response({"message" : "playlist id not specified"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        profile = UserProfile.objects.get(user=user)

        try:
            playlist = Playlist.objects.get(id=playlist_id)
        except Playlist.DoesNotExist:
            return Response({"message" : "not valid playlist id"}, status=status.HTTP_400_BAD_REQUEST)

        if playlist.creator == profile:
            playlist.delete()
            return Response({"message" : "playlist have been deleted"}, status=status.HTTP_200_OK)

        return Response({"message" : f"it's not yours playlist"}, status=status.HTTP_200_OK)

    def put(self, request):
        try:
            playlist_id = request.data['playlist_id']
        except KeyError:
            return Response({"message" : "playlist id not specified"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        profile = UserProfile.objects.get(user=user)
        try:
            playlist = Playlist.objects.get(id=playlist_id)
        except Playlist.DoesNotExist:
            return Response({"message" : "not valid playlist id"}, status=status.HTTP_400_BAD_REQUEST)


        if playlist.creator == profile:

            if "name" in request.data:
                playlist.name = request.data['name']

            if "genre" in request.data:
                playlist.genre = request.data["genre"]

            if "description" in request.data:
                playlist.description = request.data["description"]

            if "rating" in request.data:
                playlist.rating = request.data["rating"]

            if "isPublic" in request.data:
                playlist.isPublic = request.data["isPublic"]

            # adding new song
            if "new_song_author" in request.data and "new_song_name" in request.data:
                new_song = Item(whichPlaylist= playlist, name=request.data["new_song_name"],author=request.data["new_song_author"])
                new_song.save()
            playlist.save()

            return Response({"message" : "playlist have been updated"}, status=status.HTTP_200_OK)

        return Response({"message" : "playlist does not exists or is not yours"}, status=status.HTTP_200_OK)

    def post(self, request):
        # manually setting up the user id's
        # firstly serialize the playlist

        data = request.data.copy()
        data["creator"] = UserProfile.objects.get(user=request.user).id
        serializer = playlistSerializer(data=data)

        if serializer.is_valid():

            playlistObj = serializer.save()
            # get the image
            try:
                img = data["file"]

                hash = getRand()
                extension = img.name.split(".")[-1]
                link = f"{hash}.{extension}"
                dat = img.read()
                f = open(f"frontend/static/media/{link}", "wb")
                f.write(dat)
                f.close()
                playlistObj.link = link
                playlistObj.save()

            except Exception as e:
                print(e)

            # if data provided is all good
            # save the object
            playlistId = playlistObj.id

            # now save all the items ( songs ) that belong to
            # that playlist
            try:
                Items = json.loads(request.data["Tracks"])
                for item in Items:
                    item["whichPlaylist"] = playlistId

                # validate all items in the serializer
                items_serializer = ItemSerializer(data=Items, many=True)
                if items_serializer.is_valid():
                    # save the items associated with the playlist
                    items_serializer.save()
                    return Response({"message": "playlist submission sucessfull"}, status=status.HTTP_201_CREATED)

                # not valid items : playlist will be saved though
                # someone messing with the REST
                # print(serializer.errors)
                return Response({"message": "playlist submission not sucessfull"}, status=status.HTTP_400_BAD_REQUEST)

            # don't have Tracks :
            # someone messing with the REST
            except KeyError:
                return Response({"message": "playlist submission not sucessfull"}, status=status.HTTP_400_BAD_REQUEST)

        # playlist serialization not valid !
        #        print(serializer.errors)
        return Response({"message": "playlist submission not sucessfull"}, status=status.HTTP_400_BAD_REQUEST)

class othersPlaylists(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):

        if "username" in request.data:
            try:
                user = User.objects.get(username=request.data['username'])
                userProfile = UserProfile.objects.get(user=user)

                playlists = Playlist.objects.filter(creator=userProfile, isPublic=True)
                ret = []
                for playlist in playlists:
                    ret.append({"name" : playlist.name, "genre" : playlist.genre, "description" : playlist.description, "rating" : playlist.rating})
                return Response(ret, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                return Response({"message" : "user does not exists"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message" : "username not supplied"}, status=status.HTTP_400_BAD_REQUEST)

class songView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):

        try:
            song_id = request.data['song_id']
        except KeyError:
            return Response({"message" : "song_id not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            song = Item.objects.get(id=song_id)
        except Item.DoesNotExist:
            return Response({"message" : "song does not exists or is not public"}, status=status.HTTP_400_BAD_REQUEST)

        playlist = song.whichPlaylist
        if playlist.isPublic:
            return Response({"name" : song.name , "author" : song.author}, status=status.HTTP_200_OK)

        user = request.user
        profile = UserProfile.objects.get(user=user)
        if playlist.creator == profile:
            return Response({"name" : song.name , "author" : song.author}, status=status.HTTP_200_OK)

        return Response({"message" : "song does not exists or is not public"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        try:
            song_id = request.data['song_id']
        except KeyError:
            return Response({"message" : "song_id not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            song = Item.objects.get(id=song_id)
        except Item.DoesNotExist:
            return Response({"message" : "song does not exists or is not yours"}, status=status.HTTP_400_BAD_REQUEST)

        playlist = song.whichPlaylist
        user = request.user
        profile = UserProfile.objects.get(user=user)

        if playlist.creator == profile:
            song.delete()
            return Response({"message" : "song deleted"}, status=status.HTTP_200_OK)
        return Response({"message": "song does not exists or is not yours"} ,status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            song_id = request.data['song_id']
        except KeyError:
            return Response({"message" : "song_id not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            song = Item.objects.get(id=song_id)
        except Item.DoesNotExist:
            return Response({"message" : "song does not exists or is not yours"}, status=status.HTTP_400_BAD_REQUEST)

        playlist = song.whichPlaylist
        user = request.user
        profile = UserProfile.objects.get(user=user)

        if playlist.creator == profile:

            if "name" in request.data:
                song.name = request.data["name"]

            if "author" in request.data:
                song.author = request.data["author"]

            song.save()

            return Response({"message" : "song updated"}, status=status.HTTP_200_OK)
        return Response({"message": "song does not exists or is not yours"} ,status=status.HTTP_400_BAD_REQUEST)

class registerView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(request.data)

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            profile = UserProfile(user_id=serializer.id)
            profile.save()

            return Response({"message": "registation sucessfull"}, status=status.HTTP_201_CREATED)
        return Response({"message": "registration not sucessfull"}, status=status.HTTP_400_BAD_REQUEST)

class playlistView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            playlistID = request.data["playlist_id"]
        except KeyError:
            return Response({"message" : "playlist_id not supplied"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            Object = Playlist.objects.get(id=playlistID)
        except Playlist.DoesNotExist:
            return Response({"message" : "playlist does not exists or is private"}, status=status.HTTP_400_BAD_REQUEST)

        name = Object.name

        if (Object.isPublic == False):
            return Response({"message": "playlist does not exists or is private"}, status=status.HTTP_400_BAD_REQUEST)

        songs = Item.objects.filter(whichPlaylist=Object)
        songs_data = ItemDisplaySerializer(songs, many=True).data
        print(songs_data)
        return Response({"name": Object.name, "creator" : Object.creator.user.username, "genre" : Object.genre, "link" : Object.link,
                         "rating" : Object.rating, "description" : Object.description, "songs" : songs_data}, status=status.HTTP_200_OK)

class imageUpload(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):

        # necessary info from the frontend
        hash = getRand() + ".jpg"
        for file_name in request.FILES:
            with open("frontend/static/media/" + hash, "wb+") as dst:
                for chunk in request.FILES[file_name].chunks():
                    dst.write(chunk)

        # need associating hash with the playlist


        return Response(hash, status=status.HTTP_200_OK)

class spotifyQuery(APIView):
    permission_classes = (IsAuthenticated,)
    def post(self, request):
        if "q" in request.data:
            try:
                results = sp.search(q=request.data["q"], type="track", limit=10)
            except Exception:
                return Response({"message" : "spotify service offline"}, status=status.HTTP_400_BAD_REQUEST)
            res = []
            for idx, track in enumerate(results['tracks']['items']):
                artist = ""
                for art in track["artists"]:
                    artist += art["name"] + ", "
                artist = artist[:-2]
                res.append({ "name" : track["name"], "artists" : artist,
                             "spotify_id" : track["id"], "image" : track["album"]["images"][0]["url"]})
            return Response({"data" : res}, status=status.HTTP_200_OK)
        else:
            return Response({"message" : "no query provided !"} , status=status.HTTP_400_BAD_REQUEST)

class inspectUserInfo(APIView):

    permission_classes = (IsAuthenticated,)

    def post(self, request):

        if "username" in request.data:
            Username = request.data["username"]
        else:
            return Response({"message" : "username not specified"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            theUser = User.objects.get(username=Username)
        except User.DoesNotExist:
            return Response({"message": "user not found!"}, status=status.HTTP_400_BAD_REQUEST)

        up = UserProfile.objects.get(user=theUser)
        username = theUser.username
        first_name = theUser.first_name
        last_name = theUser.last_name
        location = up.location

        last_login = theUser.last_login
        date_joined = theUser.date_joined

        following = User.objects.filter(id__in=up.follows.all().values_list("user", flat=True)).values("username", "first_name", "last_name")
        followers = User.objects.filter(id__in=up.followed_by.all().values_list("user", flat=True)).values("username", "first_name", "last_name")
        playlists = displayPlaylistSerializer(Playlist.objects.filter(creator=up, isPublic=True), many=True)
        print(playlists.data)

        return Response({"username" : theUser.username, "first_name" : first_name,
                        "last_name" : theUser.last_name, "location" : location,
                        "date_joined" : date_joined, "last_login" : last_login,
                        "following" : following, "followers" : followers, "playlists" : playlists.data}, status=status.HTTP_200_OK)
