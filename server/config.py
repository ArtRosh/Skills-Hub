# Standard library imports

# Remote library imports
import  os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_marshmallow import Marshmallow

# Local imports

# Instantiate app, set attributes
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# Instantiate secret key
app.config['SECRET_KEY'] = os.environ["SECRET_KEY"]

# Define metadata, instantiate db
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app) 

# Instantiate REST API
api = Api(app)

# Instantiate CORS
CORS(app)

# Instantiate Login Manager
login_manager = LoginManager()
login_manager.init_app(app)

# Instantiate Bcrypt
bcrypt = Bcrypt(app)

# Instantiate Marshmallow
ma = Marshmallow(app)