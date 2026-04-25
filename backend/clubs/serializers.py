from rest_framework import serializers
from .models import Club, FoodOrder, BudgetProposal

class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = '__all__'

class FoodOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodOrder
        fields = '__all__'

class BudgetProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetProposal
        fields = '__all__'