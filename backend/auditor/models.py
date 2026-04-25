from django.db import models

class Club(models.Model):
    name = models.CharField(max_length=255)
    president = models.CharField(max_length=255)
    budget_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    member_count = models.IntegerField(default=1)

    def __str__(self):
        return self.name
    
class BudgetItem(models.Model):
    # This links the item to a Club. If the club is deleted, its items are too.
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=500) # e.g., "Pepperoni Pizza"
    category = models.CharField(max_length=100)    # e.g., "Food", "Supplies"
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    # This is for the AI auditor later
    is_compliant = models.BooleanField(default=True)
    audit_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.description} ({self.club.name})"
