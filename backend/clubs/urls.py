from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, FoodOrderViewSet, BudgetProposalViewSet

router = DefaultRouter()
router.register(r'clubs', ClubViewSet)
router.register(r'food-orders', FoodOrderViewSet)
router.register(r'budgets', BudgetProposalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]