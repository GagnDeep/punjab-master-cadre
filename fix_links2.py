import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The user says: "check module-test/quiz pages for the same wrong-depth pattern"
    # Actually, we don't have quiz pages, we have quiz JSONs.
    # But wait, we have module-b/index.html etc. Let's check them.
    # In module-b/index.html:
    # <a href="../index.html" class="text-neutral-500">Punjabi (Master Cadre)</a> >
    # This is correct because module-b/index.html is 3 levels deep: subjects/punjabi/module-b/index.html. ../index.html goes to subjects/punjabi/index.html. Correct.

    # What about subjects/punjabi/module-a/index.html?
    # <a href="../index.html" class="text-neutral-500">Punjabi (Master Cadre)</a> >
    # Correct.

    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob('subjects/punjabi/**/*.html', recursive=True):
    fix_file(filepath)
