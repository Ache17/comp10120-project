from django.urls import path
from . import views

urlpatterns = [path("test", views.testView.as_view())]