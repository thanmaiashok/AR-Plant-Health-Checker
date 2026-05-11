from flask import Flask
from flask_cors import CORS
from routes import register_routes
import os

app = Flask(__name__)

CORS(app)

register_routes(app)

if __name__ == "__main__":

    port = int(os.environ.get("PORT", "5001"))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, use_reloader=False, host="127.0.0.1", port=port)
