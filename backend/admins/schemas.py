from pydantic import BaseModel

class AdminSchema(BaseModel):
    username: str

    class Config:
        from_attributes = True