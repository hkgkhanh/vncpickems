from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class UsernamePasswordSignupRequest(BaseModel):
    username: str
    password: str


class AdminResponse(BaseModel):
    username: str

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    username: str | None = None