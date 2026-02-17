"""
Seed command for AI Literacy Program — TMREIS 2026

Seeds:
  - 4-day curriculum
  - 7 districts
  - 40 schools (from TGMREIS circular)
  - User accounts (admin, sponsors, 29 real trainers)
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
    "Ranga Reddy",
    "Medchal",
    "Karimnagar",
    "Mahbubnagar",
    "Peddapally",
    "Narayanpet",
]

# ──────────────────────────────────────────────
# 40 Schools — mapped to districts (from TGMREIS Circular)
# ──────────────────────────────────────────────
SCHOOLS = [
    # Hyderabad (19)
    {"name": "TMREIS Bahadurpura G-1", "district": "Hyderabad"},
    {"name": "TMREIS Bahadurpura G-2", "district": "Hyderabad"},
    {"name": "TMREIS Barkas G-1", "district": "Hyderabad"},
    {"name": "TMREIS Chandrayangutta G-1", "district": "Hyderabad"},
    {"name": "TMREIS Charminar G-1", "district": "Hyderabad"},
    {"name": "TMREIS Charminar G-2", "district": "Hyderabad"},
    {"name": "TMREIS Saidabad G-1", "district": "Hyderabad"},
    {"name": "TMREIS Yakutpura G-1", "district": "Hyderabad"},
    {"name": "TMREIS Yakutpura G-2", "district": "Hyderabad"},
    {"name": "TMREIS Asifnagar G-1", "district": "Hyderabad"},
    {"name": "TMREIS Asifnagar G-2", "district": "Hyderabad"},
    {"name": "TMREIS Goshamahal G-1", "district": "Hyderabad"},
    {"name": "TMREIS Golconda G-1", "district": "Hyderabad"},
    {"name": "TMREIS Golconda G-2", "district": "Hyderabad"},
    {"name": "TMREIS Jubilee Hills G-1", "district": "Hyderabad"},
    {"name": "TMREIS Khairtabad G-1", "district": "Hyderabad"},
    {"name": "TMREIS Musheerabad G-1", "district": "Hyderabad"},
    {"name": "TMREIS Sanathnagar G-1", "district": "Hyderabad"},
    {"name": "TMREIS Secunderabad G-1", "district": "Hyderabad"},
    # Ranga Reddy (5)
    {"name": "TMREIS Rajendranagar G-1", "district": "Ranga Reddy"},
    {"name": "TMREIS Hayathnagar Girls-1", "district": "Ranga Reddy"},
    {"name": "TMREIS Ibrahimpatnam G-1", "district": "Ranga Reddy"},
    {"name": "TMREIS Farooqnagar Girls-1", "district": "Ranga Reddy"},
    {"name": "TMREIS Moinabad Girls-1", "district": "Ranga Reddy"},
    # Medchal (5)
    {"name": "TMREIS Balanagar Girls-1", "district": "Medchal"},
    {"name": "TMREIS Qutbullapur Girls-1", "district": "Medchal"},
    {"name": "TMREIS Medchal Girls-1", "district": "Medchal"},
    {"name": "TMREIS Uppal Girls-1", "district": "Medchal"},
    {"name": "TMREIS Malkajgiri Girls-1", "district": "Medchal"},
    # Karimnagar (4)
    {"name": "TMREIS Karimnagar G-1", "district": "Karimnagar"},
    {"name": "TMREIS Karimnagar G-2", "district": "Karimnagar"},
    {"name": "TMREIS Choppadandi G-1", "district": "Karimnagar"},
    {"name": "TMREIS Jammikunta G-1", "district": "Karimnagar"},
    # Mahbubnagar (4)
    {"name": "TMREIS Mahbubnagar G-1", "district": "Mahbubnagar"},
    {"name": "TMREIS Mahbubnagar G-2", "district": "Mahbubnagar"},
    {"name": "TMREIS Mahbubnagar G-3", "district": "Mahbubnagar"},
    {"name": "TMREIS Jadcherla G-1", "district": "Mahbubnagar"},
    # Peddapally (2)
    {"name": "TMREIS Peddapalli G-1", "district": "Peddapally"},
    {"name": "TMREIS Manthani G-1", "district": "Peddapally"},
    # Narayanpet (1)
    {"name": "TMREIS Makthal G-1", "district": "Narayanpet"},
]

# ──────────────────────────────────────────────
# User Accounts
# ──────────────────────────────────────────────
USERS = [
    # Admin (Swinfy)
    {
        "email": "rakesh.ganji@swinfy.com",
        "username": "rakesh_swinfy",
        "password": "1234",
        "role": "admin",
        "first_name": "Rakesh",
        "last_name": "Ganji",
        "is_staff": True,
    },
    # UWH Sponsors
    {
        "email": "sponsor@uwh.org",
        "username": "uwh_sponsor",
        "password": "1234",
        "role": "sponsor",
        "first_name": "UWH",
        "last_name": "Sponsor",
    },
    {
        "email": "programs@uwh.org",
        "username": "uwh_programs",
        "password": "1234",
        "role": "sponsor",
        "first_name": "UWH",
        "last_name": "Programs",
    },
    # Real Trainers (29 with emails)
    {"email": "sathisht.1729@gmail.com", "username": "satish", "password": "1234", "role": "trainer", "first_name": "Satish", "last_name": ""},
    {"email": "rockyg.swinfy@gmail.com", "username": "rocky", "password": "1234", "role": "trainer", "first_name": "Rocky", "last_name": ""},
    {"email": "sridherddd@gmail.com", "username": "sridhar", "password": "1234", "role": "trainer", "first_name": "Sridhar", "last_name": ""},
    {"email": "ranig.swinfy@gmail.com", "username": "rani", "password": "1234", "role": "trainer", "first_name": "Rani", "last_name": ""},
    {"email": "sowkyab.swinfy@gmail.com", "username": "sowkya", "password": "1234", "role": "trainer", "first_name": "Sowkya", "last_name": ""},
    {"email": "shireesha454@gmail.com", "username": "shirisha_k", "password": "1234", "role": "trainer", "first_name": "Shirisha", "last_name": "K"},
    {"email": "prava1729@gmail.com", "username": "pravalika", "password": "1234", "role": "trainer", "first_name": "Pravalika", "last_name": ""},
    {"email": "deepika.swinfy@gmail.com", "username": "deepika", "password": "1234", "role": "trainer", "first_name": "Deepika", "last_name": ""},
    {"email": "sumasriv.swinfy@gmail.com", "username": "suma_sri", "password": "1234", "role": "trainer", "first_name": "Suma", "last_name": "Sri"},
    {"email": "mallikaa.swinfy@gmail.com", "username": "mallika", "password": "1234", "role": "trainer", "first_name": "Mallika", "last_name": ""},
    {"email": "bhanuvaldas22@gmail.com", "username": "bhanu", "password": "1234", "role": "trainer", "first_name": "Bhanu", "last_name": ""},
    {"email": "maheshs.swinfy@gmail.com", "username": "mahesh", "password": "1234", "role": "trainer", "first_name": "Mahesh", "last_name": ""},
    {"email": "shivakrishnaa.swinfy@gmail.com", "username": "shiva_krishna", "password": "1234", "role": "trainer", "first_name": "Shiva", "last_name": "Krishna"},
    {"email": "ravikirand.swinfy@gmail.com", "username": "ravi_kiran", "password": "1234", "role": "trainer", "first_name": "Ravi", "last_name": "Kiran"},
    {"email": "narmadas.swinfy@gmail.com", "username": "narmada", "password": "1234", "role": "trainer", "first_name": "Narmada", "last_name": ""},
    {"email": "rajinikanththatikanti00@gmail.com", "username": "rajinikanth", "password": "1234", "role": "trainer", "first_name": "Rajinikanth", "last_name": ""},
    {"email": "parveen.swinfy03@gmail.com", "username": "parveen", "password": "1234", "role": "trainer", "first_name": "Parveen", "last_name": ""},
    {"email": "sangeethak.swinfy@gmail.com", "username": "sangeetha", "password": "1234", "role": "trainer", "first_name": "Sangeetha", "last_name": ""},
    {"email": "manasaveenamasula@gmail.com", "username": "manasa_veena", "password": "1234", "role": "trainer", "first_name": "Manasa", "last_name": "Veena"},
    {"email": "laxmiprasannamadduri@gmail.com", "username": "m_laxmi_prasanna", "password": "1234", "role": "trainer", "first_name": "M Laxmi", "last_name": "Prasanna"},
    {"email": "mandadianitha14@gmail.com", "username": "anitha", "password": "1234", "role": "trainer", "first_name": "Anitha", "last_name": ""},
    {"email": "harikakothapally1919@gmail.com", "username": "harika", "password": "1234", "role": "trainer", "first_name": "Harika", "last_name": ""},
    {"email": "chukkaashwitha1706@gmail.com", "username": "ashwitha", "password": "1234", "role": "trainer", "first_name": "Ashwitha", "last_name": ""},
    {"email": "vangoorishirisha2@gmail.com", "username": "sirisha_askes", "password": "1234", "role": "trainer", "first_name": "Sirisha", "last_name": ""},
    {"email": "saniyanaseer2024@gmail.com", "username": "saniya", "password": "1234", "role": "trainer", "first_name": "Saniya", "last_name": ""},
    {"email": "akshayram118@gmail.com", "username": "akshay", "password": "1234", "role": "trainer", "first_name": "Akshay", "last_name": ""},
    {"email": "indupriya23700@gmail.com", "username": "indupriya", "password": "1234", "role": "trainer", "first_name": "Indupriya", "last_name": ""},
    {"email": "prasannachandran2001@gmail.com", "username": "prasanna", "password": "1234", "role": "trainer", "first_name": "Prasanna", "last_name": ""},
    {"email": "manasakosgi07@gmail.com", "username": "manasa", "password": "1234", "role": "trainer", "first_name": "Manasa", "last_name": ""},
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
            User.objects.filter(role="trainer").delete()
            self.stdout.write(self.style.WARNING("  Flushed dashboard data + trainers."))

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

        # 5. Assign trainers to schools (1:1, extras left empty)
        if trainers:
            self.stdout.write("Assigning trainers to schools...")
            schools = School.objects.all().order_by("name")
            for i, school in enumerate(schools):
                if i < len(trainers):
                    school.assigned_trainer = trainers[i]
                    school.save(update_fields=["assigned_trainer"])
            unassigned = schools.count() - len(trainers)
            self.stdout.write(f"  {len(trainers)} schools assigned, {unassigned} without a trainer.")

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
