from rest_framework.authtoken.views import obtain_auth_token
from django.urls import path
from . import views


urlpatterns = [path("test", views.testView.as_view()),
               path("register", views.registerView.as_view()), 
               path("auth", obtain_auth_token, name="auth")]