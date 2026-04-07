
from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('api/upload/', views.upload_swagger, name='upload_swagger'),
    path('api/chat/', views.chat_agent, name='chat_agent'),
    path('api/test/', views.manual_test, name='manual_test'),

  
]