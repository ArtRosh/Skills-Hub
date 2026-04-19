from flask_login import UserMixin
from server.config import db
from datetime import datetime


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)  # student | tutor 

    tutor_services = db.relationship("TutorService", back_populates="tutor", cascade="all, delete-orphan")

    topics = db.relationship("Topic", secondary="tutor_services", viewonly=True, back_populates="tutors")

    requests = db.relationship("Request", foreign_keys="Request.student_id", back_populates="student", cascade="all, delete-orphan")

    sent_messages = db.relationship("Message", back_populates="sender", cascade="all, delete-orphan")


class Topic(db.Model):
    __tablename__ = "topics"

    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String, nullable=False)
    description = db.Column(db.String)

    tutor_services = db.relationship("TutorService", back_populates="topic", cascade="all, delete-orphan")
    
    tutors = db.relationship("User", secondary="tutor_services", viewonly=True, back_populates="topics")


class TutorService(db.Model):
    __tablename__ = "tutor_services"

    id = db.Column(db.Integer, primary_key=True)
    rate = db.Column(db.Integer)
    description = db.Column(db.String)

    tutor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey("topics.id"), nullable=False)

    tutor = db.relationship("User", back_populates="tutor_services")

    topic = db.relationship("Topic", back_populates="tutor_services")

    requests = db.relationship("Request", back_populates="tutor_service", cascade="all, delete-orphan")


class Request(db.Model):
    __tablename__ = "requests"

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String, nullable=False)
    description = db.Column(db.String)

    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    tutor_service_id = db.Column(db.Integer, db.ForeignKey("tutor_services.id"), nullable=False)

    student = db.relationship("User", foreign_keys=[student_id], back_populates="requests")
    
    tutor_service = db.relationship("TutorService", back_populates="requests")

    messages = db.relationship(
        "Message",
        back_populates="request",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey("requests.id"), nullable=False)

    sender = db.relationship("User", back_populates="sent_messages")
    request = db.relationship("Request", back_populates="messages")