"""Static content the seeder draws on.

Kept out of the management command so the command itself stays readable: this
file is a catalogue, not logic. Everything here is invented, but shaped like a
real Bangladeshi online-course provider's data so the UI looks plausible when
you click through it.
"""

# Names are split by the part that varies so the seeder can build many
# distinct people without repeating a hand-written list.
FIRST_NAMES = [
    "Adnan", "Afsana", "Ahnaf", "Aklima", "Alamin", "Anika", "Arif", "Ashraful",
    "Ayesha", "Badhon", "Bushra", "Dipto", "Emon", "Farhan", "Farhana", "Fahim",
    "Habiba", "Hasibul", "Imran", "Ishrat", "Jannatul", "Jubayer", "Kamrul",
    "Khadija", "Labib", "Maliha", "Masud", "Mehedi", "Mizanur", "Munira",
    "Nabila", "Nafis", "Naimur", "Nazmul", "Nusrat", "Ovi", "Parvez", "Prottoy",
    "Rafid", "Rakibul", "Rezaul", "Riyad", "Rubaiya", "Sabbir", "Sadia",
    "Safwan", "Sanjida", "Shahriar", "Sharmin", "Shuvo", "Sumaiya", "Tahmid",
    "Tanvir", "Tasnim", "Tawhid", "Tuhin", "Zarin", "Zubair",
]

LAST_NAMES = [
    "Ahmed", "Akter", "Alam", "Ali", "Barua", "Bhuiyan", "Chowdhury", "Das",
    "Ferdous", "Hasan", "Hossain", "Huq", "Islam", "Jahan", "Kabir", "Karim",
    "Khan", "Mahmud", "Mia", "Mondol", "Nahar", "Rahman", "Roy", "Sarker",
    "Siddika", "Sultana", "Talukder", "Uddin", "Zaman",
]

# Every course gets a teacher whose subject matches, so the teacher list does
# not read as random when you open it next to the course list.
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
            ("Models, Migrations and the ORM",
             "Describe your data as Python classes and let Django generate the SQL. Covers field types, relationships and what a migration actually is."),
            ("Views, URLs and Templates",
             "Trace a request from the URL bar to the rendered page, and learn where your own code belongs in that path."),
            ("Forms and Validation",
             "Accept input without trusting it. Server-side validation, error display, and why the browser's own checks are not enough."),
            ("Django REST Framework Serializers",
             "Turn model instances into JSON and back again, with validation that runs on the way in."),
            ("Authentication with JWT",
             "Issue and verify tokens, protect endpoints, and decide what belongs in the token versus the database."),
            ("Permissions and Roles",
             "Let an admin do what a student cannot. Object-level and view-level permission classes."),
            ("Deploying to a Linux Server",
             "Gunicorn, Nginx, environment variables and static files. What changes when DEBUG is finally False."),
        ],
    },
    {
        "title": "React from Scratch",
        "subject": "Frontend Engineering",
        "description": (
            "Learn React the way it is written today: function components, hooks "
            "and a router. No class components, no legacy patterns."
        ),
        "lessons": [
            ("JSX and Your First Component",
             "What JSX compiles to, why components are just functions, and how props flow downward."),
            ("State with useState",
             "Hold values that change, and understand why mutating state directly does nothing."),
            ("Side Effects with useEffect",
             "Fetching, subscriptions and cleanup. The dependency array explained properly."),
            ("Lists, Keys and Conditional Rendering",
             "Render collections without the console warning, and know what React actually uses the key for."),
            ("Forms and Controlled Inputs",
             "Bind inputs to state, handle submission, and keep validation messages next to the field they belong to."),
            ("Routing with React Router",
             "Nested routes, route parameters, and guarding a page behind a login."),
            ("Sharing State with Context",
             "Lift state once instead of threading props through five layers. When Context helps and when it hurts."),
        ],
    },
    {
        "title": "Python Programming Fundamentals",
        "subject": "Programming",
        "description": (
            "A first programming course. Starts from variables and finishes with "
            "you reading and writing files, handling errors and organising code "
            "into modules."
        ),
        "lessons": [
            ("Variables, Types and Operators",
             "Numbers, strings, booleans, and the difference between assignment and equality."),
            ("Control Flow: if, for, while",
             "Make decisions and repeat work. Includes the loop mistakes that catch everyone once."),
            ("Lists, Tuples, Sets and Dictionaries",
             "Pick the right container for the job, and understand what each one is fast at."),
            ("Functions and Scope",
             "Arguments, return values, default parameters, and why a mutable default is a trap."),
            ("Files and Exceptions",
             "Read and write text and CSV, and fail loudly in the right place instead of silently everywhere."),
            ("Modules, Packages and pip",
             "Split code across files, import it back, and install what somebody else already wrote."),
        ],
    },
    {
        "title": "Data Analysis with Pandas and NumPy",
        "subject": "Data Science",
        "description": (
            "Load messy data, clean it, and answer questions with it. Built "
            "around real CSV exports rather than tidy textbook tables."
        ),
        "lessons": [
            ("NumPy Arrays and Vectorised Thinking",
             "Replace loops with array operations, and see why that is faster than it looks."),
            ("DataFrames, Indexing and Selection",
             "loc versus iloc, boolean masks, and how to stop fighting the index."),
            ("Cleaning Missing and Duplicate Data",
             "Decide between dropping, filling and flagging. Each choice changes the answer."),
            ("Grouping and Aggregation",
             "groupby, pivot tables, and summarising without losing the detail that mattered."),
            ("Joining Datasets",
             "Merge on keys, understand the four join types, and catch the row-count explosion early."),
            ("Plotting Results with Matplotlib",
             "Charts that answer the question you asked, with axes a reader can trust."),
        ],
    },
    {
        "title": "Machine Learning Foundations",
        "subject": "Data Science",
        "description": (
            "The core ideas behind supervised learning, with scikit-learn. Maths "
            "kept to what you need to make a good decision, not a proof."
        ),
        "lessons": [
            ("What Machine Learning Can and Cannot Do",
             "Framing a problem, and recognising the ones that are not learning problems at all."),
            ("Linear and Logistic Regression",
             "Fit a line, fit a boundary, and read the coefficients without over-reading them."),
            ("Train/Test Splits and Cross-Validation",
             "Measure a model on data it has not seen, and stop fooling yourself."),
            ("Decision Trees and Random Forests",
             "Non-linear models that stay interpretable, and where they overfit."),
            ("Feature Engineering and Scaling",
             "Why the same model scores differently on the same data after a transform."),
            ("Evaluating Classifiers",
             "Accuracy is usually the wrong metric. Precision, recall, F1 and the confusion matrix."),
        ],
    },
    {
        "title": "Database Design and SQL",
        "subject": "Databases",
        "description": (
            "Design a schema that will not hurt in a year, then query it well. "
            "Uses MySQL, but the ideas carry to any relational database."
        ),
        "lessons": [
            ("Tables, Keys and Relationships",
             "Primary keys, foreign keys, and modelling one-to-many and many-to-many honestly."),
            ("Normalisation in Practice",
             "First through third normal form, and the cases where you deliberately stop short."),
            ("SELECT, WHERE and ORDER BY",
             "Getting exactly the rows you meant, in the order you meant."),
            ("Joins and Subqueries",
             "INNER, LEFT and the rest, plus when a subquery reads better than a join."),
            ("Aggregation and GROUP BY",
             "COUNT, SUM, AVG and HAVING, and the classic GROUP BY error explained."),
            ("Indexes and Query Plans",
             "Read EXPLAIN, add the index that helps, and understand the write cost you just accepted."),
            ("Transactions and Integrity",
             "ACID in plain terms, and why a half-finished transfer must never be visible."),
        ],
    },
    {
        "title": "Digital Marketing and SEO",
        "subject": "Digital Marketing",
        "description": (
            "Get found and get read. Search, content and paid channels, measured "
            "with analytics rather than guessed at."
        ),
        "lessons": [
            ("How Search Engines Rank Pages",
             "Crawling, indexing and ranking signals, without the folklore."),
            ("Keyword Research That Is Worth Doing",
             "Intent over volume, and finding the queries you can realistically win."),
            ("On-Page and Technical SEO",
             "Titles, headings, structured data, site speed and the crawl budget you are wasting."),
            ("Content Strategy and Editorial Calendars",
             "Planning what to publish so it compounds instead of scattering."),
            ("Paid Ads on Google and Meta",
             "Campaign structure, bidding, and reading the numbers before you scale spend."),
            ("Analytics and Attribution",
             "Set up events that answer business questions, and know what attribution cannot tell you."),
        ],
    },
    {
        "title": "Graphic Design with Adobe Illustrator",
        "subject": "Graphic Design",
        "description": (
            "Vector design from first principles: shapes, type and colour, "
            "finishing with a brand identity you can put in a portfolio."
        ),
        "lessons": [
            ("The Illustrator Workspace and Artboards",
             "Panels, tools and setting a document up so export does not fight you later."),
            ("Shapes, the Pen Tool and Paths",
             "Bezier curves properly explained, and drawing something that is not a rectangle."),
            ("Colour Theory and Swatches",
             "Building a palette with contrast that survives printing and small screens."),
            ("Typography and Type on a Path",
             "Choosing, pairing and spacing type, and the kerning problems nobody points out."),
            ("Logo Design Workflow",
             "Sketch, refine, vectorise, and test at the size it will really be used."),
            ("Exporting for Print and Web",
             "CMYK versus RGB, bleed, and picking a format on purpose."),
        ],
    },
    {
        "title": "UI/UX Design with Figma",
        "subject": "Product Design",
        "description": (
            "Research, wireframe, prototype and hand off. A whole product design "
            "cycle in one course, done in Figma."
        ),
        "lessons": [
            ("Design Thinking and User Research",
             "Interviews, surveys and turning what you heard into something you can design against."),
            ("Wireframing and Information Architecture",
             "Structure before styling. Getting the screens and their order right first."),
            ("Auto Layout and Components",
             "Build once, reuse everywhere, and change a hundred screens from one place."),
            ("Design Systems and Variables",
             "Tokens for colour, spacing and type, with light and dark handled together."),
            ("Prototyping and User Testing",
             "Make it clickable, put it in front of five people, and act on what breaks."),
            ("Developer Handoff",
             "Specs, naming and the questions an engineer will ask you before they build it."),
        ],
    },
    {
        "title": "Freelancing on Upwork and Fiverr",
        "subject": "Career Skills",
        "description": (
            "Turn a skill into paid client work: profile, proposals, pricing, "
            "scope and getting paid on time."
        ),
        "lessons": [
            ("Choosing a Niche and Positioning",
             "Being the obvious choice for a narrow thing beats being available for anything."),
            ("Building a Profile and Portfolio",
             "What a buyer actually reads, and what to show when you have no client work yet."),
            ("Writing Proposals That Get Replies",
             "Leading with their problem, and the openings that get skipped."),
            ("Pricing, Scope and Contracts",
             "Hourly versus fixed, milestones, and writing scope so revisions stay finite."),
            ("Client Communication and Delivery",
             "Status updates, handling changes, and saying no without losing the job."),
            ("Payments, Withdrawals and Taxes",
             "Getting funds into a Bangladeshi bank account, and keeping records for it."),
        ],
    },
    {
        "title": "Spoken English for Professionals",
        "subject": "English Language",
        "description": (
            "Speak with confidence at work: meetings, interviews, calls and "
            "presentations. Practice-heavy, grammar only where it changes meaning."
        ),
        "lessons": [
            ("Pronunciation and Common Sound Traps",
             "The sounds that are hardest for Bangla speakers, and drills that fix them."),
            ("Everyday Workplace Conversation",
             "Small talk, requests, disagreement and apology, in the register work expects."),
            ("Meetings and Conference Calls",
             "Interrupting politely, asking for repetition, and summarising a decision."),
            ("Job Interviews in English",
             "Structuring an answer, describing your work, and handling a question you did not expect."),
            ("Presentations and Public Speaking",
             "Openings, signposting and closing, plus what to do when you lose your thread."),
            ("Professional Email and Chat",
             "Tone, directness and length. Writing something a busy reader will actually finish."),
        ],
    },
    {
        "title": "Flutter App Development",
        "subject": "Mobile Development",
        "description": (
            "One codebase, Android and iOS. Widgets, state, navigation and "
            "talking to a REST API, ending with a release build."
        ),
        "lessons": [
            ("Dart Basics for Flutter",
             "Null safety, futures and the language features Flutter leans on."),
            ("Widgets, Layout and Constraints",
             "How Flutter sizes things, and how to read a layout overflow error."),
            ("State Management with Provider",
             "Sharing state beyond one widget without rebuilding the whole tree."),
            ("Navigation and Routing",
             "Named routes, passing arguments and handling the back button."),
            ("Calling REST APIs",
             "http, JSON parsing, loading and error states that a user can understand."),
            ("Local Storage and Offline",
             "Shared preferences, SQLite, and deciding what must survive a restart."),
            ("Building and Releasing",
             "Signing, app icons, and getting a build onto a real device and a store."),
        ],
    },
    {
        "title": "Laravel and PHP for Web Apps",
        "subject": "Web Development",
        "description": (
            "Modern PHP with Laravel: routing, Eloquent, Blade, auth and queues, "
            "built around one application you extend each week."
        ),
        "lessons": [
            ("Modern PHP and Composer",
             "Namespaces, autoloading and dependencies. PHP as it is written now, not in 2010."),
            ("Routing, Controllers and Middleware",
             "Where a request goes and where to put the checks that run before it lands."),
            ("Eloquent Models and Relationships",
             "hasMany, belongsTo, eager loading, and spotting an N+1 query."),
            ("Blade Templates and Components",
             "Layouts, slots and reusable partials without duplicating markup."),
            ("Validation and Form Requests",
             "Rules in one place, messages that make sense, and old input preserved."),
            ("Authentication and Authorisation",
             "Sessions, guards, gates and policies, and where each one belongs."),
            ("Queues, Jobs and Scheduled Tasks",
             "Move slow work off the request, and run things on a timer reliably."),
        ],
    },
    {
        "title": "Git, GitHub and Team Workflow",
        "subject": "Software Engineering",
        "description": (
            "Version control that survives a team. Branching, review, conflicts "
            "and the automation that runs before a merge."
        ),
        "lessons": [
            ("Commits, Staging and History",
             "What a commit really is, and writing history somebody can read later."),
            ("Branching and Merging",
             "Feature branches, fast-forward versus merge commits, and keeping main releasable."),
            ("Resolving Conflicts",
             "Reading a conflict marker calmly, and the tools that make it a two-minute job."),
            ("Pull Requests and Code Review",
             "Asking for review well, and giving feedback that improves code without stalling it."),
            ("Rebase, Cherry-Pick and Undoing Mistakes",
             "reflog, revert and reset explained by what they do to your working tree."),
            ("CI with GitHub Actions",
             "Run tests and linting on every push, and block a merge when they fail."),
        ],
    },
    {
        "title": "Cybersecurity Essentials",
        "subject": "Security",
        "description": (
            "Defensive security for developers: the attacks that actually happen "
            "to web applications, and the code changes that stop them."
        ),
        "lessons": [
            ("Threat Modelling for Small Teams",
             "Who would attack this, what would they want, and what is cheap to protect."),
            ("Authentication and Password Storage",
             "Hashing, salting, rate limiting and the reset flow that leaks account existence."),
            ("Injection, XSS and CSRF",
             "The three that keep appearing, with the framework defences that already exist."),
            ("Secure API Design",
             "Authorisation on every endpoint, failing closed, and not trusting an ID from the client."),
            ("Secrets, Config and Environments",
             "Keys out of source control, rotated, and different per environment."),
            ("Logging, Monitoring and Incident Response",
             "Log enough to investigate, not enough to leak. What to do in the first hour."),
        ],
    },
    {
        "title": "Video Editing with Premiere Pro",
        "subject": "Multimedia",
        "description": (
            "Cut, grade and deliver. From importing footage to exporting a "
            "finished piece sized for the platform it is going to."
        ),
        "lessons": [
            ("Projects, Sequences and Importing",
             "Setting a project up so the media is still linked next month."),
            ("The Timeline and Cutting Technique",
             "Ripple, roll and slip edits, and cutting on action so the join disappears."),
            ("Audio Levels and Cleanup",
             "Loudness targets, noise reduction, and why bad audio loses a viewer before bad video does."),
            ("Titles, Graphics and Motion",
             "Essential graphics, keyframes and movement that supports the cut."),
            ("Colour Correction and Grading",
             "Fix it first, then style it. Scopes, white balance and a consistent look."),
            ("Exporting for YouTube and Social",
             "Codecs, bitrates and aspect ratios per platform, without re-rendering five times."),
        ],
    },
]

# Assignment briefs get picked by position so a course's assignments do not all
# read identically.
ASSIGNMENT_BRIEFS = [
    "Work through the lesson on your own machine and submit what you built. "
    "Include the commands you ran and anything that did not work first time.",

    "Apply this week's technique to a problem of your own choosing. Explain "
    "why you picked the approach you did, not only what you typed.",

    "Extend the example from the lesson with one feature that was not covered. "
    "A short note on what you tried and discarded counts towards the mark.",

    "Rebuild the walkthrough from memory, without the recording open. Note "
    "every point where you had to go back and check something.",

    "Review the sample provided in the resources, list what is wrong with it, "
    "and submit a corrected version with your reasoning.",

    "Produce a small piece of work suitable for a portfolio, using only what "
    "has been covered so far. Quality over size.",
]

SUBMISSION_NOTES = [
    "Completed the whole brief. The part I was least sure about is the section "
    "on {topic} — I got it working but I am not certain it is the intended way.",

    "Finished, though it took longer than expected. {topic} was the step where "
    "I got stuck, and I had to look up an example before it clicked.",

    "Submitted. I went slightly beyond the brief and also tried the optional "
    "variation mentioned at the end of {topic}. Happy to hear whether that "
    "approach is sensible.",

    "Done. I have written up my reasoning inline as comments so you can see "
    "where I made a choice rather than followed the lesson.",

    "Attaching my work on {topic}. One thing I could not resolve is the edge "
    "case near the end — I have described what I observed rather than hiding it.",

    "Handed in. I redid this twice: the first attempt worked but was hard to "
    "follow, so the version here is the cleaned-up one.",
]

# Feedback is chosen by score band so a 92 does not come back with "revisit the
# worked example".
FEEDBACK_BY_BAND = {
    "high": [
        "Excellent work. Clear reasoning throughout and you handled the edge case without being asked to.",
        "Very strong. This is close to what I would expect from someone already working in the field.",
        "Well done — the explanation of your choices is as good as the work itself.",
        "Top marks. The optional extension you attempted was the right instinct.",
    ],
    "good": [
        "Good, solid work. Tidy it up slightly and this would be portfolio-ready.",
        "You have understood the material. The only weak point is the naming, which makes it harder to read than it needs to be.",
        "Nicely done. Next time show a little more of your working so I can see where a choice was made.",
        "This meets the brief comfortably. Push yourself on the optional part next week.",
    ],
    "pass": [
        "This passes, but parts of it look copied from the walkthrough without being understood. Try rebuilding it from memory.",
        "Acceptable. The core is right; the handling of the error case is not, so review that section.",
        "You got there, though the approach is more complicated than it needs to be. Compare it against the lesson example.",
        "Adequate work. Spend more time on the write-up — the reasoning is missing.",
    ],
    "low": [
        "The approach is not quite right, though I can see the effort. Revisit the worked example from the lesson.",
        "This does not meet the brief yet. Come to the next live session and we will go through it together.",
        "Incomplete. What is here is heading the right way, so please resubmit with the remaining parts finished.",
        "Several fundamentals are missing here. Go back to the earlier lesson before attempting this one again.",
    ],
}
