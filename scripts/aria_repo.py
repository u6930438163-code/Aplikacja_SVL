#!/usr/bin/env python3
"""Audit an SVL checkout, prepare a source release, and send Aria a repository task."""
import argparse
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import zipfile

SECRET_PATTERNS = [r'sk-[A-Za-z0-9_-]{24,}', r'gh[pousr]_[A-Za-z0-9]{20,}', r'AIza[A-Za-z0-9_-]{30,}', r'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----']


def private_path(name):
    path = PurePosixPath(name)
    return (
        any(part in {'.git', '.aistudio', 'node_modules', '__pycache__', 'coverage', '.test-work', '.build-work', '.node-check', '.validation-out'} for part in path.parts)
        or name.startswith(('data/', 'bastillaos/build/', 'bastillaos/vm-gemini-4/data/'))
        or name.startswith('dist/')
        or path.name in {'.github_credentials.json', '.svl_deployments.json', '.svl_kernel_store.json', 'id_ed25519', 'id_rsa'}
        or (path.name.startswith('.env') and path.name != '.env.example')
        or path.suffix.lower() in {'.sqlite', '.db', '.pyc', '.zip', '.gz', '.qcow2', '.iso', '.log', '.lockfile'}
        or (name.startswith('exports/') and (path.suffix.lower() == '.json' or path.name.endswith('.lock')))
    )


def inventory(repo):
    result = subprocess.run(['git', '-C', str(repo), 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], capture_output=True, check=True)
    names = sorted(set(result.stdout.decode().split('\0')) - {''})
    public, excluded, secrets = [], [], []
    for name in names:
        path = repo / name
        if private_path(name) or path.is_symlink():
            excluded.append(name)
            continue
        if not path.is_file():
            continue
        if path.stat().st_size <= 2_000_000:
            try:
                text = path.read_text(encoding='utf-8')
                # Scanner's own regex strings do not contain actual credentials.
                if any(re.search(pattern, text) for pattern in SECRET_PATTERNS):
                    secrets.append(name)
            except UnicodeDecodeError:
                pass
        public.append(name)
    return {'included': public, 'excluded': excluded, 'potential_secret_files': secrets}


def ask_aria(api_url, report, repo, task=None):
    url = urllib.parse.urlsplit(api_url)
    if url.scheme not in {'http', 'https'} or not url.hostname or url.username or url.password or url.query or url.fragment:
        raise ValueError('Invalid API URL; use the address of your SVL server.')
    message = (
        '@model Aria, uporządkuj repozytorium i przygotuj je do udostępnienia. '
        'Repozytorium: mmitek515-netizen/SVL_System; lokalna ścieżka: ' + str(repo) + '. '
        'Sprawdź README, odtwarzalną instalację, testy i pakowanie. Zachowaj dane operatora lokalnie; '
        'nie dodawaj baz, historii czatu, kluczy ani migawek do publikacji. Nie wykonuj push ani publikacji. '
        'Zwróć konkretne propozycje zmian i raport, a wykonane operacje potwierdzaj wyłącznie wynikami. '
        'Wstępny audyt: ' + json.dumps({'source_files': len(report['included']), 'excluded_runtime_files': len(report['excluded']), 'potential_secret_files': report['potential_secret_files']}, ensure_ascii=False)
    )
    message = task or message.replace('mmitek515-netizen/SVL_System', 'u6930438163-code/Aplikacja_SVL')
    request = urllib.request.Request(api_url.rstrip('/') + '/api/kernel/agent', data=json.dumps({'agent': 'SI_1', 'message': message}).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    # Explicit server endpoint, no environment proxy for local service calls.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:
        with opener.open(request, timeout=60) as response:
            result = json.load(response)
        if result.get('source', '').startswith('Ollama') is False or not result.get('reply'):
            return {'status': 'failed', 'error': 'Server returned no confirmed Aria reply'}
        return {'status': 'replied', 'agent_id': 'si_1', 'engines': result.get('engines'), 'reply': result['reply']}
    except urllib.error.HTTPError as error:
        try:
            reason = json.loads(error.read()).get('error', 'request failed')
        except (ValueError, UnicodeDecodeError):
            reason = 'request failed'
        return {'status': 'unavailable', 'http_status': error.code, 'error': str(reason)[:1000]}
    except (OSError, ValueError) as error:
        return {'status': 'unavailable', 'error': str(error)[:1000]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--api-url', help='Explicit SVL server URL; sends the task to Aria (si_1).')
    parser.add_argument('--task', help='Polecenie dla Arii. Odpowiedź modelu jest propozycją, nie wykonaniem zmian.')
    parser.add_argument('--archive', type=Path, help='Write a source-only ZIP outside the repository.')
    args = parser.parse_args()
    repo = args.repo.resolve()
    report = inventory(repo)
    report['published'] = False
    if args.archive:
        archive = args.archive.resolve()
        if archive.is_relative_to(repo):
            parser.error('Archive must be outside the repository.')
        if report['potential_secret_files']:
            print(json.dumps(report, indent=2, ensure_ascii=False))
            return 1
        archive.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
            for name in report['included']:
                output.write(repo / name, 'SVL_System/' + name)
        report['archive'] = str(archive)
    if args.api_url:
        report['aria'] = ask_aria(args.api_url, report, repo, args.task)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if report['potential_secret_files'] or (args.api_url and report.get('aria', {}).get('status') != 'replied') else 0


if __name__ == '__main__':
    sys.exit(main())
