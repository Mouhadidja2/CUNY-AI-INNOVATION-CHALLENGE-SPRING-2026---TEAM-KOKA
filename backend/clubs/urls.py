from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, FoodOrderViewSet, BudgetProposalViewSet, EventViewSet, AttendanceRecordViewSet

router = DefaultRouter()
router.register(r'clubs', ClubViewSet)
router.register(r'food-orders', FoodOrderViewSet)
router.register(r'budgets', BudgetProposalViewSet)
router.register(r'events', EventViewSet)

#to test wil chnage later so just frontend
router.register(r'attendance', AttendanceRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]