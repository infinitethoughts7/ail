from django.core.management.base import BaseCommand
from django.db.models import Q
from apps.dashboard.models import School, Student
from django.contrib.auth import get_user_model

User = get_user_model()

STUDENTS = [
    ("Aafiya Ishrat", None),
    ("Akhila", 6),
    ("Aliya Parveen", None),
    ("Amna Noor", 4),
    ("Asma Begum", 7),
    ("Falisha Tafeeda", 6),
    ("Fatima Begum", 8),
    ("Hananya Mari", 6),
    ("Iram Anis", 6),
    ("Jannath Fathima", None),
    ("Kathiya Muskan", 6),
    ("Kavya", None),
    ("Keerthi", 7),
    ("G. Kruthika", 7),
    ("Mahek Nazreen", 7),
    ("Mariyam Sulthana", None),
    ("Mercy", None),
    ("Nuha Naaz", 7),
    ("G. Pallavi", 8),
    ("Sai Shreshtra", 7),
    ("Saloni", 8),
    ("Sameera", 7),
    ("Shanvi Sri", 9),
    ("Sidra Begum", 7),
    ("Srivalli", 7),
    ("Tejashwini", 8),
    ("N. Vaishnavi", None),
    ("Varshitha", 5),
    ("Syeda Zainab Rukhsar", 8),
    ("Zareen Khan", 8),
    ("Afiya Jabeen", 9),
    ("Afreen Begum", 7),
    ("Ahamadi Unnisa", 7),
    ("Akshara", 6),
    ("Ameena Begum", 8),
    ("Ashwitha", 7),
    ("Ayesha", None),
    ("Chithra", 7),
    ("Chandrakala", 9),
    ("Fariya", None),
    ("Jahanara", 6),
    ("Juveriya Nazz", 8),
    ("Jyothi", 7),
    ("Kaikasha", 9),
    ("Kaneez", None),
    ("Leena Hassan", None),
    ("Madhumitha", 6),
    ("Mehak", None),
    ("S. Nithya", 9),
    ("Nousheen", 6),
    ("Prathika", 7),
    ("Rafath Kousar", 8),
    ("Riya Tabassum", 8),
    ("Sana", 8),
    ("Sanjeeda", 6),
    ("Srija", 8),
    ("Tejasri", None),
    ("N. Vaishnavi", None),
    ("Zeenath Begum", None),
]


class Command(BaseCommand):
    help = "Seed students for TMREIS Khairatabad Girls 1"

    def handle(self, *args, **options):
        school = School.objects.filter(name__icontains="khairtabad").first()
        if not school:
            school = School.objects.filter(name__icontains="khairatabad").first()
        if not school:
            self.stderr.write(self.style.ERROR(
                "School 'Khairtabad' not found. Please create it first."
            ))
            return

        # Find trainer to use as added_by
        from apps.dashboard.models import TrainerAssignment
        assignment = TrainerAssignment.objects.filter(school=school).select_related("trainer").first()
        trainer = assignment.trainer if assignment else None
        if not trainer:
            trainer = User.objects.filter(role="trainer").first()
            if not trainer:
                trainer = User.objects.filter(role="admin").first()

        if not trainer:
            self.stderr.write(self.style.ERROR("No trainer or admin user found."))
            return

        created = 0
        skipped = 0
        for name, baseline in STUDENTS:
            _, was_created = Student.objects.get_or_create(
                name=name,
                school=school,
                defaults={
                    "added_by": trainer,
                    "baseline_marks": baseline,
                },
            )
            if was_created:
                created += 1
            else:
                skipped += 1

        school.total_students = Student.objects.filter(school=school).count()
        school.save(update_fields=["total_students"])

        self.stdout.write(self.style.SUCCESS(
            f"Done: {created} created, {skipped} already existed. "
            f"School '{school.name}' now has {school.total_students} students."
        ))
