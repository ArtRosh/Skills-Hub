# server/models.py

from flask_login import UserMixin

from config import db
from config import bcrypt


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)  # "student" | "tutor" 

    tutor_services = db.relationship("TutorService", back_populates="tutor", cascade="all, delete-orphan")

    topics = db.relationship("Topic", secondary="tutor_services", viewonly=True, back_populates="tutors")

    sent_requests = db.relationship("Request", foreign_keys="Request.student_id", back_populates="student", cascade="all, delete-orphan")

    received_requests = db.relationship("Request", foreign_keys="Request.tutor_id", back_populates="tutor")


class Topic(db.Model):
    __tablename__ = "topics"

    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String, nullable=False)
    description = db.Column(db.String)

    tutor_services = db.relationship("TutorService", back_populates="topic", cascade="all, delete-orphan")

    tutors = db.relationship("User", secondary="tutor_services", viewonly=True, back_populates="topics")

    requests = db.relationship("Request", back_populates="topic", cascade="all, delete-orphan")


class TutorService(db.Model):
    __tablename__ = "tutor_services"

    id = db.Column(db.Integer, primary_key=True)
    rate = db.Column(db.Integer)
    description = db.Column(db.String)

    tutor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey("topics.id"), nullable=False)

    tutor = db.relationship("User", back_populates="tutor_services")

    topic = db.relationship("Topic", back_populates="tutor_services")


class Request(db.Model):
    __tablename__ = "requests"

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String, nullable=False)  # pending/accepted/rejected/completed
    description = db.Column(db.String)

    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    tutor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey("topics.id"), nullable=False)

    student = db.relationship("User", foreign_keys=[student_id], back_populates="sent_requests")

    tutor = db.relationship("User", foreign_keys=[tutor_id], back_populates="received_requests")

    topic = db.relationship("Topic", back_populates="requests")