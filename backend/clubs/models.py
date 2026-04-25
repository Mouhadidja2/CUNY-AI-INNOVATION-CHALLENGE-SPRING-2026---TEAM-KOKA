from django.db import models
from django.contrib.auth.models import User

class Club(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    campus = models.CharField(max_length=100, default="BMCC")
    
    def __str__(self):
        return self.name

class FoodOrder(models.Model):
    ORDER_TYPE_CHOICES = [
        ('MBJ', 'Standard MBJ Caterer'),
        ('OON', 'Out of Network'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending SGA Approval'),
        ('APPROVED', 'Approved'),
        ('DENIED', 'Denied'),
    ]
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='food_orders')
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    order_type = models.CharField(max_length=3, choices=ORDER_TYPE_CHOICES, default='MBJ')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    
    # Form
    contact_name = models.CharField(max_length=255, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    event_date = models.DateField(null=True, blank=True)
    setup_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    headcount = models.IntegerField(null=True, blank=True)
    food_items = models.TextField(help_text="List the packages and specific items ordered.", null=True, blank=True)
    total_cost = models.DecimalField(max_digits=8, decimal_places=2,null=True, blank=True)

    # Might be reused for out of network orders
    quote_1 = models.FileField(upload_to='quotes/', blank=True, null=True)
    quote_2 = models.FileField(upload_to='quotes/', blank=True, null=True)
    quote_3 = models.FileField(upload_to='quotes/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.club.name} - {self.get_order_type_display()} - ${self.total_cost}"