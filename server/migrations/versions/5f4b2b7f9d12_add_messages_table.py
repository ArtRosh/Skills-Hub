"""add messages table

Revision ID: 5f4b2b7f9d12
Revises: 128f9ff3b5e9
Create Date: 2026-04-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5f4b2b7f9d12'
down_revision = '128f9ff3b5e9'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=False),
        sa.Column('request_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['request_id'], ['requests.id'], name=op.f('fk_messages_request_id_requests')),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], name=op.f('fk_messages_sender_id_users')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_created_at'), 'messages', ['created_at'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_messages_created_at'), table_name='messages')
    op.drop_table('messages')