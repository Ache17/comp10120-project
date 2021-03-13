import re
from django.shortcuts import render
from rest_framework import response
from rest_framework.settings import import_from_string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework import authentication, permissions
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from .serializers import UserSerializer, playlistSerializer, ItemSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import UserProfile, Playlist, Item
from django.core.paginator import Paginator, EmptyPage
from math import ceil
from django.shortcuts import get_object_or_404, render

PER_PAGE = 10


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
        return Response({"username": user.username, "first_name": user.first_name,
                         "last_name": user.last_name, "email": user.email,
                         "last_login": user.last_login, "date_joined": user.date_joined, "location": profile.location})

    def put(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)
        changed = False
        data = request.data

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

    def get(self, request):

        page = 1
        if "page" in request.data:
            page = int(request.data["page"])

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
            ret.append({"creator_username": user.username, "name": playlist.name, "genre": playlist.genre,
                        "description": playlist.description})
        return Response(ret, status=status.HTTP_200_OK)


class searchUsersView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):

        page = 1
        if "page" in request.data:
            page = int(request.data["page"])

        entries = User.objects.filter()

        paginator = Paginator(entries, PER_PAGE)
        try:
            users = paginator.page(page)
        except EmptyPage:
            return Response({"message": "bad page !"}, status=status.HTTP_400_BAD_REQUEST)

        ret = []
        for user in users:
            ret.append({"username": user.username, "first_name": user.first_name, "last_name": user.last_name})

        return Response(ret, status=status.HTTP_200_OK)


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
                songs_serialized.append({"name": song.name, "author": song.author})
            response.append({"name": p.name, "genre": p.genre, "description": p.description,
                             "rating": p.rating, "songs": songs_serialized})
        return Response(response)

    def post(self, request):
        # manually setting up the user id's
        # firstly serialize the playlist
        request.data["creator"] = UserProfile.objects.get(user=request.user).id
        serializer = playlistSerializer(data=request.data)

        if serializer.is_valid():
            # if data provided is all good
            # save the object

            playlistObj = serializer.save()
            playlistId = playlistObj.id

            # now save all the items ( songs ) that belong to
            # that playlist
            try:
                Items = request.data["Tracks"]
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


class sharing(APIView):
    permission_classes = (IsAuthenticated,)

    def share(self, request):
        currenturl = request.get.allpath
        Object = Playlist.objects.filter(link_iexact == currenturl);

        name = Object.name

        if (Object.isPublic == False):
            return Response({"message": "This is a private playlist"}, status=status.HTTP_401_UNAUTHORIZED)

        else:
            return Response({"message": "Sharing available!"}, status=status.HTTP_200_OK)
