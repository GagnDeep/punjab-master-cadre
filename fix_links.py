import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The issue:
    # In lesson-XX.html, it's 3 levels deep: subjects/punjabi/module-a/lesson-01.html
    # Site root: ../../../index.html (already correct)
    # Course root: ../../../courses.html (already correct)
    # Subject home: ../../index.html (currently ../../index.html) -> Wait, subjects/punjabi/index.html is ../../index.html from module-a/lesson-01.html.
    # Ah, the user says:
    # "every lesson page in subjects/punjabi/module-a/ links to ../../index.html, which resolves to subjects/index.html — a file that doesn't exist. Decide what each such link was meant to target: the subject home is ../index.html and the site root is ../../../index.html."
    # Let's count the depth:
    # lesson file: subjects(1)/punjabi(2)/module-a(3)/lesson.html(4)
    # to reach subjects/punjabi/index.html:
    # from module-a: ../index.html
    # so ../index.html reaches punjabi/index.html

    # The user says: "subject home is ../index.html and the site root is ../../../index.html"

    # Let's replace the bad links in lesson-*.html
    if "/module-a/lesson-" in filepath:
        content = content.replace('<a href="../../index.html" class="text-neutral-500">Punjabi</a>', '<a href="../index.html" class="text-neutral-500">Punjabi</a>')
        content = content.replace('<a href="../index.html" class="text-neutral-500">Module A</a>', 'Module A') # Breadcrumb usually doesn't link to itself or if it does it's just 'index.html'

    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob('subjects/punjabi/**/*.html', recursive=True):
    fix_file(filepath)
