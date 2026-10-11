"""add alert type

Revision ID: 35f63a8793d9
Revises: 8c404749ea06
Create Date: 2026-09-16 12:15:02.585787

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "35f63a8793d9"
down_revision: Union[str, Sequence[str], None] = "8c404749ea06"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    alert_type_enum = sa.Enum(
        "Offline",
        "HighLatency",
        "HighPacketLoss",
        "HighCPU",
        "HighRAM",
        "HighDisk",
        name="alerttype",
    )

    alert_type_enum.create(
        op.get_bind(),
        checkfirst=True,
    )

    op.add_column(
        "alerts",
        sa.Column(
            "alert_type",
            alert_type_enum,
            nullable=True,
        ),
    )

    op.execute(
        "UPDATE alerts "
        "SET alert_type = 'Offline' "
        "WHERE alert_type IS NULL"
    )

    op.alter_column(
        "alerts",
        "alert_type",
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    alert_type_enum = sa.Enum(
        "Offline",
        "HighLatency",
        "HighPacketLoss",
        "HighCPU",
        "HighRAM",
        "HighDisk",
        name="alerttype",
    )

    op.drop_column(
        "alerts",
        "alert_type",
    )

    alert_type_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )