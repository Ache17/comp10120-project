from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from .models import Playlist, Item

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = User.objects.create_user(username=validated_data["username"], password=validated_data["password"], email=validated_data["email"])
        self.id = user.id
        return user
    
    class Meta:
        model = User
        fields = ("id", "username", "password", "email")


class playlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ("creator", "name", "genre", "description", "isPublic")

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ("whichPlaylist", "name", "author")