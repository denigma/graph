from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from graph.views import GraphView


urlpatterns = patterns('graph.views',
    url(r'^$', TemplateView.as_view(template_name='graph/index.html'), name='graph'),
    url(r'view/(?P<pk>\d?)', 'graph', name='graph-view'),
    url(r'(?P<slug>[0-9a-zA-Z\_-]+)', GraphView.as_view(), name='graph'), # url(r'(?P<pk>\d?)', GraphView.as_view(), name='graph'),
    url(r'turtle/$', TemplateView.as_view(template_name='graph/turtle.html'), name='turtle')
)

