from django.db import models

# Create your models here.
from django.db import models

class Jazigo(models.Model):
    numero = models.CharField(max_length=20, verbose_name="Número do Jazigo")
    
    def __str__(self):
        return f"Jazigo {self.numero}"