from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models

from app.api.v1.alerts import router as alert_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.device import router as device_router
from app.api.v1.monitoring import router as monitoring_router
from app.api.v1.topology import router as topology_router
from app.tasks.scheduler import (
    start_scheduler,
    stop_scheduler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()

    yield

    stop_scheduler()


app = FastAPI(
    title="Network Monitoring Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    device_router,
    prefix="/api/v1/devices",
)

app.include_router(
    monitoring_router,
    prefix="/api/v1",
)

app.include_router(
    alert_router,
    prefix="/api/v1/alerts",
)

app.include_router(
    dashboard_router,
    prefix="/api/v1/dashboard",
)

app.include_router(
    topology_router,
    prefix="/api/v1/topology",
)