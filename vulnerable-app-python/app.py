from flask import Flask, request
import requests
from flask import render_template_string
import subprocess

app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <link rel="stylesheet" href="/static/style.css">
    <h2>Vulnerable App - Python</h2>
    <div class="vuln-grid">
      <a href="/fetch-url" class="vuln-card">
        SSRF
        <span class="vuln-desc">Make the server fetch internal resources</span>
      </a>
      <a href="/welcome?name=Guest" class="vuln-card">
        SSTI
        <span class="vuln-desc">Inject template code that executes on the server</span>
      </a>
      <a href="/ping" class="vuln-card">
        OS Command Injection
        <span class="vuln-desc">Run extra system commands via input</span>
      </a>
      <a href="/calculate?number=5" class="vuln-card">
        Information Disclosure
        <span class="vuln-desc">Leak server internals via errors and headers</span>
      </a>
    </div>
    '''

@app.route('/fetch-url', methods=['GET', 'POST'])
def fetch_url():
    if request.method == 'GET':
        return '''
            <link rel="stylesheet" href="/static/style.css">
            <h2>URL Preview Tool</h2>
            <p class="page-hint">Try: <code>http://localhost:5000/</code> to see the server fetch its own internal page.</p>
            <form method="POST">
                <input type="text" name="url" placeholder="Enter a URL to preview">
                <button type="submit">Fetch</button>
            </form>
        '''

    url = request.form['url']
    try:
        response = requests.get(url, timeout=5)
        return f'<h3>Content from {url}:</h3><pre>{response.text[:1000]}</pre>'
    except Exception as e:
        return f'Error fetching URL: {str(e)}'
    
@app.route('/welcome')
def welcome():
    name = request.args.get('name', 'Guest')
    template = f'''
        <link rel="stylesheet" href="/static/style.css">
        <h2>Welcome, {name}!</h2>
        <p class="page-hint">Try changing the "name" parameter in the URL to: <code>{{{{7*7}}}}</code></p>
    '''
    return render_template_string(template)

@app.route('/ping', methods=['GET', 'POST'])
def ping():
    if request.method == 'GET':
        return '''
            <link rel="stylesheet" href="/static/style.css">
            <h2>Server Health Check</h2>
            <p class="page-hint">Try: <code>google.com & dir</code> to inject an extra command.</p>
            <form method="POST">
                <input type="text" name="host" placeholder="Enter a hostname or IP">
                <button type="submit">Ping</button>
            </form>
        '''

    host = request.form['host']
    command = f'ping -n 1 {host}'
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return f'<pre>{result.stdout}</pre>'

@app.route('/calculate')
def calculate():
    number = request.args.get('number', '10')
    result = 100 / int(number)
    return f'''
        <link rel="stylesheet" href="/static/style.css">
        <h2>Simple Calculator</h2>
        <p class="page-hint">Try changing the "number" parameter in the URL to: <code>0</code> to trigger a detailed debug error page. Or open DevTools → Network tab and inspect the "Server" response header on any page.</p>
        <p>Result: {result}</p>
    '''

if __name__ == '__main__':
    app.run(port=5000, debug=True)