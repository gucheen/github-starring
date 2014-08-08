from flask import Flask, render_template, request
import unirest


app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'GET':
        return render_template('index.html')
    elif request.method == 'POST':
        response = unirest.post('https://github.com/login/oauth/access_token', headers={'Accept': 'application/json'},
                                params={'client_id': '#You Client Code',
                                        'client_secret': '#Your client_secret',
                                        'code': request.form['code']})
        if response.code == 200:
            return response.raw_body
        else:
            return {'code': 500}
    else:
        return 'Unsupported request method'


@app.route('/starring', methods=['POST'])
def starring():
    if request.method == 'POST':
        access_token = request.form['accessToken']
        repo = request.form['repo']
        if access_token and not access_token.isspace() and repo and not repo.isspace():
            response = unirest.put('https://api.github.com/user/starred/' + repo + '?access_token=' + access_token,
                                   headers={'Accept': 'application/json', 'User-Agent': 'All-Star'})
            if response.code == 204:
                return '200'
            else:
                return '500'
        else:
            return 'Error Parameter'
    else:
        return 'Unsupported request method'


if __name__ == '__main__':
    app.run()