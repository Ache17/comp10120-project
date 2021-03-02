from rest_framework.authtoken.views import obtain_auth_token
from django.urls import path
from . import views
from .views import ListUsers,CustomAuthToken


urlpatterns = [path("test", views.testView.as_view()),
               path("register", views.registerView.as_view()), 
               path("auth", obtain_auth_token, name="auth"),
               path('api/users', ListUsers.as_view()),
               path('api/token/auth/', CustomAuthToken.as_view()),
               ]