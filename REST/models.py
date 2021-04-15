from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=100, default="")
    follows = models.ManyToManyField('UserProfile', related_name="followed_by")


class Playlist(models.Model):
    creator = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    image = models.ImageField()
    genre = models.CharField(max_length=100)
    link = models.CharField(max_length=100)
    description = models.CharField(default="", max_length=256)
    rating = models.IntegerField(default=0)
    isPublic = models.BooleanField()


class Item(models.Model):
    whichPlaylist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    author = models.CharField(max_length=128)
    manual_link = models.CharField(default="", max_length=64)
    spotify_id = models.CharField(default="", max_length=64)
    apple_music_id = models.CharField(default="", max_length=64)
