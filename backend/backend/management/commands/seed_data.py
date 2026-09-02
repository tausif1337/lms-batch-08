"""Fill the database with a whole working LMS: staff, students, courses,
lessons, assignments, hand-ins and marks.

Development only. Every account shares one password, so pointing this at
anything but a local database hands out working logins to whoever has read
this file.

By default it clears the existing rows first, which is what makes a run
repeatable: the same --seed gives the same database every time. Pass
--no-wipe to add this data on top of whatever is already there.

    python manage.py seed_data
    python manage.py seed_data --students 200 --seed 7
    python manage.py seed_data --no-wipe
"""

import argparse
import random
from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from backend.models import (
    Assignment,
    Course,
    Enrollment,
    Lesson,
    Profile,
    Results,
    Student,
    Submission,
    Teacher,
)

DEFAULT_PASSWORD = "Ostad@2026"

# Reserved domains (RFC 2606), so no seeded address can reach a real inbox.
STAFF_DOMAIN = "ostad.example.com"
STUDENT_DOMAIN = "student.example.com"


# --- the three logins you are expected to sign in with -----------------------
# Fixed phone numbers, because the phone is the login handle and a demo is no
# use if the handle changes on every run. These match seed_demo, so that
# command still resets the same three accounts.

FIXED_ACCOUNTS = {
    "admin": {
        "username": "demo_admin",
        "phone": "01700000010",
        "first_name": "Demo",
        "last_name": "Admin",
        "email": f"demo.admin@{STAFF_DOMAIN}",
    },
    "teacher": {
        "username": "demo_teacher",
        "phone": "01700000011",
        "first_name": "Demo",
        "last_name": "Teacher",
        "email": f"demo.teacher@{STAFF_DOMAIN}",
        "subject": "Web Development",
    },
    "student": {
        "username": "demo_student",
        "phone": "01700000012",
        "first_name": "Demo",
        "last_name": "Student",
        "email": f"demo.student@{STUDENT_DOMAIN}",
    },
}

EXTRA_ADMINS = [
    ("Ayesha", "Siddika", "Programme Manager"),
    ("Naimur", "Rahman", "Support Lead"),
]

TEACHER_SPECS = [
    ("Kamrul", "Hasan", "Web Development"),
    ("Nusrat", "Jahan", "Web Development"),
    ("Sabbir", "Ahmed", "Programming"),
    ("Rezaul", "Karim", "Programming"),
    ("Tasnim", "Ara", "Data Science"),
    ("Imran", "Chowdhury", "Data Science"),
    ("Maliha", "Chowdhury", "Design"),
    ("Anika", "Tabassum", "Design"),
    ("Farhan", "Islam", "Marketing"),
    ("Sharmin", "Akter", "Language"),
    ("Tanvir", "Rahman", "Mobile Development"),
    ("Mehedi", "Hasan", "Cyber Security"),
    ("Sanjida", "Sultana", "Business"),
    ("Rakibul", "Alam", "Multimedia"),
    ("Ovi", "Barua", "Multimedia"),
    ("Israt", "Ferdous", "Language"),
]

FIRST_NAMES = [
    "Abdullah", "Rakib", "Tanvir", "Sakib", "Nayeem", "Imran", "Fahim", "Arif",
    "Mahmudul", "Rasel", "Shakil", "Jubayer", "Sabbir", "Mizanur", "Hasibul",
    "Ridwan", "Naimur", "Tanzim", "Asif", "Farhan", "Shafiqul", "Anisur",
    "Rafiul", "Mehedi", "Sadman", "Zubair", "Rohan", "Tahmid", "Nafis",
    "Ashraful", "Ayesha", "Nusrat", "Tasnim", "Sadia", "Farhana", "Sumaiya",
    "Jannatul", "Mim", "Sharmin", "Rubaiya", "Israt", "Maliha", "Afsana",
    "Nabila", "Tanzila", "Sanjida", "Lamia", "Raisa", "Sabrina", "Fatema",
    "Mariam", "Shanta", "Anika", "Meherun", "Tahmina", "Zarin", "Noshin",
    "Priyanka", "Sumon", "Ovi",
]

LAST_NAMES = [
    "Rahman", "Hossain", "Islam", "Ahmed", "Chowdhury", "Karim", "Sultana",
    "Akter", "Khan", "Mia", "Sarkar", "Das", "Roy", "Bhuiyan", "Talukder",
    "Siddique", "Mahmud", "Alam", "Haque", "Uddin", "Molla", "Sheikh",
    "Barua", "Podder", "Nandi", "Saha", "Kabir", "Nasrin", "Jahan", "Ferdous",
]

# --- the catalogue -----------------------------------------------------------
# Real-looking curricula: the lesson list for each course is the order a
# teacher would actually teach it in, which is what makes the assignment due
# dates further down line up week by week.

COURSE_CATALOG = [
    {
        "title": "Full-Stack Web Development with Django",
        "subject": "Web Development",
        "description": (
            "Build and ship a complete Django application, from a bare virtual "
            "environment to a REST API running on your own server. Assumes you "
            "can already write basic Python."
        ),
        "lessons": [
            ("Setting Up Python and Virtual Environments",
             "Install Python, create an isolated environment per project, and understand why global installs cause trouble later."),
            ("Django Project Structure and URL Routing",
             "What startproject and startapp actually create, and how a request finds its way from the URL to a view."),
            ("Models, Migrations and the ORM",
             "Describe your tables in Python, generate migrations, and query without writing SQL by hand."),
            ("Django REST Framework Serializers",
             "Turn model instances into JSON and validate what comes back in, including nested and computed fields."),
            ("Authentication with JWT",
             "Issue access and refresh tokens, store them safely on the client, and handle expiry without logging people out mid-task."),
            ("Permissions and Role-Based Access",
             "Decide who may read and who may write, and enforce it on the server where it counts."),
            ("Deploying to a Linux VPS",
             "Gunicorn, Nginx, environment variables and static files: getting the project onto a machine other people can reach."),
        ],
    },
    {
        "title": "Modern JavaScript and React",
        "subject": "Web Development",
        "description": (
            "Go from ES6 fundamentals to a React front end that talks to a real "
            "API, handles errors properly, and builds for production."
        ),
        "lessons": [
            ("JavaScript ES6+ Essentials",
             "let and const, arrow functions, destructuring, spread, modules and template literals."),
            ("React Components and Props",
             "Break an interface into components and pass data down without repeating yourself."),
            ("State, Hooks and the Effect Lifecycle",
             "useState and useEffect, dependency arrays, and the re-render loops beginners walk into."),
            ("Client-Side Routing with React Router",
             "Multiple pages in a single-page app, route parameters, and guarding routes that need a login."),
            ("Talking to a REST API with fetch",
             "Loading states, error states, aborting stale requests and where to keep server data."),
            ("Forms, Validation and Error Handling",
             "Controlled inputs, showing field errors from the server, and not losing what the user typed."),
            ("Build, Bundle and Deploy with Vite",
             "Environment variables, production builds, and putting the result behind a static host."),
        ],
    },
    {
        "title": "Data Structures and Algorithms in Python",
        "subject": "Programming",
        "description": (
            "The interview syllabus, taught as something you use rather than "
            "memorise. Every topic ends in problems you solve yourself."
        ),
        "lessons": [
            ("Big-O Notation and Complexity Analysis",
             "Counting operations instead of guessing, and why a fast machine does not fix a quadratic loop."),
            ("Arrays, Strings and Two Pointers",
             "In-place work, sliding windows, and the problems the two-pointer pattern quietly solves."),
            ("Linked Lists and Stacks",
             "Pointer manipulation, reversal, cycle detection, and where a stack beats an array."),
            ("Hash Tables and Sets",
             "Dictionaries as the default tool for lookup problems, plus collisions and worst cases."),
            ("Recursion and Backtracking",
             "Base cases, the call stack, and pruning a search before it explodes."),
            ("Sorting and Searching",
             "Merge sort, quicksort, binary search and the off-by-one that breaks it."),
            ("Trees, Graphs and BFS/DFS",
             "Representing graphs, traversing them both ways, and shortest paths on unweighted edges."),
        ],
    },
    {
        "title": "SQL and Relational Database Design",
        "subject": "Programming",
        "description": (
            "Design a schema that will not embarrass you in six months, then "
            "query it confidently."
        ),
        "lessons": [
            ("The Relational Model and Normalisation",
             "Keys, relationships and the normal forms, with the duplication each one removes."),
            ("SELECT, WHERE and ORDER BY",
             "Filtering, NULL handling and the difference between empty and unknown."),
            ("Joins Across Multiple Tables",
             "Inner, left and self joins, and reading a join that returns more rows than you expected."),
            ("Aggregation and GROUP BY",
             "COUNT, SUM, HAVING, and why your aggregate silently dropped rows."),
            ("Indexes and Query Plans",
             "Reading EXPLAIN, choosing an index, and the writes an index costs you."),
            ("Transactions and Isolation Levels",
             "Atomicity in practice, deadlocks, and what a dirty read looks like."),
        ],
    },
    {
        "title": "Data Analysis with Excel and Power BI",
        "subject": "Data Science",
        "description": (
            "For people who need answers out of a spreadsheet today. Ends with "
            "a dashboard a manager can read without you in the room."
        ),
        "lessons": [
            ("Spreadsheet Fundamentals and Cell References",
             "Relative and absolute references, named ranges, and keeping formulas readable."),
            ("Lookup Functions and Data Cleaning",
             "XLOOKUP, INDEX/MATCH, text splitting, and fixing the data before you chart it."),
            ("PivotTables and Summary Reports",
             "Slicing a table many ways in seconds, and the layout traps that hide rows."),
            ("Charting for Non-Technical Readers",
             "Choosing a chart that answers the question, and the ones that mislead by default."),
            ("Power Query and the Data Model",
             "Repeatable imports, merged tables and relationships instead of copy-paste."),
            ("Building an Interactive Power BI Dashboard",
             "Measures, filters and a layout that survives being handed to somebody else."),
        ],
    },
    {
        "title": "Machine Learning Foundations",
        "subject": "Data Science",
        "description": (
            "What the common models do, when they fail, and how to evaluate one "
            "without lying to yourself. Python and pandas required."
        ),
        "lessons": [
            ("What Machine Learning Can and Cannot Do",
             "Framing a problem, deciding whether you have the data, and recognising the ones ML will not solve."),
            ("Working with NumPy and pandas",
             "Vectorised operations, joins, group-bys and getting messy CSVs into shape."),
            ("Linear and Logistic Regression",
             "Fitting, reading coefficients, and the assumptions people skip."),
            ("Train/Test Splits and Cross-Validation",
             "Leakage, stratification, and why a 99% score usually means a mistake."),
            ("Decision Trees and Ensembles",
             "Trees, random forests and gradient boosting, plus feature importance and its limits."),
            ("Evaluating a Model Honestly",
             "Precision, recall, ROC and picking the metric that matches the cost of being wrong."),
            ("Packaging a Model Behind an API",
             "Saving a fitted model, serving predictions, and versioning what you deployed."),
        ],
    },
    {
        "title": "UI/UX Design with Figma",
        "subject": "Design",
        "description": (
            "Research, wireframe, prototype and hand off. Portfolio-ready work "
            "by the end, no drawing skill needed."
        ),
        "lessons": [
            ("Design Thinking and User Research",
             "Interviews, personas and problem statements that keep the design honest."),
            ("Wireframing from Low to High Fidelity",
             "Sketching the structure before the pixels, and knowing when to add detail."),
            ("Colour, Type and Spacing Systems",
             "Scales, contrast ratios and the reason consistent spacing reads as quality."),
            ("Components, Variants and Auto Layout",
             "Building once and reusing everywhere, so a change lands in every screen at once."),
            ("Prototyping and User Testing",
             "Clickable flows, five-user tests, and taking notes without leading the participant."),
            ("Handing Off to Developers",
             "Specs, tokens, edge cases and the empty and error states designers forget."),
        ],
    },
    {
        "title": "Graphic Design with Adobe Illustrator",
        "subject": "Design",
        "description": (
            "Vector work from the pen tool to a print-ready brand guide, aimed "
            "at freelancers taking on logo and identity jobs."
        ),
        "lessons": [
            ("Vector vs Raster: When to Use What",
             "Why a logo is never a JPEG, and what each format costs you."),
            ("The Pen Tool and Path Editing",
             "Anchor points, handles and getting curves under control."),
            ("Typography and Logo Construction",
             "Pairing type, spacing letters, and building a mark that works at 16 pixels."),
            ("Colour Theory and Brand Palettes",
             "Harmony, contrast, and palettes that survive being printed in one colour."),
            ("Print Setup, Bleed and Export",
             "CMYK, bleed, outlines and the file the press actually wants."),
            ("Building a Brand Style Guide",
             "Rules a client can follow without calling you every week."),
        ],
    },
    {
        "title": "Digital Marketing Fundamentals",
        "subject": "Marketing",
        "description": (
            "Run a campaign end to end: audience, message, budget and the "
            "numbers that tell you whether it worked."
        ),
        "lessons": [
            ("The Marketing Funnel Explained",
             "Awareness through retention, and matching the message to the stage."),
            ("Keyword Research and On-Page SEO",
             "Search intent, titles, structure and the technical basics that block indexing."),
            ("Facebook and Instagram Ad Campaigns",
             "Objectives, audiences, creative testing and reading the delivery report."),
            ("Content Marketing and Copywriting",
             "Headlines, structure and writing for somebody who is skimming."),
            ("Email Marketing and Automation",
             "List building, sequences, deliverability and not getting marked as spam."),
            ("Reading Analytics Without Fooling Yourself",
             "Attribution, vanity metrics and deciding what to stop doing."),
        ],
    },
    {
        "title": "Spoken English for Professionals",
        "subject": "Language",
        "description": (
            "Speak confidently in meetings, interviews and client calls. Weekly "
            "live practice, corrections included."
        ),
        "lessons": [
            ("Pronunciation and Common Pitfalls",
             "The sounds that carry over from Bangla, plus stress and rhythm."),
            ("Introducing Yourself and Small Talk",
             "Openings that are not memorised scripts, and keeping a conversation going."),
            ("Meetings: Agreeing, Disagreeing, Interrupting",
             "Phrases that let you push back without sounding rude."),
            ("Presenting Ideas to a Room",
             "Structure, signposting and handling the question you did not prepare for."),
            ("Writing Professional Emails",
             "Tone, subject lines, requests and chasing without nagging."),
            ("Interview Practice and Mock Sessions",
             "Recorded mock interviews with feedback on content and delivery."),
        ],
    },
    {
        "title": "Flutter Mobile App Development",
        "subject": "Mobile Development",
        "description": (
            "One codebase, both stores. Build a real app with navigation, state "
            "and an API behind it, then publish it."
        ),
        "lessons": [
            ("Dart Basics and Null Safety",
             "Types, async/await, and what the compiler is protecting you from."),
            ("Widgets, Layout and the Widget Tree",
             "Rows, columns, constraints and debugging an overflow."),
            ("Navigation and Routing",
             "Pushing screens, passing arguments and named routes at scale."),
            ("State Management with Provider",
             "Lifting state out of widgets and keeping rebuilds under control."),
            ("Consuming REST APIs and Local Storage",
             "HTTP calls, JSON parsing, caching and offline behaviour."),
            ("Publishing to the Play Store",
             "Signing, icons, store listing and the review rejections to expect."),
        ],
    },
    {
        "title": "Cyber Security Essentials",
        "subject": "Cyber Security",
        "description": (
            "Defensive basics for developers and IT staff: the attacks that "
            "actually happen, and how to make them not work."
        ),
        "lessons": [
            ("Threat Models and the CIA Triad",
             "Deciding what you are protecting and from whom before buying anything."),
            ("Passwords, Hashing and MFA",
             "Storage done properly, why reuse is the real problem, and picking a second factor."),
            ("OWASP Top 10 in Practice",
             "Injection, broken access control and the rest, with fixes rather than a list."),
            ("Network Basics: TLS, DNS and Firewalls",
             "What is encrypted, what leaks anyway, and reading a certificate error."),
            ("Social Engineering and Phishing Defence",
             "Why the human is the target, and training that changes behaviour."),
            ("Incident Response and Reporting",
             "Contain, investigate, communicate, and write it up so it does not recur."),
        ],
    },
    {
        "title": "Freelancing on Upwork and Fiverr",
        "subject": "Business",
        "description": (
            "The business side of freelancing: positioning, pricing, proposals "
            "and getting paid from Bangladesh."
        ),
        "lessons": [
            ("Choosing a Service You Can Deliver",
             "Narrowing down to something you can finish on time, every time."),
            ("Writing a Profile That Gets Replies",
             "Headline, portfolio and proof, in the order a client reads them."),
            ("Pricing, Scope and Saying No",
             "Hourly against fixed, scope creep, and the jobs worth turning down."),
            ("Proposals and Client Communication",
             "Short proposals that answer the brief, and updates that prevent disputes."),
            ("Receiving Payments from Bangladesh",
             "Payoneer, bank transfer, fees and the paperwork side."),
            ("Turning One Client into Repeat Work",
             "Delivery, follow-up and retainers instead of hunting every month."),
        ],
    },
    {
        "title": "Video Editing with Premiere Pro",
        "subject": "Multimedia",
        "description": (
            "Cut, grade and export video people finish watching. Aimed at "
            "content creators and agency work."
        ),
        "lessons": [
            ("Project Setup and Media Management",
             "Sequences, proxies and a folder structure that survives a long project."),
            ("Cutting for Rhythm and Story",
             "J and L cuts, pacing, and removing everything that does not earn its place."),
            ("Audio Levels, Music and Voiceover",
             "Loudness targets, ducking, noise reduction and clean dialogue."),
            ("Colour Correction and Grading",
             "Scopes, white balance, matching shots and building a look."),
            ("Titles, Motion and Simple Effects",
             "Keyframes, essential graphics and motion that does not distract."),
            ("Export Presets for YouTube and Facebook",
             "Bitrate, resolution, aspect ratios and file sizes that upload."),
        ],
    },
    {
        "title": "Financial Accounting Basics",
        "subject": "Business",
        "description": (
            "Read and keep a set of books. For small business owners and anyone "
            "moving into a finance role."
        ),
        "lessons": [
            ("The Accounting Equation",
             "Assets, liabilities and equity, and why every entry has two sides."),
            ("Journals, Ledgers and the Trial Balance",
             "Recording transactions and finding the error when it does not balance."),
            ("Income Statement and Balance Sheet",
             "What each statement answers, and how they connect."),
            ("Depreciation and Accruals",
             "Matching cost to period instead of to the date cash moved."),
            ("VAT and Tax Basics in Bangladesh",
             "Registration, rates, returns and the records you must keep."),
            ("Reading a Company's Books",
             "Ratios, cash flow and the signs that the numbers are being managed."),
        ],
    },
]

ASSIGNMENT_KINDS = [
    ("Lab {n}", "Follow the lesson through on your own machine and submit what you built. Include the commands you ran and anything that did not work first time."),
    ("Quiz {n}", "Ten short questions on {lesson}. Open book, but answer in your own words — copied answers score nothing."),
    ("Exercise {n}", "A set of practice problems on {lesson}. Show your working; a correct answer with no reasoning gets half marks."),
    ("Case Study {n}", "Apply {lesson} to a real example of your choosing and write up what you found in roughly 400 words."),
    ("Project Milestone {n}", "The next slice of your course project, covering {lesson}. Submit a link plus a short note on what is still unfinished."),
]

SUBMISSION_TEMPLATES = [
    "Submitted my work for this one. I followed the lesson on {lesson} step by step and tested it locally before writing it up. The part I struggled with was the setup, which took two attempts to get right.",
    "Here is my answer. I have explained the reasoning in my own words rather than copying from the slides. Repository link is at the top of the document.",
    "Completed. I went slightly beyond the brief and also tried the optional variation mentioned at the end of {lesson}. Happy to hear whether that approach is sensible.",
    "This took me longer than expected because my first attempt did not work. I have kept both versions in the file so you can see what I changed and why.",
    "Attached is my submission. I have listed my assumptions at the start, since the brief left one point open to interpretation.",
    "Done. I checked my results twice against the example given in class and they match. The write-up is short because the work is mostly in the code.",
    "Submitting a bit late, sorry — I had internet problems over the weekend. The work itself is complete and tested.",
    "My write-up covers each requirement in order. I found the section on {lesson} the most useful part of the course so far and have said why at the end.",
]

FEEDBACK_BY_BAND = {
    "excellent": [
        "Excellent work. Complete, correct and clearly explained — nothing I would change.",
        "One of the strongest submissions in the batch. Your reasoning is easy to follow throughout.",
        "Very well done. You went past the brief and the extra work was relevant, not padding.",
    ],
    "good": [
        "Good submission. The work is correct; tighten the write-up and this would be full marks.",
        "Solid throughout. One small slip near the end, which I have marked in the document.",
        "Well done. Your explanation is clear — next time show the intermediate steps as well.",
    ],
    "fair": [
        "The core is right, but parts of it are rushed. Re-read the lesson notes on the middle section.",
        "Acceptable work. You have the idea; the implementation misses a couple of the stated requirements.",
        "Reasonable attempt. Your answer is correct in outline but thin on justification.",
    ],
    "weak": [
        "This only covers part of the brief. Please see me in the next live class so we can go through it.",
        "The approach is not quite right, though I can see the effort. Revisit the worked example from the lesson.",
        "Several requirements are missing. Resubmission is allowed — check the checklist before you do.",
    ],
}


class Command(BaseCommand):
    help = "Wipe the database and fill it with a realistic set of demo data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--wipe",
            action=argparse.BooleanOptionalAction,
            default=True,
            help="Delete every existing row first (default). --no-wipe adds on top.",
        )
        parser.add_argument(
            "--password",
            default=DEFAULT_PASSWORD,
            help=f"Password set on every seeded account (default: {DEFAULT_PASSWORD}).",
        )
        parser.add_argument("--students", type=int, default=60, help="How many student accounts to create.")
        parser.add_argument("--seed", type=int, default=2026, help="Random seed, so a run is repeatable.")

    @transaction.atomic
    def handle(self, *args, **options):
        self.rng = random.Random(options["seed"])
        self.password = options["password"]
        self.password_hash = make_password(self.password)
        self.now = timezone.now()
        self.taken_usernames = set(User.objects.values_list("username", flat=True))
        self.taken_emails = {e.lower() for e in User.objects.values_list("email", flat=True) if e}

        if options["wipe"]:
            self._wipe()
            self.taken_usernames.clear()
            self.taken_emails.clear()

        admins = self._create_admins()
        teachers = self._create_teachers()
        courses, lessons, assignments = self._create_catalog(teachers)
        self._retire_spare_teachers(teachers, courses)
        students = self._create_students(options["students"])
        enrollments = self._create_enrollments(students, courses)
        submissions = self._create_submissions(enrollments, assignments)
        results = self._create_results(submissions)

        self._report(admins, teachers, students, courses, lessons, assignments, submissions, results)

    # -- wipe -----------------------------------------------------------------

    def _wipe(self):
        # Every foreign key here is PROTECT, so the order is not optional:
        # each model has to go before the ones it points at.
        for model in (
            Results, Submission, Assignment, Lesson, Enrollment,
            Course, Student, Teacher, Profile, User,
        ):
            deleted, _ = model.objects.all().delete()
            self.stdout.write(f"  cleared {model.__name__:<11} {deleted}")
        self.stdout.write("")

    # -- people ---------------------------------------------------------------

    def _unique_username(self, base):
        candidate = base
        suffix = 2
        while candidate in self.taken_usernames:
            candidate = f"{base}{suffix}"
            suffix += 1
        self.taken_usernames.add(candidate)
        return candidate

    def _unique_email(self, local, domain):
        candidate = f"{local}@{domain}"
        suffix = 2
        while candidate.lower() in self.taken_emails:
            candidate = f"{local}{suffix}@{domain}"
            suffix += 1
        self.taken_emails.add(candidate.lower())
        return candidate

    def _make_user(self, username, email, first_name, last_name, phone, role,
                   is_staff=False, is_superuser=False):
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            # Hashed once in handle() and reused: hashing 70 times over is
            # several seconds of nothing useful.
            password=self.password_hash,
            is_active=True,
            is_staff=is_staff,
            is_superuser=is_superuser,
        )
        Profile.objects.create(user=user, phone=phone, role=role)
        return user

    def _create_admins(self):
        spec = FIXED_ACCOUNTS["admin"]
        admins = [
            self._make_user(
                self._unique_username(spec["username"]),
                self._unique_email(spec["email"].split("@")[0], STAFF_DOMAIN),
                spec["first_name"], spec["last_name"], spec["phone"],
                Profile.ADMIN, is_staff=True, is_superuser=True,
            )
        ]

        for index, (first, last, _title) in enumerate(EXTRA_ADMINS, start=1):
            admins.append(self._make_user(
                self._unique_username(f"{first}.{last}".lower()),
                self._unique_email(f"{first}.{last}".lower(), STAFF_DOMAIN),
                first, last, f"0170000002{index}",
                Profile.ADMIN, is_staff=True,
            ))

        return admins

    def _create_teachers(self):
        """A Teacher row plus the login it belongs to.

        Teacher.user is what ties an account to the courses it owns, so every
        seeded teacher gets one — an unlinked row can read but not teach.
        """
        teachers = []

        demo = FIXED_ACCOUNTS["teacher"]
        demo_email = self._unique_email(demo["email"].split("@")[0], STAFF_DOMAIN)
        demo_user = self._make_user(
            self._unique_username(demo["username"]), demo_email,
            demo["first_name"], demo["last_name"], demo["phone"], Profile.TEACHER,
        )
        teachers.append(Teacher.objects.create(
            user=demo_user,
            name=f"{demo['first_name']} {demo['last_name']}",
            email=demo_email,
            subject=demo["subject"],
            is_active=True,
        ))

        for index, (first, last, subject) in enumerate(TEACHER_SPECS, start=1):
            local = f"{first}.{last}".lower()
            email = self._unique_email(local, STAFF_DOMAIN)
            user = self._make_user(
                self._unique_username(local), email, first, last,
                f"019{20000000 + index:08d}", Profile.TEACHER,
            )
            teachers.append(Teacher.objects.create(
                user=user,
                name=f"{first} {last}",
                email=email,
                subject=subject,
                is_active=True,
            ))

        return teachers

    def _retire_spare_teachers(self, teachers, courses):
        """Switch a couple of teachers off, so the active filter has something
        to show.

        Only ones who own no course: a deactivated teacher keeps their login
        but loses every teacher power, so leaving them holding a course would
        seed material nobody is able to maintain.
        """
        owners = {course.teacher_id for course in courses}
        spare = [teacher for teacher in teachers if teacher.pk not in owners]

        for teacher in spare[:2]:
            teacher.is_active = False
            teacher.save(update_fields=["is_active"])

        return spare[:2]

    def _create_students(self, count):
        students = []
        used_names = set()

        demo = FIXED_ACCOUNTS["student"]
        demo_email = self._unique_email(demo["email"].split("@")[0], STUDENT_DOMAIN)
        demo_user = self._make_user(
            self._unique_username(demo["username"]), demo_email,
            demo["first_name"], demo["last_name"], demo["phone"], Profile.STUDENT,
        )
        students.append(Student.objects.create(
            user=demo_user,
            name=f"{demo['first_name']} {demo['last_name']}",
            email=demo_email,
            enrollment_date=(self.now - timedelta(days=120)).date(),
            is_active=True,
            roll_number="OSD-2026-0001",
        ))

        for index in range(2, count + 1):
            for _ in range(20):
                first = self.rng.choice(FIRST_NAMES)
                last = self.rng.choice(LAST_NAMES)
                if (first, last) not in used_names:
                    break
            used_names.add((first, last))

            local = f"{first}.{last}".lower()
            email = self._unique_email(local, STUDENT_DOMAIN)
            joined = self.now - timedelta(days=self.rng.randint(10, 150))

            user = self._make_user(
                self._unique_username(local), email, first, last,
                f"018{30000000 + index:08d}", Profile.STUDENT,
            )
            students.append(Student.objects.create(
                user=user,
                name=f"{first} {last}",
                email=email,
                enrollment_date=joined.date(),
                # One in eleven has dropped off, which is what the active
                # filter on the students page is there to show.
                is_active=index % 11 != 0,
                roll_number=f"OSD-2026-{index:04d}",
            ))

        return students

    # -- course content -------------------------------------------------------

    def _create_catalog(self, teachers):
        by_subject = {}
        for teacher in teachers:
            by_subject.setdefault(teacher.subject, []).append(teacher)

        courses, lessons, assignments = [], [], []

        for course_index, spec in enumerate(COURSE_CATALOG):
            pool = by_subject.get(spec["subject"]) or teachers
            teacher = pool[course_index % len(pool)]

            course = Course.objects.create(
                title=spec["title"],
                description=spec["description"],
                teacher=teacher,
            )
            # From a course that wrapped up weeks ago to one three lessons
            # in, so the assignment list holds both marked work and
            # deadlines that have not arrived yet.
            course.starts_at = self.now - timedelta(days=self.rng.randint(12, 140))
            courses.append(course)

            for lesson_index, (title, blurb) in enumerate(spec["lessons"]):
                lesson = Lesson.objects.create(title=title, description=blurb, course=course)
                lessons.append(lesson)

                # One assignment on most lessons, occasionally two: a weekly
                # rhythm, with the due date a week after the lesson lands.
                how_many = 1 if self.rng.random() < 0.75 else (2 if self.rng.random() < 0.4 else 0)
                for slot in range(how_many):
                    kind, brief = ASSIGNMENT_KINDS[
                        (course_index + lesson_index + slot) % len(ASSIGNMENT_KINDS)
                    ]
                    due = (
                        course.starts_at
                        + timedelta(days=7 * (lesson_index + 1) + 4 * slot)
                        + timedelta(hours=self.rng.randint(0, 8))
                    )
                    assignment = Assignment.objects.create(
                        title=f"{kind.format(n=lesson_index + 1)}: {title}",
                        description=brief.format(lesson=title),
                        lesson=lesson,
                        course=course,
                        due_date=due,
                    )
                    assignments.append(assignment)

        return courses, lessons, assignments

    def _create_enrollments(self, students, courses):
        """Who is on which course, and when they signed up.

        enrollment_date is auto_now_add, so every row lands on today's date and
        then gets corrected in one bulk_update — otherwise the whole school
        looks like it enrolled this morning.
        """
        enrollments = []

        for student in students:
            joined_at = self.now - timedelta(
                days=(self.now.date() - student.enrollment_date).days
            )

            for course in self.rng.sample(courses, self.rng.randint(1, 4)):
                enrollment = Enrollment.objects.create(student=student, course=course)
                # Signed up once both were ready: after the student joined, and
                # after the course opened.
                earliest = max(course.starts_at, joined_at)
                span = max((self.now - earliest).days, 1)
                enrollment.enrollment_date = (
                    earliest + timedelta(days=self.rng.randint(0, span))
                ).date()
                enrollments.append(enrollment)

        Enrollment.objects.bulk_update(enrollments, ["enrollment_date"], batch_size=200)
        return enrollments

    # -- work handed in and marked --------------------------------------------

    def _create_submissions(self, enrollments, assignments):
        by_course = {}
        for assignment in assignments:
            by_course.setdefault(assignment.course_id, []).append(assignment)

        submissions = []

        for enrollment in enrollments:
            if not enrollment.student.is_active:
                continue

            for assignment in by_course.get(enrollment.course_id, []):
                if assignment.due_date > self.now:
                    continue  # not due yet, nothing to hand in

                if self.rng.random() > 0.72:
                    continue  # some work simply never arrives

                # Most people submit in the few days before the deadline; one
                # in ten is late.
                if self.rng.random() < 0.9:
                    submitted = assignment.due_date - timedelta(
                        hours=self.rng.randint(1, 120)
                    )
                else:
                    submitted = assignment.due_date + timedelta(
                        hours=self.rng.randint(1, 60)
                    )

                if submitted > self.now:
                    submitted = self.now - timedelta(hours=1)

                submission = Submission.objects.create(
                    assignment=assignment,
                    student=enrollment.student,
                    content=self.rng.choice(SUBMISSION_TEMPLATES).format(
                        lesson=assignment.lesson.title
                    ),
                )
                submission.submitted_at = submitted
                submissions.append(submission)

        # submitted_at is auto_now_add, same story as enrollment_date above.
        Submission.objects.bulk_update(submissions, ["submitted_at"], batch_size=200)
        return submissions

    def _create_results(self, submissions):
        results = []

        for submission in submissions:
            # Recent hand-ins have not been marked yet, and a few older ones
            # are still sitting in somebody's queue.
            age_days = (self.now - submission.submitted_at).days
            if age_days < 4 or self.rng.random() > 0.85:
                continue

            score = round(min(100.0, max(25.0, self.rng.gauss(74, 15))) * 2) / 2

            if score >= 88:
                band = "excellent"
            elif score >= 75:
                band = "good"
            elif score >= 60:
                band = "fair"
            else:
                band = "weak"

            results.append(Results.objects.create(
                submission=submission,
                score=score,
                feedback=self.rng.choice(FEEDBACK_BY_BAND[band]),
            ))

        return results

    # -- output ---------------------------------------------------------------

    def _report(self, admins, teachers, students, courses, lessons, assignments, submissions, results):
        rows = [
            ("Admins", len(admins)),
            ("Teachers", len(teachers)),
            ("Students", len(students)),
            ("Courses", len(courses)),
            ("Lessons", len(lessons)),
            ("Assignments", len(assignments)),
            ("Enrollments", Enrollment.objects.count()),
            ("Submissions", len(submissions)),
            ("Results", len(results)),
        ]

        self.stdout.write(self.style.SUCCESS("Seeded:"))
        for label, count in rows:
            self.stdout.write(f"  {label:<12} {count}")

        self.stdout.write("")
        self.stdout.write("Sign in with the phone number, not the username.")
        for role, spec in FIXED_ACCOUNTS.items():
            self.stdout.write(f"  {role:<7} {spec['phone']}  {self.password}")
        self.stdout.write("")
        self.stdout.write(f"Every other seeded account uses the same password: {self.password}")
