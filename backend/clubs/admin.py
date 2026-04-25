from django.contrib import admin
from import_export.admin import ExportActionModelAdmin
from .models import AttendanceRecord, Event

@admin.register(AttendanceRecord)
class AttendanceAdmin(ExportActionModelAdmin):
    list_display = ('first_name', 'last_name', 'event', 'timestamp')
    list_filter = ('event',)
