from app.database import SessionLocal, engine
from app.models.base import Base
from app.utils.seed import seed_default_medicines, seed_sample_users


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_sample_users(session)
        seed_default_medicines(session)
    print("Sample users seeded successfully.")
