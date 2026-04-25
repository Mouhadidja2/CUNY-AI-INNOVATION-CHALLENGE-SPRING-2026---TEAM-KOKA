from django.urls import path
from .views import analyze_proposal_api

urlpatterns = [
    path('analyze/', analyze_proposal_api, name='analyze_proposal'),
]