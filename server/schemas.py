# server/schemas.py

from marshmallow import fields
from config import ma
from models import User, Topic, TutorService, Request


# ---------- Public Topic ----------
class TopicWithTutorsSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Topic
        load_instance = True

    id = ma.auto_field()
    topic = ma.auto_field()
    description = ma.auto_field()


topic_schema = TopicWithTutorsSchema()
topics_schema = TopicWithTutorsSchema(many=True)




# ---------- Logged-in Tutor ----------

# ---------- Request ----------
class RequestSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Request
        load_instance = True

    id = ma.auto_field()
    status = ma.auto_field()
    description = ma.auto_field()

    student_id = ma.auto_field()
    tutor_service_id = ma.auto_field()


request_schema = RequestSchema()
requests_schema = RequestSchema(many=True)


# ---------- TutorService (for tutor view) ----------
class TutorServiceForTutorSchema(ma.SQLAlchemySchema):
    class Meta:
        model = TutorService
        load_instance = True

    id = ma.auto_field()
    rate = ma.auto_field()
    description = ma.auto_field()

    tutor_id = ma.auto_field()
    topic_id = ma.auto_field()

    # include requests for THIS service (each has student_id)
    requests = fields.Nested(RequestSchema, many=True)


tutor_service_for_tutor_schema = TutorServiceForTutorSchema()
tutor_services_for_tutor_schema = TutorServiceForTutorSchema(many=True)


# ---------- Topic + its services (derived from tutor_services) ----------
class TopicWithServicesSchema(ma.Schema):
    id = fields.Integer()
    topic = fields.String()
    description = fields.String(allow_none=True)

    tutor_services = fields.List(fields.Nested(TutorServiceForTutorSchema))


topic_with_services_schema = TopicWithServicesSchema()
topics_with_services_schema = TopicWithServicesSchema(many=True)


# ---------- Tutor ----------
class TutorSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()
    role = ma.auto_field()

    # tutor -> topics -> tutor_services -> requests (student_id)
    topics = fields.Method("get_topics")

    def get_topics(self, user_obj):
        # group tutor_services by topic
        topic_map = {}

        for ts in user_obj.tutor_services:
            t = ts.topic
            if t.id not in topic_map:
                topic_map[t.id] = {
                    "id": t.id,
                    "topic": t.topic,
                    "description": t.description,
                    "tutor_services": [],
                }
            topic_map[t.id]["tutor_services"].append(ts)

        # stable output order (by topic id)
        result = [topic_map[k] for k in sorted(topic_map.keys())]
        return topics_with_services_schema.dump(result)


tutor_schema = TutorSchema()
tutors_schema = TutorSchema(many=True)


# ---------- Request with nested TutorService and Topic (for student view) ----------
class TutorServiceForStudentSchema(ma.SQLAlchemySchema):
    class Meta:
        model = TutorService
        load_instance = True

    id = ma.auto_field()
    rate = ma.auto_field()
    description = ma.auto_field()

    tutor_id = ma.auto_field()
    topic_id = ma.auto_field()

    topic = fields.Nested(TopicWithTutorsSchema)
    tutor = fields.Nested(lambda: TutorInfoSchema())


class TutorInfoSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()


class RequestForStudentSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Request
        load_instance = True

    id = ma.auto_field()
    status = ma.auto_field()
    description = ma.auto_field()

    student_id = ma.auto_field()
    tutor_service_id = ma.auto_field()

    tutor_service = fields.Nested(TutorServiceForStudentSchema)


request_for_student_schema = RequestForStudentSchema()
requests_for_student_schema = RequestForStudentSchema(many=True)


# ---------- Student (what you dump in app.py) ----------
class StudentSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()
    role = ma.auto_field()

    topics = fields.Method("get_topics_with_requests")

    def get_topics_with_requests(self, user_obj):
        topic_map = {}

        # Group requests by topic and tutor_service
        for req in user_obj.requests:
            ts = req.tutor_service
            t = ts.topic

            # Create topic entry if doesn't exist
            if t.id not in topic_map:
                topic_map[t.id] = {
                    "id": t.id,
                    "topic": t.topic,
                    "description": t.description,
                    "tutor_services": {},
                }

            # Create tutor_service entry if doesn't exist
            if ts.id not in topic_map[t.id]["tutor_services"]:
                topic_map[t.id]["tutor_services"][ts.id] = {
                    "id": ts.id,
                    "rate": ts.rate,
                    "description": ts.description,
                    "tutor": {"id": ts.tutor.id, "name": ts.tutor.name},
                    "requests": [],
                }

            # Add request
            topic_map[t.id]["tutor_services"][ts.id]["requests"].append({
                "id": req.id,
                "status": req.status,
                "description": req.description,
            })

        # Convert nested dicts to lists
        result = []
        for topic_id in sorted(topic_map.keys()):
            topic_data = topic_map[topic_id]
            topic_data["tutor_services"] = list(topic_data["tutor_services"].values())
            result.append(topic_data)

        return result


student_schema = StudentSchema()
students_schema = StudentSchema(many=True)