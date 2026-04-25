from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, FoodOrderViewSet

router = DefaultRouter()
router.register(r'clubs', ClubViewSet)
router.register(r'food-orders', FoodOrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]