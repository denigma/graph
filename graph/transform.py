"""Transforms templates into rendered format without template tags."""
import os


input_path = './templates/graph/'
output_path = './templates/rendered/'

static_path = '../../static/'

for filename in os.listdir(input_path):
    print filename
    input = open(os.path.join(input_path, filename), 'r')
    data = input.read()
    data = data.replace('{% load staticfiles %}', '')
    data = data.replace('{% static "', static_path).replace('" %}', '')
    data = data.replace('{{ STATIC_URL }}', static_path)
    output = open(os.path.join(output_path, filename), 'w')
    output.writelines(data)
    input.close()
    output.close()