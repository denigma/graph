import json

from django.shortcuts import render
from django.views.generic import TemplateView


def graph(request, pk=None, template='graph/graph3.html'):

    graph = {
        "nodes":[{'name':'Aging', 'text':'Functonial loss over time', 'group':1},
                 {'name':'Cancer', 'text':'Uncontrolled cell proliferation', 'group':2}],
        "links":[{'source':'Aging',
                  'value':{'title':'causes', 'text':'A causality relation'},
                  'target':'Cancer'}]
    }

    data = json.dumps(graph)
    if pk: template = 'graph/loaded-graph-' + pk + '.html'
    return render(request, template, {'data': data})


class GraphView(TemplateView):
    template_name = 'graph/vivagraph.html'
    def dispatch(self, request, *args, **kwargs):
        if 'slug' in kwargs and kwargs['slug']:
            self.template_name = 'graph/' + kwargs['slug'] + '.html'
        if 'pk' in kwargs:
            self.template_name = 'graph/' + kwargs['pk'] + '.html'
        return super(GraphView, self).dispatch(request, *args, **kwargs)