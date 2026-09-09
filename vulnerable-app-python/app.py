from flask import Flask, request
import requests
from flask import render_template_string

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello from the Python Vulnerable App! Try /fetch-url'

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
    try:
        response = requests.get(url, timeout=5)
        return f'<h3>Content from {url}:</h3><pre>{response.text[:1000]}</pre>'
    except Exception as e:
        return f'Error fetching URL: {str(e)}'
    
@app.route('/welcome')
def welcome():
    name = request.args.get('name', 'Guest')
    template = f'<h2>Welcome, {name}!</h2>'
    return render_template_string(template)

if __name__ == '__main__':
    app.run(port=5000, debug=True)