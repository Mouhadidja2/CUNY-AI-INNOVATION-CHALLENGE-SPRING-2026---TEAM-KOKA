from django.contrib import admin
from django.urls import path, include  # <-- Don't forget 'include'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('auditor.urls')), # This makes the URL: /api/analyze/
]