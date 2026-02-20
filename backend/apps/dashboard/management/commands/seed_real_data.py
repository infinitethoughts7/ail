"""
Seed command for AI Literacy Program — TMREIS 2026

Seeds:
  - 4-day curriculum
  - 7 districts
  - 40 schools (from TGMREIS circular) with POC/map data for assigned schools
  - User accounts (admin, sponsors, trainers with ail@2026 password)
  - Trainer-to-school assignments (trainer1 + trainer2 per school)
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
# School assignments with POC, Map, Trainers
# (only schools with confirmed trainer data)
# ──────────────────────────────────────────────
SCHOOL_ASSIGNMENTS = [
    {
        "school_name": "TMREIS Chandrayangutta G-1",
        "poc_name": "Sravanthi",
        "poc_designation": "Librarian",
        "principal_phone": "7995057965",
        "poc_phone": "8179780395",
        "trainer1_email": "sangeethakasipeta05@gmail.com",
        "trainer2_email": None,
        "map_url": "https://maps.app.goo.gl/VVF6hGSWFwZBMVxT7",
        "total_students": 42,
    },
    {
        "school_name": "TMREIS Yakutpura G-2",
        "poc_name": "Sandhya Rani",
        "poc_designation": "Librarian",
        "principal_phone": "7995057907",
        "poc_phone": "9000020606",
        "trainer1_email": None,
        "trainer2_email": "sureshdodde86@gmail.com",
        "map_url": "https://maps.app.goo.gl/RqA4VhNh23mE2brq7",
        "total_students": 36,
    },
    {
        "school_name": "TMREIS Rajendranagar G-1",
        "poc_name": "Shahbaz Nosheen",
        "poc_designation": "PGT Bio Science",
        "principal_phone": "7331170801",
        "poc_phone": "8087287410",
        "trainer1_email": "sathisht.1729@gmail.com",
        "trainer2_email": "prava1729@gmail.com",
        "map_url": "https://maps.app.goo.gl/Lb3mBA9bdiqyvuri7?g_st=aw",
        "total_students": 39,
    },
    {
        "school_name": "TMREIS Mahbubnagar G-1",
        "poc_name": "Mahamuda Begum",
        "poc_designation": "TGT Hindi",
        "principal_phone": "7207998977",
        "poc_phone": "9010903523, 9346952488",
        "trainer1_email": "sankinarmada06@gmail.com",
        "trainer2_email": "parveen.swinfy03@gmail.com",
        "map_url": "https://maps.app.goo.gl/QhXQLsRUDHQ6n4Bf6",
        "total_students": 65,
    },
    {
        "school_name": "TMREIS Sanathnagar G-1",
        "poc_name": "D Deepika",
        "poc_designation": "Jr Assistant",
        "principal_phone": "7995057901",
        "poc_phone": "9390351277",
        "trainer1_email": "ravikirand.swinfy@gmail.com",
        "trainer2_email": "maheshs.swinfy@gmail.com",
        "map_url": "https://maps.app.goo.gl/AHouZPfSNbax51f28?g_st=aw",
        "total_students": 50,
    },
    {
        "school_name": "TMREIS Karimnagar G-1",
        "poc_name": "Irfana Ahmed",
        "poc_designation": "PGT Physical Science",
        "principal_phone": "7331170843",
        "poc_phone": "8121206108",
        "trainer1_email": "sravanikodari9@gmail.com",
        "trainer2_email": "swathiikodam@gmail.com",
        "map_url": "https://maps.google.com/maps?q=18.4604282%2C79.1011746&z=17&hl=en",
        "total_students": 57,
    },
    {
        "school_name": "TMREIS Asifnagar G-2",
        "poc_name": "Saba Maheen",
        "poc_designation": "PGT Bio",
        "principal_phone": "7995057886",
        "poc_phone": "9182052709",
        "trainer1_email": "shivakrishnaa.swinfy@gmail.com",
        "trainer2_email": None,
        "map_url": "https://maps.app.goo.gl/9vqurWkUdc2LCC859?g_st=aw",
        "total_students": 51,
    },
    {
        "school_name": "TMREIS Khairtabad G-1",
        "poc_name": "Hannah Marlin",
        "poc_designation": "PGT English",
        "principal_phone": "7995057984",
        "poc_phone": "8886987575",
        "trainer1_email": "rockyg.swinfy@gmail.com",
        "trainer2_email": "sasvaldas@gmail.com",
        "map_url": "https://maps.app.goo.gl/Wd8ZHs1K33Rs5X3w6",
        "total_students": 68,
    },
    {
        "school_name": "TMREIS Golconda G-1",
        "poc_name": "Radhika",
        "poc_designation": "PGT English",
        "principal_phone": "7331170798",
        "poc_phone": "7989083584",
        "trainer1_email": "sowkyab.swinfy@gmail.com",
        "trainer2_email": "vangoorishirisha2@gmail.com",
        "map_url": "https://maps.app.goo.gl/wT6gwrhAYaeYtD1D8",
        "total_students": 39,
    },
    {
        "school_name": "TMREIS Asifnagar G-1",
        "poc_name": "S N Lakshmi",
        "poc_designation": "PGT English",
        "principal_phone": "7995057986",
        "poc_phone": "9989994396",
        "trainer1_email": "ranig.swinfy@gmail.com",
        "trainer2_email": "bhanuvaldas22@gmail.com",
        "map_url": "https://maps.app.goo.gl/UQqoMziiYPn9doQy8",
        "total_students": 49,
    },
    {
        "school_name": "TMREIS Barkas G-1",
        "poc_name": "Subhashini",
        "poc_designation": "TGT Maths",
        "principal_phone": "7995057884",
        "poc_phone": "7993198193",
        "trainer1_email": "royyamadhavi116@gmail.com",
        "trainer2_email": "manasakosgi07@gmail.com",
        "map_url": "https://maps.app.goo.gl/j5K9WDVv246EjPiu6?g_st=aw",
        "total_students": 70,
    },
    {
        "school_name": "TMREIS Bahadurpura G-2",
        "poc_name": "Anitha Rani",
        "poc_designation": "TGT Hindi",
        "principal_phone": "7995057885",
        "poc_phone": "9000133934",
        "trainer1_email": "mallikaa.swinfy@gmail.com",
        "trainer2_email": None,
        "map_url": "https://maps.app.goo.gl/ZQNcSBCiQ8EYZiuA8",
        "total_students": 42,
    },
    {
        "school_name": "TMREIS Makthal G-1",
        "poc_name": "Mubeena",
        "poc_designation": "PGT English",
        "principal_phone": "7995057970",
        "poc_phone": "9059074261",
        "trainer1_email": "manasaveenamasula@gmail.com",
        "trainer2_email": "laxmiprasanna73374@gmail.com",
        "map_url": "https://maps.app.goo.gl/DWmcRAkzqCHfAyLq7",
        "total_students": 80,
    },
    {
        "school_name": "TMREIS Charminar G-1",
        "poc_name": "Yasaswini",
        "poc_designation": "Jr Assistant",
        "principal_phone": "7207998972",
        "poc_phone": "9346282052",
        "trainer1_email": "rajinikanththatikanti00@gmail.com",
        "trainer2_email": "prasannachandran2001@gmail.com",
        "map_url": "https://maps.app.goo.gl/4NdsY6HD3LUqS9W59?g_st=aw",
        "total_students": 78,
    },
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
    {"email": "sangeethakasipeta05@gmail.com", "username": "sangeetha_k", "first_name": "Sangeetha", "last_name": ""},
    {"email": "sureshdodde86@gmail.com", "username": "suresh", "first_name": "Suresh", "last_name": ""},
    {"email": "sathisht.1729@gmail.com", "username": "sathish", "first_name": "Sathish", "last_name": ""},
    {"email": "prava1729@gmail.com", "username": "pravalika", "first_name": "Pravalika", "last_name": ""},
    {"email": "sankinarmada06@gmail.com", "username": "narmada", "first_name": "Narmada", "last_name": ""},
    {"email": "parveen.swinfy03@gmail.com", "username": "parveen", "first_name": "Parveen", "last_name": ""},
    {"email": "ravikirand.swinfy@gmail.com", "username": "ravi_kiran", "first_name": "Ravi", "last_name": "Kiran"},
    {"email": "maheshs.swinfy@gmail.com", "username": "mahesh", "first_name": "Mahesh", "last_name": ""},
    {"email": "sravanikodari9@gmail.com", "username": "sravani", "first_name": "Sravani", "last_name": ""},
    {"email": "swathiikodam@gmail.com", "username": "swathi", "first_name": "Swathi", "last_name": ""},
    {"email": "shivakrishnaa.swinfy@gmail.com", "username": "shiva_krishna", "first_name": "Shiva", "last_name": "Krishna"},
    {"email": "rockyg.swinfy@gmail.com", "username": "rocky", "first_name": "Rocky", "last_name": ""},
    {"email": "sasvaldas@gmail.com", "username": "ajay_mh", "first_name": "Ajay", "last_name": "MH"},
    {"email": "sowkyab.swinfy@gmail.com", "username": "sowkya", "first_name": "Sowkya", "last_name": ""},
    {"email": "vangoorishirisha2@gmail.com", "username": "sirisha", "first_name": "Sirisha", "last_name": ""},
    {"email": "ranig.swinfy@gmail.com", "username": "rani", "first_name": "Rani", "last_name": ""},
    {"email": "bhanuvaldas22@gmail.com", "username": "bhanu", "first_name": "Bhanu", "last_name": ""},
    {"email": "royyamadhavi116@gmail.com", "username": "madhavi", "first_name": "Madhavi", "last_name": ""},
    {"email": "manasakosgi07@gmail.com", "username": "manasa_kosgi", "first_name": "Manasa", "last_name": "Kosgi"},
    {"email": "mallikaa.swinfy@gmail.com", "username": "mallika", "first_name": "Mallika", "last_name": ""},
    {"email": "manasaveenamasula@gmail.com", "username": "manasa_veena", "first_name": "Manasaveena", "last_name": ""},
    {"email": "laxmiprasanna73374@gmail.com", "username": "laxmi_prasanna", "first_name": "Laxmi", "last_name": "Prasanna"},
    {"email": "rajinikanththatikanti00@gmail.com", "username": "rajinikanth", "first_name": "Rajinikanth", "last_name": ""},
    {"email": "prasannachandran2001@gmail.com", "username": "prasanna", "first_name": "Prasanna", "last_name": ""},
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
                # New user — handle potential username conflicts
                username = t["username"]
                if User.objects.filter(username=username).exists():
                    username = f"{username}_{t['email'].split('@')[0][-4:]}"
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
        for assign in SCHOOL_ASSIGNMENTS:
            try:
                school = School.objects.get(name=assign["school_name"])
            except School.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"  School not found: {assign['school_name']}"
                ))
                continue

            # Update POC and school details
            school.poc_name = assign["poc_name"]
            school.poc_designation = assign["poc_designation"]
            school.poc_phone = assign["poc_phone"]
            school.principal_phone = assign["principal_phone"]
            school.map_url = assign["map_url"]
            school.total_students = assign["total_students"]

            # Assign trainer 1
            t1_email = assign.get("trainer1_email")
            if t1_email and t1_email in trainer_map:
                school.assigned_trainer = trainer_map[t1_email]

            # Assign trainer 2
            t2_email = assign.get("trainer2_email")
            if t2_email and t2_email in trainer_map:
                school.second_trainer = trainer_map[t2_email]

            school.save()
            t1_name = trainer_map[t1_email].first_name if t1_email and t1_email in trainer_map else "—"
            t2_name = trainer_map[t2_email].first_name if t2_email and t2_email in trainer_map else "—"
            self.stdout.write(
                f"  {school.name}: T1={t1_name}, T2={t2_name}, POC={assign['poc_name']}"
            )

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
