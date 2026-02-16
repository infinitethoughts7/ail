"""
Program configuration constants for AI Literacy — TMREIS 2026
"""

from datetime import date

# Program info
PROGRAM_NAME = "AI Literacy Program"
PROGRAM_YEAR = 2026
ORGANIZATION = "TMREIS (Telangana Minorities Residential Educational Institutions Society)"
SPONSOR = "UWH (United Way Hyderabad)"
IMPLEMENTING_PARTNER = "Swinfy"

# Schedule
PROGRAM_START_DATE = date(2026, 2, 21)
PROGRAM_END_DATE = date(2026, 2, 24)
TOTAL_DAYS = 4

# Targets
TOTAL_SCHOOLS = 40
TARGET_STUDENTS_PER_SCHOOL = 57
TOTAL_TARGET_STUDENTS = TOTAL_SCHOOLS * TARGET_STUDENTS_PER_SCHOOL  # 2,280

# Districts
DISTRICTS = [
    "Hyderabad",
    "Ranga Reddy",
    "Medchal",
    "Karimnagar",
    "Mahbubnagar",
    "Peddapally",
    "Narayanpet",
]

# Day schedule mapping
DAY_SCHEDULE = {
    1: {"date": date(2026, 2, 21), "title": "Introduction to AI & Machine Learning Basics"},
    2: {"date": date(2026, 2, 22), "title": "Data Literacy & AI Tools"},
    3: {"date": date(2026, 2, 23), "title": "AI for Problem Solving"},
    4: {"date": date(2026, 2, 24), "title": "AI Projects & Showcase"},
}

# Media upload limits
MAX_PHOTOS_PER_SUBMISSION = 20
MAX_PHOTO_SIZE_MB = 10
ALLOWED_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
MAX_PROJECTS_PER_SUBMISSION = 10
