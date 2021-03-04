from django.contrib import admin
from django.contrib.auth.models import User

from django.db import models
from .models import *


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "id")
    fields = ("user", )


class PlaylistAdmin(admin.ModelAdmin):
    list_display=("creator", "name")

class ItemAdmin(admin.ModelAdmin):
    list_display=("whichPlaylist", "name")

# Register your models here
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Playlist, PlaylistAdmin)
admin.site.register(Item, ItemAdmin)