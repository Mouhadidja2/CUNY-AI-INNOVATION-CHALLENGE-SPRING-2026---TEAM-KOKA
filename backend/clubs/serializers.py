from rest_framework import serializers
from .models import Club, FoodOrder, BudgetProposal, Event, AttendanceRecord

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

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = '__all__'