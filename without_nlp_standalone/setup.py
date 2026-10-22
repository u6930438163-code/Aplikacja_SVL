from setuptools import setup, find_packages

setup(
    name="without_nlp_engine",
    version="8.5.5",
    author="Astyria, Alex, Aurelius (SVL Kernel)",
    author_author_email="astyria@kernel.svl",
    description="Lokalny uniwersalny silnik komunikacji zero-NLP oparty na Wektorze Fazowym Eulera i Hiperprzestrzeni Binarnej",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/u6930438163-code/SVL_Kernel",
    packages=find_packages(),
    py_modules=["without_nlp_core"],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    entry_points={
        "console_scripts": [
            "without-nlp=without_nlp_core:main",
        ],
    },
)
