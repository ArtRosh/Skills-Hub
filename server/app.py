# Remote library imports
from flask import request, Flask, render_template
from flask_restful import Resource
from flask_login import login_user, logout_user, current_user   


# Local imports
from server.config import app, db, api, login_manager, bcrypt
from server.schemas import tutor_schema, topic_schema, student_schema
from server.schemas import topics_schema
from server.schemas import tutor_service_for_tutor_schema, request_schema
# Add your model imports
from server.models import User, Topic, TutorService, Request

# Views go here!

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

@app.route('/')
def index():
    return {"message": "Skills-Hab API is running"}


class Login(Resource):
    def post(self):
        data = request.get_json() or {}
        name = data.get("name")
        password = data.get("password")

        if not name or not password:
            return {"error": "name and password are required"}, 400

        user = User.query.filter_by(name=name).first()

        if not user or not bcrypt.check_password_hash(user.password, password):
            return {"error": "Invalid credentials"}, 401

        login_user(user)
        schema = tutor_schema if user.role == "tutor" else student_schema
        return schema.dump(user), 200
    

class Signup(Resource):
    def post(self):
        data = request.get_json() or {}
        name = data.get("name")
        password = data.get("password")
        role = data.get("role")

        if not name or not password or not role:
            return {"error": "name, password, role are required"}, 400

        if role not in ("student", "tutor"):
            return {"error": "role must be 'student' or 'tutor'"}, 400

        existing_user = User.query.filter_by(name=name).first()
        if existing_user:
            return {"error": "name is already taken"}, 409

        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        user = User(name=name, password=password_hash, role=role)
        db.session.add(user)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"error": "could not create user"}, 500

        login_user(user)

        schema = tutor_schema if user.role == "tutor" else student_schema
        return schema.dump(user), 201


class CheckSession(Resource):
    def get(self):
        if not current_user.is_authenticated:
            return {"error": "Not Authorized"}, 401
        schema = tutor_schema if current_user.role == "tutor" else student_schema
        return schema.dump(current_user), 200


class Logout(Resource):
    def delete(self):
        logout_user()
        return {}, 204
    

class Topics(Resource):
    def get(self):
        topics = Topic.query.all()
        return topics_schema.dump(topics), 200
    
    def post(self):
        if not current_user.is_authenticated:
            return {"error": "Not logged in"}, 401
        
        data = request.get_json() or {}
        topic_name = data.get("topic")
        description = data.get("description", "")
        
        if not topic_name:
            return {"error": "topic is required"}, 400
        
        new_topic = Topic(topic=topic_name, description=description)
        db.session.add(new_topic)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error creating topic: {str(e)}")
            return {"error": f"could not create topic: {str(e)}"}, 500
        
        return topic_schema.dump(new_topic), 201


class TutorServiceResource(Resource):
    def post(self):
        if not current_user.is_authenticated:
            return {"error": "Not logged in"}, 401
        
        data = request.get_json() or {}
        topic_id = data.get("topic_id")
        rate = data.get("rate")
        description = data.get("description", "")
        
        if not topic_id or not rate:
            return {"error": "topic_id and rate are required"}, 400
        
        # Check if topic exists
        topic = db.session.get(Topic, topic_id)
        if not topic:
            return {"error": "Topic not found"}, 404
        
        new_service = TutorService(
            tutor_id=current_user.id,
            topic_id=topic_id,
            rate=rate,
            description=description
        )
        db.session.add(new_service)
        
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"error": "could not create service"}, 500
        
        return tutor_service_for_tutor_schema.dump(new_service), 201
    
    def patch(self, id):
        if not current_user.is_authenticated:
            return {"error": "Not logged in"}, 401
        
        service = db.session.get(TutorService, id)
        if not service:
            return {"error": "Service not found"}, 404
        
        if service.tutor_id != current_user.id:
            return {"error": "Unauthorized"}, 403
        
        data = request.get_json()
        service.rate = data.get("rate", service.rate)
        service.description = data.get("description", service.description)
        service.topic_id = data.get("topic_id", service.topic_id)
        
        db.session.commit()
        return tutor_service_for_tutor_schema.dump(service), 200

    def delete(self, id):
        if not current_user.is_authenticated:
            return {"error": "Not logged in"}, 401
        
        service = db.session.get(TutorService, id)
        if not service:
            return {"error": "Service not found"}, 404
        
        db.session.delete(service)
        db.session.commit()
        return {}, 204



class TutorServiceDelete(Resource):
    def delete(self, id):
        if not current_user.is_authenticated:
            return {"error": "Not logged in"}, 401
        
        service = db.session.get(TutorService, id)
        if not service:
            return {"error": "Service not found"}, 404
        
        db.session.delete(service)
        db.session.commit()
        return {}, 204


class RequestResource(Resource):
    def post(self):
        if not current_user.is_authenticated:
            return {"error": "Not logged in"}, 401
        
        data = request.get_json() or {}
        tutor_service_id = data.get("tutor_service_id")
        description = data.get("description", "")
        
        if not tutor_service_id:
            return {"error": "tutor_service_id is required"}, 400
        
        # Check if tutor service exists
        tutor_service = db.session.get(TutorService, tutor_service_id)
        if not tutor_service:
            return {"error": "Tutor service not found"}, 404
        
        new_request = Request(
            student_id=current_user.id,
            tutor_service_id=tutor_service_id,
            description=description,
            status="pending"
        )
        db.session.add(new_request)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"error": f"could not create request: {str(e)}"}, 500
        
        return request_schema.dump(new_request), 201


class RequestUpdate(Resource):
    ALLOWED_STATUSES = {"pending", "accepted", "rejected"}

    def patch(self, id):
        if not current_user.is_authenticated:
            return {"error": "Not logged in"}, 401

        req = db.session.get(Request, id)
        if not req:
            return {"error": "Request not found"}, 404

        # Only the tutor who owns the tutor_service can change status
        if current_user.role != "tutor" or req.tutor_service.tutor_id != current_user.id:
            return {"error": "Unauthorized"}, 403

        data = request.get_json() or {}
        new_status = data.get("status")

        if new_status is None:
            return {"error": "status is required"}, 400

        if new_status not in self.ALLOWED_STATUSES:
            return {"error": f"status must be one of: {', '.join(sorted(self.ALLOWED_STATUSES))}"}, 400

        req.status = new_status
        db.session.commit()
        return request_schema.dump(req), 200

    # Backward-compatible: allow POST to behave like PATCH
    def post(self, id):
        return self.patch(id)




api.add_resource(Login, "/login")
api.add_resource(Signup, "/signup")
api.add_resource(CheckSession, "/check_session")
api.add_resource(Logout, "/logout")
api.add_resource(Topics, "/topics")
api.add_resource(TutorServiceResource, "/tutor_services", "/tutor_services/<int:id>")
api.add_resource(RequestResource, "/requests")
api.add_resource(RequestUpdate, "/requests/<int:id>")


if __name__ == '__main__':
    app.run(port=5555, debug=True)

