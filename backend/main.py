from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth,contacts,sos, route, crime_reports

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],  # Or specify specific methods like ["GET", "POST"]
    allow_headers=["*"],  # Or specify specific headers
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(contacts.router, prefix="/contacts", tags=["Contacts"])
app.include_router(sos.router, prefix="/sos", tags=["SOS"])
app.include_router(route.router, prefix="/route", tags=["Route"])
app.include_router(crime_reports.router, prefix="/external", tags=["External Services"])