from flask import Flask, request
import requests
from urllib.parse import urlparse
from flask import render_template_string
from markupsafe import escape
import subprocess
import re


app = Flask(__name__)

ALLOWED_DOMAINS = ['example.com', 'www.example.com']

@app.route('/')
def home():
    return 'Secured App - Python. Try /fetch-url'

@app.route('/fetch-url', methods=['GET', 'POST'])
def fetch_url():
    if request.method == 'GET':
        return '''
            <h2>URL Preview Tool</h2>
            <form method="POST">
                <input type="text" name="url" placeholder="Enter a URL to preview">
                <button type="submit">Fetch</button>
            </form>
        '''

    url = request.form['url']
    parsed = urlparse(url)

    if parsed.hostname not in ALLOWED_DOMAINS:
        return f'Error: The domain "{parsed.hostname}" is not on the allowed list.'

    try:
        response = requests.get(url, timeout=5)
        return f'<h3>Content from {url}:</h3><pre>{response.text[:1000]}</pre>'
    except Exception as e:
        return f'Error fetching URL: {str(e)}'

@app.route('/welcome')
def welcome():
    name = request.args.get('name', 'Guest')
    safe_name = escape(name)
    template = '<h2>Welcome, {{ name }}!</h2>'
    return render_template_string(template, name=safe_name)

@app.route('/ping', methods=['GET', 'POST'])
def ping():
    if request.method == 'GET':
        return '''
            <h2>Server Health Check</h2>
            <form method="POST">
                <input type="text" name="host" placeholder="Enter a hostname or IP">
                <button type="submit">Ping</button>
            </form>
        '''

    host = request.form['host']

    if not re.match(r'^[a-zA-Z0-9.\-]+$', host):
        return 'Error: Invalid hostname format.'

    result = subprocess.run(['ping', '-n', '1', host], shell=False, capture_output=True, text=True)
    return f'<pre>{result.stdout}</pre>'

@app.route('/calculate')
def calculate():
    number = request.args.get('number', '10')

    try:
        result = 100 / int(number)
        return f'<h2>Simple Calculator</h2><p>Result: {result}</p>'
    except ZeroDivisionError:
        return '<h2>Simple Calculator</h2><p>Error: Cannot divide by zero.</p>'
    except ValueError:
        return '<h2>Simple Calculator</h2><p>Error: Please enter a valid number.</p>'

if __name__ == '__main__':
    app.run(port=5001, debug=False)