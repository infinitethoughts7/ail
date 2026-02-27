"""
Seed command for AI Literacy Program — TMREIS 2026

Seeds:
  - 4-day curriculum
  - 7 districts
  - 40 schools (from TGMREIS circular) with POC/map data for assigned schools
  - User accounts (admin, sponsors, trainers with ail@2026 password)
  - Trainer-to-school assignments (each trainer individually mapped to a school)
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
    TrainerAssignment,
    UWHControl,
)

# ──────────────────────────────────────────────
# 4-Day Curriculum
# ──────────────────────────────────────────────
CURRICULUM = [
    {
        "day_number": 1,
        "title": "Foundations of Computers & Introduction to AI",
        "description": "Students learned complete computer fundamentals — hardware, software, and how computers work — followed by an introduction to Artificial Intelligence with real-life examples they encounter daily.",
        "learning_objectives": [
            "Understand computer hardware components — CPU, RAM, storage, input/output devices",
            "Learn the difference between system software and application software",
            "Understand what Artificial Intelligence is and how it works",
            "Identify real-life AI applications — voice assistants, recommendation systems, face unlock, Google Maps",
        ],
        "activities": [
            "Computer parts identification — hands-on with real hardware components",
            "Software vs Hardware sorting activity",
            "AI in real life — students identified and discussed AI they use daily",
            "Interactive Q&A — students asked questions about AI around them",
        ],
    },
    {
        "day_number": 2,
        "title": "Creative AI – Prompting & Content Creation, Image generation, Story and Lyric writing",
        "description": "Students explored the art of prompting AI tools for creative content creation — generating images, writing stories, composing lyrics, and producing engaging content using AI-powered platforms.",
        "learning_objectives": [
            "Master effective prompting techniques for AI tools",
            "Generate creative images using AI image generation tools",
            "Write stories and narratives with AI assistance",
            "Compose song lyrics and creative content using AI prompts",
        ],
        "activities": [
            "Prompt engineering workshop — crafting effective AI prompts",
            "AI image generation — students created artwork using text prompts",
            "Story writing with AI — collaborative storytelling using AI tools",
            "Lyric writing challenge — composing original song lyrics with AI assistance",
        ],
    },
    {
        "day_number": 3,
        "title": "Building with AI – Design & website Development and Game designing",
        "description": "Students used AI-powered tools to design user interfaces, build websites, and create interactive games — turning their ideas into real digital products.",
        "learning_objectives": [
            "Design user interfaces and layouts using AI design tools",
            "Build functional websites with AI-assisted development",
            "Create interactive games using AI-powered game design platforms",
            "Collaborate in teams to bring digital ideas to life",
        ],
        "activities": [
            "UI/UX design session — creating app and website layouts with AI",
            "Website building workshop — students built their own web pages",
            "Game design challenge — designing and building interactive games",
            "Team collaboration — working in groups to build digital projects",
        ],
    },
    {
        "day_number": 4,
        "title": "Responsible AI & Career Pathways",
        "description": "Students learned about responsible and ethical AI usage, explored future career opportunities in AI and technology, and developed and deployed their group projects.",
        "learning_objectives": [
            "Understand responsible AI usage — privacy, bias, and ethical considerations",
            "Explore career pathways in AI, data science, and technology",
            "Develop and deploy group projects as a team",
            "Reflect on the 4-day AI learning journey and key takeaways",
        ],
        "activities": [
            "Responsible AI discussion — ethics, bias, and safe AI usage",
            "Career pathways exploration — AI/tech careers and opportunities",
            "Group project development — students built and deployed their team projects",
            "Project deployment — teams published their projects live",
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
# Trainer → School assignments (one entry per trainer)
# Two trainers at the same school = two entries with same school details
# ──────────────────────────────────────────────
TRAINER_SCHOOL_MAP = [
    # Chandrayangutta G-1 (1 trainer)
    {"trainer_email": "sangeethakasipeta05@gmail.com", "school_name": "TMREIS Chandrayangutta G-1", "poc_name": "Sravanthi", "poc_designation": "Librarian", "principal_phone": "7995057965", "poc_phone": "8179780395", "map_url": "https://maps.app.goo.gl/VVF6hGSWFwZBMVxT7", "total_students": 42},
    # Yakutpura G-2 (1 trainer)
    {"trainer_email": "sureshdodde86@gmail.com", "school_name": "TMREIS Yakutpura G-2", "poc_name": "Sandhya Rani", "poc_designation": "Librarian", "principal_phone": "7995057907", "poc_phone": "9000020606", "map_url": "https://maps.app.goo.gl/RqA4VhNh23mE2brq7", "total_students": 36},
    # Rajendranagar G-1 (2 trainers)
    {"trainer_email": "sathisht.1729@gmail.com", "school_name": "TMREIS Rajendranagar G-1", "poc_name": "Shahbaz Nosheen", "poc_designation": "PGT Bio Science", "principal_phone": "7331170801", "poc_phone": "8087287410", "map_url": "https://maps.app.goo.gl/Lb3mBA9bdiqyvuri7?g_st=aw", "total_students": 39},
    {"trainer_email": "prava1729@gmail.com", "school_name": "TMREIS Rajendranagar G-1", "poc_name": "Shahbaz Nosheen", "poc_designation": "PGT Bio Science", "principal_phone": "7331170801", "poc_phone": "8087287410", "map_url": "https://maps.app.goo.gl/Lb3mBA9bdiqyvuri7?g_st=aw", "total_students": 39},
    # Mahbubnagar G-1 (2 trainers)
    {"trainer_email": "sankinarmada06@gmail.com", "school_name": "TMREIS Mahbubnagar G-1", "poc_name": "Mahamuda Begum", "poc_designation": "TGT Hindi", "principal_phone": "7207998977", "poc_phone": "9010903523, 9346952488", "map_url": "https://maps.app.goo.gl/QhXQLsRUDHQ6n4Bf6", "total_students": 65},
    {"trainer_email": "parveen.swinfy03@gmail.com", "school_name": "TMREIS Mahbubnagar G-1", "poc_name": "Mahamuda Begum", "poc_designation": "TGT Hindi", "principal_phone": "7207998977", "poc_phone": "9010903523, 9346952488", "map_url": "https://maps.app.goo.gl/QhXQLsRUDHQ6n4Bf6", "total_students": 65},
    # Karimnagar G-1 (2 trainers)
    {"trainer_email": "sravanikodari9@gmail.com", "school_name": "TMREIS Karimnagar G-1", "poc_name": "Irfana Ahmed", "poc_designation": "PGT Physical Science", "principal_phone": "7331170843", "poc_phone": "8121206108", "map_url": "https://maps.google.com/maps?q=18.4604282%2C79.1011746&z=17&hl=en", "total_students": 57},
    {"trainer_email": "swathiikodam@gmail.com", "school_name": "TMREIS Karimnagar G-1", "poc_name": "Irfana Ahmed", "poc_designation": "PGT Physical Science", "principal_phone": "7331170843", "poc_phone": "8121206108", "map_url": "https://maps.google.com/maps?q=18.4604282%2C79.1011746&z=17&hl=en", "total_students": 57},
    # Asifnagar G-2 (1 trainer)
    {"trainer_email": "shivakrishnaa.swinfy@gmail.com", "school_name": "TMREIS Asifnagar G-2", "poc_name": "Saba Maheen", "poc_designation": "PGT Bio", "principal_phone": "7995057886", "poc_phone": "9182052709", "map_url": "https://maps.app.goo.gl/9vqurWkUdc2LCC859?g_st=aw", "total_students": 51},
    # Khairtabad G-1 (2 trainers)
    {"trainer_email": "rockyg.swinfy@gmail.com", "school_name": "TMREIS Khairtabad G-1", "poc_name": "Hannah Marlin", "poc_designation": "PGT English", "principal_phone": "7995057984", "poc_phone": "8886987575", "map_url": "https://maps.app.goo.gl/Wd8ZHs1K33Rs5X3w6", "total_students": 68},
    {"trainer_email": "sasvaldas@gmail.com", "school_name": "TMREIS Khairtabad G-1", "poc_name": "Hannah Marlin", "poc_designation": "PGT English", "principal_phone": "7995057984", "poc_phone": "8886987575", "map_url": "https://maps.app.goo.gl/Wd8ZHs1K33Rs5X3w6", "total_students": 68},
    # Yakutpura G-1 (Rocky's second school — Phase 2)
    {"trainer_email": "rockyg.swinfy@gmail.com", "school_name": "TMREIS Yakutpura G-1", "poc_name": "", "poc_designation": "", "principal_phone": "", "poc_phone": "9059420912", "map_url": "", "total_students": 0},
    # Golconda G-1 (2 trainers)
    {"trainer_email": "sowkyab.swinfy@gmail.com", "school_name": "TMREIS Golconda G-1", "poc_name": "Radhika", "poc_designation": "PGT English", "principal_phone": "7331170798", "poc_phone": "7989083584", "map_url": "https://maps.app.goo.gl/wT6gwrhAYaeYtD1D8", "total_students": 39},
    {"trainer_email": "vangoorishirisha2@gmail.com", "school_name": "TMREIS Golconda G-1", "poc_name": "Radhika", "poc_designation": "PGT English", "principal_phone": "7331170798", "poc_phone": "7989083584", "map_url": "https://maps.app.goo.gl/wT6gwrhAYaeYtD1D8", "total_students": 39},
    # Asifnagar G-1 (2 trainers)
    {"trainer_email": "ranig.swinfy@gmail.com", "school_name": "TMREIS Asifnagar G-1", "poc_name": "S N Lakshmi", "poc_designation": "PGT English", "principal_phone": "7995057986", "poc_phone": "9989994396", "map_url": "https://maps.app.goo.gl/UQqoMziiYPn9doQy8", "total_students": 49},
    {"trainer_email": "bhanuvaldas22@gmail.com", "school_name": "TMREIS Asifnagar G-1", "poc_name": "S N Lakshmi", "poc_designation": "PGT English", "principal_phone": "7995057986", "poc_phone": "9989994396", "map_url": "https://maps.app.goo.gl/UQqoMziiYPn9doQy8", "total_students": 49},
    # Barkas G-1 (2 trainers)
    {"trainer_email": "royyamadhavi116@gmail.com", "school_name": "TMREIS Barkas G-1", "poc_name": "Subhashini", "poc_designation": "TGT Maths", "principal_phone": "7995057884", "poc_phone": "7993198193", "map_url": "https://maps.app.goo.gl/j5K9WDVv246EjPiu6?g_st=aw", "total_students": 70},
    {"trainer_email": "manasakosgi07@gmail.com", "school_name": "TMREIS Barkas G-1", "poc_name": "Subhashini", "poc_designation": "TGT Maths", "principal_phone": "7995057884", "poc_phone": "7993198193", "map_url": "https://maps.app.goo.gl/j5K9WDVv246EjPiu6?g_st=aw", "total_students": 70},
    # Bahadurpura G-2 (2 trainers)
    {"trainer_email": "mallikaa.swinfy@gmail.com", "school_name": "TMREIS Bahadurpura G-2", "poc_name": "Anitha Rani", "poc_designation": "TGT Hindi", "principal_phone": "7995057885", "poc_phone": "9000133934", "map_url": "https://maps.app.goo.gl/ZQNcSBCiQ8EYZiuA8", "total_students": 42},
    {"trainer_email": "ravikirand.swinfy@gmail.com", "school_name": "TMREIS Bahadurpura G-2", "poc_name": "Anitha Rani", "poc_designation": "TGT Hindi", "principal_phone": "7995057885", "poc_phone": "9000133934", "map_url": "https://maps.app.goo.gl/ZQNcSBCiQ8EYZiuA8", "total_students": 42},
    # Makthal G-1 (2 trainers)
    {"trainer_email": "manasaveenamasula@gmail.com", "school_name": "TMREIS Makthal G-1", "poc_name": "Mubeena", "poc_designation": "PGT English", "principal_phone": "7995057970", "poc_phone": "9059074261", "map_url": "https://maps.app.goo.gl/DWmcRAkzqCHfAyLq7", "total_students": 80},
    {"trainer_email": "laxmiprasanna73374@gmail.com", "school_name": "TMREIS Makthal G-1", "poc_name": "Mubeena", "poc_designation": "PGT English", "principal_phone": "7995057970", "poc_phone": "9059074261", "map_url": "https://maps.app.goo.gl/DWmcRAkzqCHfAyLq7", "total_students": 80},
    # Charminar G-1 (2 trainers)
    {"trainer_email": "maheshs.swinfy@gmail.com", "school_name": "TMREIS Charminar G-1", "poc_name": "Yasaswini", "poc_designation": "Jr Assistant", "principal_phone": "7207998972", "poc_phone": "9346282052", "map_url": "https://maps.app.goo.gl/4NdsY6HD3LUqS9W59?g_st=aw", "total_students": 78},
    {"trainer_email": "prasannachandran2001@gmail.com", "school_name": "TMREIS Charminar G-1", "poc_name": "Yasaswini", "poc_designation": "Jr Assistant", "principal_phone": "7207998972", "poc_phone": "9346282052", "map_url": "https://maps.app.goo.gl/4NdsY6HD3LUqS9W59?g_st=aw", "total_students": 78},
    # Sanathnagar G-1 (no trainers assigned yet — POC data only)
    {"trainer_email": None, "school_name": "TMREIS Sanathnagar G-1", "poc_name": "D Deepika", "poc_designation": "Jr Assistant", "principal_phone": "7995057901", "poc_phone": "9390351277", "map_url": "https://maps.app.goo.gl/AHouZPfSNbax51f28?g_st=aw", "total_students": 50},
]

# ──────────────────────────────────────────────
# User Accounts — all trainers get password ail@2026
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
]

# All trainers with password ail@2026
TRAINERS = [
    {"email": "sangeethakasipeta05@gmail.com", "first_name": "Sangeetha", "last_name": ""},
    {"email": "sureshdodde86@gmail.com", "first_name": "Suresh", "last_name": ""},
    {"email": "sathisht.1729@gmail.com", "first_name": "Sathish", "last_name": ""},
    {"email": "prava1729@gmail.com", "first_name": "Pravalika", "last_name": ""},
    {"email": "sankinarmada06@gmail.com", "first_name": "Narmada", "last_name": ""},
    {"email": "parveen.swinfy03@gmail.com", "first_name": "Parveen", "last_name": ""},
    {"email": "ravikirand.swinfy@gmail.com", "first_name": "Ravi", "last_name": "Kiran"},
    {"email": "maheshs.swinfy@gmail.com", "first_name": "Mahesh", "last_name": ""},
    {"email": "sravanikodari9@gmail.com", "first_name": "Sravani", "last_name": ""},
    {"email": "swathiikodam@gmail.com", "first_name": "Swathi", "last_name": ""},
    {"email": "shivakrishnaa.swinfy@gmail.com", "first_name": "Shiva", "last_name": "Krishna"},
    {"email": "rockyg.swinfy@gmail.com", "first_name": "Rocky", "last_name": ""},
    {"email": "sasvaldas@gmail.com", "first_name": "Ajay", "last_name": "MH"},
    {"email": "sowkyab.swinfy@gmail.com", "first_name": "Sowkya", "last_name": ""},
    {"email": "vangoorishirisha2@gmail.com", "first_name": "Sirisha", "last_name": ""},
    {"email": "ranig.swinfy@gmail.com", "first_name": "Rani", "last_name": ""},
    {"email": "bhanuvaldas22@gmail.com", "first_name": "Bhanu", "last_name": ""},
    {"email": "royyamadhavi116@gmail.com", "first_name": "Madhavi", "last_name": ""},
    {"email": "manasakosgi07@gmail.com", "first_name": "Manasa", "last_name": "Kosgi"},
    {"email": "mallikaa.swinfy@gmail.com", "first_name": "Mallika", "last_name": ""},
    {"email": "manasaveenamasula@gmail.com", "first_name": "Manasaveena", "last_name": ""},
    {"email": "laxmiprasanna73374@gmail.com", "first_name": "Laxmi", "last_name": "Prasanna"},
    {"email": "rajinikanththatikanti00@gmail.com", "first_name": "Rajinikanth", "last_name": ""},
    {"email": "prasannachandran2001@gmail.com", "first_name": "Prasanna", "last_name": ""},
]

TRAINER_PASSWORD = "ail@2026"


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

        # 4. Admin & Sponsor Users
        self.stdout.write("Seeding admin & sponsor accounts...")
        for u in USERS:
            if User.objects.filter(email=u["email"]).exists():
                self.stdout.write(f"  {u['email']} [{u['role']}] — already exists")
                continue
            User.objects.create_user(
                email=u["email"],
                username=u["username"],
                password=u["password"],
                role=u["role"],
                first_name=u.get("first_name", ""),
                last_name=u.get("last_name", ""),
                is_staff=u.get("is_staff", False),
            )
            self.stdout.write(f"  {u['email']} [{u['role']}] — created")

        # 5. Trainer Accounts (all with ail@2026 password)
        self.stdout.write("Seeding trainer accounts (password: ail@2026)...")
        trainer_map = {}  # email -> User
        for t in TRAINERS:
            user = User.objects.filter(email=t["email"]).first()
            if user:
                # Existing user — update password and details
                user.set_password(TRAINER_PASSWORD)
                user.role = "trainer"
                user.first_name = t["first_name"]
                user.last_name = t["last_name"]
                user.save()
                trainer_map[t["email"]] = user
                self.stdout.write(f"  {t['email']} ({t['first_name']}) [updated]")
            else:
                # New user — derive username from email
                username = t["email"].split("@")[0]
                if User.objects.filter(username=username).exists():
                    username = f"{username}_{User.objects.count()}"
                user = User.objects.create_user(
                    email=t["email"],
                    username=username,
                    password=TRAINER_PASSWORD,
                    role="trainer",
                    first_name=t["first_name"],
                    last_name=t["last_name"],
                )
                trainer_map[t["email"]] = user
                self.stdout.write(f"  {t['email']} ({t['first_name']}) [created]")

        # 6. Assign trainers to schools + update POC/map data
        self.stdout.write("Assigning trainers and updating school details...")

        # Group trainers by school (preserving order: first = assigned, second = second_trainer)
        from collections import OrderedDict
        school_trainers = OrderedDict()  # school_name -> [trainer_emails]
        school_details = {}  # school_name -> POC/map details

        for entry in TRAINER_SCHOOL_MAP:
            sname = entry["school_name"]
            school_details[sname] = entry
            if sname not in school_trainers:
                school_trainers[sname] = []
            if entry["trainer_email"]:
                school_trainers[sname].append(entry["trainer_email"])

        for sname, trainer_emails in school_trainers.items():
            try:
                school = School.objects.get(name=sname)
            except School.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"  School not found: {sname}"))
                continue

            details = school_details[sname]
            school.poc_name = details["poc_name"]
            school.poc_designation = details["poc_designation"]
            school.poc_phone = details["poc_phone"]
            school.principal_phone = details["principal_phone"]
            school.map_url = details["map_url"]
            school.total_students = details["total_students"]
            school.save()

            # Create TrainerAssignment entries
            for i, email in enumerate(trainer_emails):
                trainer_user = trainer_map.get(email)
                if trainer_user:
                    role = "primary" if i == 0 else "secondary"
                    TrainerAssignment.objects.get_or_create(
                        trainer=trainer_user,
                        school=school,
                        defaults={"role": role},
                    )

            t1 = trainer_map[trainer_emails[0]].first_name if len(trainer_emails) > 0 and trainer_emails[0] in trainer_map else "—"
            t2 = trainer_map[trainer_emails[1]].first_name if len(trainer_emails) > 1 and trainer_emails[1] in trainer_map else "—"
            self.stdout.write(f"  {sname}: T1={t1}, T2={t2}, POC={details['poc_name']}")

        # 7. UWH Control singleton
        self.stdout.write("Initializing UWH control panel...")
        UWHControl.objects.get_or_create(
            pk=1,
            defaults={
                "status": "active",
                "status_message": "AI Literacy Program — TMREIS 2026 is live",
                "status_color": "green",
                "financial_summary": {},
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
