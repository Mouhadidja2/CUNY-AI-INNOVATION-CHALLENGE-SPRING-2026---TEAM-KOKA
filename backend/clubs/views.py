from django.shortcuts import render
from rest_framework import viewsets
from .models import Club, FoodOrder, BudgetProposal
from .serializers import ClubSerializer, FoodOrderSerializer, BudgetProposalSerializer

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer

class FoodOrderViewSet(viewsets.ModelViewSet):
    queryset = FoodOrder.objects.all()
    serializer_class = FoodOrderSerializer

class BudgetProposalViewSet(viewsets.ModelViewSet):
    queryset = BudgetProposal.objects.all()
    serializer_class = BudgetProposalSerializer