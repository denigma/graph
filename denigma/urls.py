from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'denigma.views.home', name='home'),
    url(r'^', include('graph.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
