"""
Seed command for AI Literacy Program — TMREIS 2026

Seeds:
  - 4-day curriculum
  - 7 districts
  - 40 schools (from TGMREIS circular)
  - User accounts (admin, sponsors, sample trainers)
  - UWH control singleton

Usage:
  python manage.py seed_real_data          # full seed
  python manage.py seed_real_data --flush  # wipe existing data first
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.dashboard.models import (
    Curriculum,
    District,
    School,
    UWHControl,
)

# ──────────────────────────────────────────────
# 4-Day Curriculum
# ──────────────────────────────────────────────
CURRICULUM = [
    {
        "day_number": 1,
        "title": "Introduction to AI & Machine Learning Basics",
        "description": "Students explore what AI is, its real-world applications, and understand the basics of machine learning through interactive activities.",
        "learning_objectives": [
            "Understand what Artificial Intelligence is",
            "Identify AI in everyday life",
            "Learn the difference between AI, ML, and Deep Learning",
            "Explore ethical considerations of AI",
        ],
        "activities": [
            "AI Scavenger Hunt — identify AI in daily life",
            "Interactive quiz on AI concepts",
            "Group discussion: AI in healthcare, education, agriculture",
            "Hands-on: Teachable Machine image classifier",
        ],
    },
    {
        "day_number": 2,
        "title": "Data Literacy & AI Tools",
        "description": "Students learn about data collection, datasets, bias in AI, and get hands-on experience with AI tools.",
        "learning_objectives": [
            "Understand the role of data in AI",
            "Learn about data collection and datasets",
            "Recognize bias in AI systems",
            "Use AI-powered tools for creative tasks",
        ],
        "activities": [
            "Data collection exercise — survey & analysis",
            "Bias detection activity with real datasets",
            "Hands-on: ChatGPT / AI chatbot exploration",
            "Create AI-generated art with prompts",
        ],
    },
    {
        "day_number": 3,
        "title": "AI for Problem Solving",
        "description": "Students apply AI concepts to solve real-world problems in their communities, working in teams to design AI solutions.",
        "learning_objectives": [
            "Apply AI thinking to local problems",
            "Design an AI solution prototype",
            "Collaborate in teams for problem-solving",
            "Present ideas effectively",
        ],
        "activities": [
            "Problem identification brainstorm",
            "Solution design workshop",
            "AI prototype sketching and planning",
            "Team presentations — pitch your AI idea",
        ],
    },
    {
        "day_number": 4,
        "title": "AI Projects & Showcase",
        "description": "Students finalize their AI projects and present them. Certificates are distributed and the program concludes.",
        "learning_objectives": [
            "Complete and refine AI project",
            "Present project to an audience",
            "Reflect on AI learning journey",
            "Understand future pathways in AI/tech",
        ],
        "activities": [
            "Project finalization and testing",
            "Student project showcase and presentations",
            "Peer feedback and voting",
            "Certificate distribution ceremony",
        ],
    },
]

# ──────────────────────────────────────────────
# Districts (from TGMREIS Circular)
# ──────────────────────────────────────────────
DISTRICTS = [
    "Hyderabad",
    "Rangareddy",
    "Medchal-Malkajgiri",
    "Sangareddy",
    "Nalgonda",
    "Karimnagar",
    "Warangal",
]

# ──────────────────────────────────────────────
# 40 Schools — mapped to districts
# ──────────────────────────────────────────────
SCHOOLS = [
    # Hyderabad (10)
    {"name": "TMREIS Girls School, Nampally", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Chaderghat", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Mallepally", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Bahadurpura", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Shaikpet", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Karwan", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Misrigunj", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Talabkatta", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Dabeerpura", "district": "Hyderabad"},
    {"name": "TMREIS Girls School, Golconda", "district": "Hyderabad"},
    # Rangareddy (8)
    {"name": "TMREIS Girls School, Shamshabad", "district": "Rangareddy"},
    {"name": "TMREIS Girls School, Rajendranagar", "district": "Rangareddy"},
    {"name": "TMREIS Girls School, Chevella", "district": "Rangareddy"},
    {"name": "TMREIS Girls School, Ibrahimpatnam", "district": "Rangareddy"},
    {"name": "TMREIS Girls School, Maheshwaram", "district": "Rangareddy"},
    {"name": "TMREIS Girls School, Tandur", "district": "Rangareddy"},
    {"name": "TMREIS Girls School, Shadnagar", "district": "Rangareddy"},
    {"name": "TMREIS Girls School, Farooqnagar", "district": "Rangareddy"},
    # Medchal-Malkajgiri (6)
    {"name": "TMREIS Girls School, Medchal", "district": "Medchal-Malkajgiri"},
    {"name": "TMREIS Girls School, Alwal", "district": "Medchal-Malkajgiri"},
    {"name": "TMREIS Girls School, Kompally", "district": "Medchal-Malkajgiri"},
    {"name": "TMREIS Girls School, Uppal", "district": "Medchal-Malkajgiri"},
    {"name": "TMREIS Girls School, Malkajgiri", "district": "Medchal-Malkajgiri"},
    {"name": "TMREIS Girls School, Boduppal", "district": "Medchal-Malkajgiri"},
    # Sangareddy (5)
    {"name": "TMREIS Girls School, Sangareddy", "district": "Sangareddy"},
    {"name": "TMREIS Girls School, Zaheerabad", "district": "Sangareddy"},
    {"name": "TMREIS Girls School, Narayankhed", "district": "Sangareddy"},
    {"name": "TMREIS Girls School, Patancheru", "district": "Sangareddy"},
    {"name": "TMREIS Girls School, Sadashivpet", "district": "Sangareddy"},
    # Nalgonda (4)
    {"name": "TMREIS Girls School, Nalgonda", "district": "Nalgonda"},
    {"name": "TMREIS Girls School, Miryalaguda", "district": "Nalgonda"},
    {"name": "TMREIS Girls School, Suryapet", "district": "Nalgonda"},
    {"name": "TMREIS Girls School, Devarakonda", "district": "Nalgonda"},
    # Karimnagar (4)
    {"name": "TMREIS Girls School, Karimnagar", "district": "Karimnagar"},
    {"name": "TMREIS Girls School, Jagtial", "district": "Karimnagar"},
    {"name": "TMREIS Girls School, Peddapalli", "district": "Karimnagar"},
    {"name": "TMREIS Girls School, Sircilla", "district": "Karimnagar"},
    # Warangal (3)
    {"name": "TMREIS Girls School, Warangal", "district": "Warangal"},
    {"name": "TMREIS Girls School, Hanamkonda", "district": "Warangal"},
    {"name": "TMREIS Girls School, Jangaon", "district": "Warangal"},
]

# ──────────────────────────────────────────────
# User Accounts
# ──────────────────────────────────────────────
USERS = [
    # Admin (Swinfy)
    {
        "email": "Rocky@swinfy.in",
        "username": "rocky_swinfy",
        "password": "SwinFy@2026!",
        "role": "admin",
        "first_name": "Rocky",
        "last_name": "Swinfy",
        "is_staff": True,
    },
    # UWH Sponsors
    {
        "email": "sponsor@uwh.org",
        "username": "uwh_sponsor",
        "password": "UWH@2026!",
        "role": "sponsor",
        "first_name": "UWH",
        "last_name": "Sponsor",
    },
    {
        "email": "programs@uwh.org",
        "username": "uwh_programs",
        "password": "UWH@2026!",
        "role": "sponsor",
        "first_name": "UWH",
        "last_name": "Programs",
    },
    # Sample Trainers
    {
        "email": "trainer1@swinfy.in",
        "username": "trainer_1",
        "password": "Trainer@2026!",
        "role": "trainer",
        "first_name": "Aisha",
        "last_name": "Khan",
    },
    {
        "email": "trainer2@swinfy.in",
        "username": "trainer_2",
        "password": "Trainer@2026!",
        "role": "trainer",
        "first_name": "Priya",
        "last_name": "Reddy",
    },
    {
        "email": "trainer3@swinfy.in",
        "username": "trainer_3",
        "password": "Trainer@2026!",
        "role": "trainer",
        "first_name": "Fatima",
        "last_name": "Begum",
    },
    {
        "email": "trainer4@swinfy.in",
        "username": "trainer_4",
        "password": "Trainer@2026!",
        "role": "trainer",
        "first_name": "Kavya",
        "last_name": "Sharma",
    },
    {
        "email": "trainer5@swinfy.in",
        "username": "trainer_5",
        "password": "Trainer@2026!",
        "role": "trainer",
        "first_name": "Meena",
        "last_name": "Devi",
    },
]


class Command(BaseCommand):
    help = "Seed database with real TMREIS program data (40 schools, 7 districts, 4-day curriculum, user accounts)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing dashboard data before seeding",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write("Flushing existing data...")
            School.objects.all().delete()
            District.objects.all().delete()
            Curriculum.objects.all().delete()
            UWHControl.objects.all().delete()
            self.stdout.write(self.style.WARNING("  Flushed dashboard data."))

        # 1. Curriculum
        self.stdout.write("Seeding curriculum...")
        for c in CURRICULUM:
            obj, created = Curriculum.objects.update_or_create(
                day_number=c["day_number"],
                defaults={
                    "title": c["title"],
                    "description": c["description"],
                    "learning_objectives": c["learning_objectives"],
                    "activities": c["activities"],
                },
            )
            status = "created" if created else "updated"
            self.stdout.write(f"  Day {c['day_number']}: {c['title']} [{status}]")

        # 2. Districts
        self.stdout.write("Seeding districts...")
        district_map = {}
        for name in DISTRICTS:
            obj, created = District.objects.get_or_create(
                name=name,
                defaults={"state": "Telangana"},
            )
            district_map[name] = obj
            status = "created" if created else "exists"
            self.stdout.write(f"  {name} [{status}]")

        # 3. Schools
        self.stdout.write("Seeding 40 schools...")
        created_count = 0
        for s in SCHOOLS:
            district = district_map[s["district"]]
            _, created = School.objects.get_or_create(
                name=s["name"],
                district=district,
                defaults={
                    "total_students": 57,
                    "total_days": 4,
                },
            )
            if created:
                created_count += 1
        self.stdout.write(f"  {created_count} new schools created, {len(SCHOOLS) - created_count} already existed.")

        # 4. Users
        self.stdout.write("Seeding user accounts...")
        trainers = []
        for u in USERS:
            if User.objects.filter(email=u["email"]).exists():
                user = User.objects.get(email=u["email"])
                self.stdout.write(f"  {u['email']} [{u['role']}] — already exists")
                if u["role"] == "trainer":
                    trainers.append(user)
                continue

            user = User.objects.create_user(
                email=u["email"],
                username=u["username"],
                password=u["password"],
                role=u["role"],
                first_name=u.get("first_name", ""),
                last_name=u.get("last_name", ""),
                is_staff=u.get("is_staff", False),
            )
            self.stdout.write(f"  {u['email']} [{u['role']}] — created")
            if u["role"] == "trainer":
                trainers.append(user)

        # 5. Assign trainers to schools (round-robin)
        if trainers:
            self.stdout.write("Assigning trainers to schools (round-robin)...")
            schools = School.objects.all().order_by("name")
            for i, school in enumerate(schools):
                trainer = trainers[i % len(trainers)]
                school.assigned_trainer = trainer
                school.save(update_fields=["assigned_trainer"])
            self.stdout.write(f"  {schools.count()} schools assigned to {len(trainers)} trainers.")

        # 6. UWH Control singleton
        self.stdout.write("Initializing UWH control panel...")
        UWHControl.objects.get_or_create(
            pk=1,
            defaults={
                "status": "active",
                "status_message": "AI Literacy Program — TMREIS 2026 is live",
                "status_color": "green",
                "financial_summary": {
                    "total_budget": 500000,
                    "spent": 0,
                    "remaining": 500000,
                    "currency": "INR",
                },
            },
        )
        self.stdout.write("  UWH control initialized.")

        # Summary
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("Seed complete!"))
        self.stdout.write(f"  Districts:  {District.objects.count()}")
        self.stdout.write(f"  Schools:    {School.objects.count()}")
        self.stdout.write(f"  Curriculum: {Curriculum.objects.count()} days")
        self.stdout.write(f"  Users:      {User.objects.count()}")
        self.stdout.write(f"  Trainers:   {User.objects.filter(role='trainer').count()}")
        self.stdout.write(self.style.SUCCESS("=" * 50))
