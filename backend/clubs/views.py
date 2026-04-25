import csv
from django.shortcuts import render
from rest_framework import viewsets
from .models import Club, FoodOrder, BudgetProposal, Event, AttendanceRecord
from .serializers import ClubSerializer, FoodOrderSerializer, BudgetProposalSerializer, EventSerializer, AttendanceRecordSerializer
from django.http import HttpResponse
from rest_framework.decorators import action

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer

class FoodOrderViewSet(viewsets.ModelViewSet):
    queryset = FoodOrder.objects.all()
    serializer_class = FoodOrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club')
        if club_id:
            qs = qs.filter(club_id=club_id)
        return qs

class BudgetProposalViewSet(viewsets.ModelViewSet):
    queryset = BudgetProposal.objects.all()
    serializer_class = BudgetProposalSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club')
        if club_id:
            qs = qs.filter(club_id=club_id)
        return qs

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club')
        if club_id:
            qs = qs.filter(club_id=club_id)
        return qs

    @action(detail=True, methods=['get'])
    def export_attendance(self, request, pk=None):
        event = self.get_object()
        records = event.attendance_records.all()

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{event.name}_attendance.csv"'

        writer = csv.writer(response)
        
        #Updated Headers
        writer.writerow(['First Name', 'Last Name', 'School Email', 'EMPLID', 'Timestamp']) 

        #Data Loop
        for record in records:
            writer.writerow([
                record.first_name, 
                record.last_name, 
                record.school_email, 
                record.emplid, 
                record.timestamp.strftime("%Y-%m-%d %H:%M:%S") # Formats the date
            ])

        return response

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer