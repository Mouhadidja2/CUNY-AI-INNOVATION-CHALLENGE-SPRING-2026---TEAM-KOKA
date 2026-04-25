from django.shortcuts import render
from rest_framework import viewsets
from .models import Club, FoodOrder
from .serializers import ClubSerializer, FoodOrderSerializer

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer

class FoodOrderViewSet(viewsets.ModelViewSet):
    queryset = FoodOrder.objects.all()
    serializer_class = FoodOrderSerializer