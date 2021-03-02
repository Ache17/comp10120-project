import re
from django.shortcuts import render
from rest_framework.settings import import_from_string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework import authentication, permissions
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import UserProfile


# Create your views here.
class testView(APIView):
    def get(self, request):
        return Response("just a test")

    def post(self, request):
        return  Response("post request")


class authenticatedTest(APIView):
    permission_classes = (IsAuthenticated,) 
    def get(self, request):
        return Response("get  success !")

    def post(self, request):
        return Response("post success !")


class registerView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):    
        print(request.data)
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            profile = UserProfile(user_id=serializer.id)
            profile.save()

            return Response({"message" : "registation sucessfull"}, status=status.HTTP_201_CREATED)
        return Response({"message" : "registration not sucessfull"}, status=status.HTTP_400_BAD_REQUEST)

