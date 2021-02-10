from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name='index'),
    path("login", views.login, name="login"),
    path("login2", views.login2, name="login2")]