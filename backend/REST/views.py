from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers, status

# Create your views here.
class testView(APIView):
    def get(self, request):
        return Response("just a test")

    def post(self, request):
        return  Response("post request")