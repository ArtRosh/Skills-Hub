import os

# Remote library imports
from flask import request, render_template
from flask_restful import Resource
from flask_login import login_user, logout_user, current_user   
from flask_socketio import SocketIO, join_room, emit


# Local imports
from server.config import app, db, api, login_manager, bcrypt
from server.schemas import tutor_schema, topic_schema, student_schema
from server.schemas import topics_schema
from server.schemas import tutor_service_for_tutor_schema, request_schema, message_schema, messages_schema
# Add your model imports
from server.models import User, Topic, TutorService, Request, Message


socketio = SocketIO(app, cors_allowed_origins="*")

# Views go here!

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

@app.route('/')
def index():
    return render_template("index.html")


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
        
        data = request.get_json() or {}
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


def _get_accessible_request(request_id):
    req = db.session.get(Request, request_id)
    if not req:
        return None, ({"error": "Request not found"}, 404)

    if not current_user.is_authenticated:
        return None, ({"error": "Not logged in"}, 401)

    if req.status != "accepted":
        return None, ({"error": "Chat is only available after the request is accepted"}, 403)

    tutor_id = req.tutor_service.tutor_id
    if current_user.id not in (req.student_id, tutor_id):
        return None, ({"error": "Unauthorized"}, 403)

    return req, None


class RequestMessages(Resource):
    def get(self, id):
        req, error = _get_accessible_request(id)
        if error:
            return error

        return messages_schema.dump(req.messages), 200

    def post(self, id):
        req, error = _get_accessible_request(id)
        if error:
            return error

        data = request.get_json() or {}
        content = (data.get("content") or "").strip()

        if not content:
            return {"error": "content is required"}, 400

        new_message = Message(
            content=content,
            sender_id=current_user.id,
            request_id=req.id,
        )

        db.session.add(new_message)
        db.session.commit()

        payload = message_schema.dump(new_message)
        socketio.emit("new_message", payload, room=f"request_{req.id}")
        return payload, 201


@socketio.on("connect")
def connect():
    if not current_user.is_authenticated:
        return False


@socketio.on("join_chat")
def join_chat(data):
    request_id = (data or {}).get("request_id")
    if not request_id:
        emit("error", {"error": "request_id is required"})
        return

    req, error = _get_accessible_request(request_id)
    if error:
        emit("error", error[0])
        return

    join_room(f"request_{req.id}")
    emit("chat_joined", {"request_id": req.id, "messages": messages_schema.dump(req.messages)})


@socketio.on("send_message")
def send_message(data):
    request_id = (data or {}).get("request_id")
    content = (data or {}).get("content", "").strip()

    if not request_id:
        emit("error", {"error": "request_id is required"})
        return

    req, error = _get_accessible_request(request_id)
    if error:
        emit("error", error[0])
        return

    if not content:
        emit("error", {"error": "content is required"})
        return

    new_message = Message(
        content=content,
        sender_id=current_user.id,
        request_id=req.id,
    )

    db.session.add(new_message)
    db.session.commit()

    payload = message_schema.dump(new_message)
    emit("new_message", payload, room=f"request_{req.id}")




api.add_resource(Login, "/api/login")
api.add_resource(Signup, "/api/signup")
api.add_resource(CheckSession, "/api/check_session")
api.add_resource(Logout, "/api/logout")
api.add_resource(Topics, "/api/topics")
api.add_resource(TutorServiceResource, "/api/tutor_services", "/api/tutor_services/<int:id>")
api.add_resource(RequestResource, "/api/requests")
api.add_resource(RequestUpdate, "/api/requests/<int:id>")
api.add_resource(RequestMessages, "/api/requests/<int:id>/messages")


@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return {"error": "Not found"}, 404
    return render_template("index.html")


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5555))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    socketio.run(app, host="0.0.0.0", port=port, debug=debug)

