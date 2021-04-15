from django.http import HttpResponse
from django.shortcuts import render



# Create your views here.
def index(request):
    return render(request, "frontend/index.html")

def login(request):
    return render(request, "frontend/login.html")

def login2(request):
    return render(request, "frontend/login2.html")
