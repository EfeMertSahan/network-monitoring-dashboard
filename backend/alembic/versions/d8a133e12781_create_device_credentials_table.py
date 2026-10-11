"""create device credentials table

Revision ID: d8a133e12781
Revises: 35f63a8793d9
Create Date: 2026-09-16
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d8a133e12781"
down_revision: Union[str, Sequence[str], None] = (
    "35f63a8793d9"
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "device_credentials",
        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
        ),
        sa.Column(
            "device_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "port",
            sa.Integer(),
            nullable=False,
            server_default="22",
        ),
        sa.Column(
            "username",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "password_encrypted",
            sa.String(length=2000),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["device_id"],
            ["devices.id"],
        ),
        sa.UniqueConstraint(
            "device_id",
            name="uq_device_credentials_device_id",
        ),
    )


def downgrade() -> None:
    op.drop_table(
        "device_credentials"
    )