import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.models import User, Skill
from app.core.security import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db):
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=get_password_hash("testpassword"),
        is_public=True,
        availability="available"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_skill(db_session):
    skill = Skill(
        name="Test Skill",
        description="A test skill",
        is_approved=True
    )
    db_session.add(skill)
    db_session.commit()
    db_session.refresh(skill)
    return skill

@pytest.fixture
def auth_headers(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpassword"}
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

@pytest.fixture
def admin_user(db_session):
    user = User(
        name="Admin User",
        email="admin@admin.com",
        password_hash=get_password_hash("adminpassword"),
        is_admin=True,
        is_public=True,
        availability="available"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user