# server/schemas.py

from marshmallow import fields
from config import ma
from models import User, Topic, Request


class RequestSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Request
        load_instance = True

    id = ma.auto_field()
    status = ma.auto_field()
    description = ma.auto_field()
    tutor_id = ma.auto_field()


request_schema = RequestSchema()
requests_schema = RequestSchema(many=True)


class TopicWithRequestsSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Topic
        load_instance = True

    id = ma.auto_field()
    topic = ma.auto_field()
    description = ma.auto_field()

    requests = fields.Nested(RequestSchema, many=True)


topic_with_requests_schema = TopicWithRequestsSchema()
topics_with_requests_schema = TopicWithRequestsSchema(many=True)


class TutorSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()
    role = ma.auto_field()

    topics = fields.Method("get_topics")

    def get_topics(self, user_obj):
        topics = [ts.topic for ts in user_obj.tutor_services]
        return topics_with_requests_schema.dump(topics)


tutor_schema = TutorSchema()