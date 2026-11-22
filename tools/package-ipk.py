#!/usr/bin/env python3
"""Build a reproducible OpenWrt tar-format IPK without external dependencies."""
from pathlib import Path
import gzip
import hashlib
import io
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.0.0-r5'
EPOCH = 0

def archive(files):
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode='w', format=tarfile.GNU_FORMAT) as tar:
        for name, (data, mode) in sorted(files.items()):
            info = tarfile.TarInfo('./' + name)
            info.size = len(data)
            info.mode = mode
            info.uid = info.gid = 0
            info.mtime = EPOCH
            tar.addfile(info, io.BytesIO(data))
    return gzip.compress(output.getvalue(), mtime=EPOCH)

def payload():
    files = {}
    for folder, prefix in [('htdocs', 'www'), ('ucode', 'usr/share/ucode/luci'), ('root', '')]:
        for path in sorted((ROOT / folder).rglob('*')):
            if path.is_file():
                name = '/'.join(filter(None, [prefix, path.relative_to(ROOT / folder).as_posix()]))
                mode = 0o755 if 'uci-defaults' in path.parts else 0o644
                files[name] = (path.read_bytes(), mode)
    return files

def build(destination):
    files = payload()
    data = archive(files)
    control = ('Package: luci-theme-tealdark\nVersion: ' + VERSION + '\n'
               'Architecture: all\nMaintainer: TealDark project\n'
               'Depends: luci-base\nSection: luci\nPriority: optional\n'
               'License: Apache-2.0\n'
               'Installed-Size: ' + str(len(gzip.decompress(data))) + '\n'
               'Description: TealDark theme for modern ucode-based LuCI\n'
               'Source: https://github.com/ozgunokan/luci-theme-tealdark\n')
    scripts = {'control': (control.encode(), 0o644)}
    for script in ['postinst', 'postrm']:
        scripts[script] = ((ROOT / 'tools/ipk' / script).read_bytes(), 0o755)
    result = archive({'debian-binary': (b'2.0\n', 0o644),
                      'control.tar.gz': (archive(scripts), 0o644),
                      'data.tar.gz': (data, 0o644)})
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(result)
    # Re-read the actual result and compare every installed byte and permission.
    with tarfile.open(destination, 'r:gz') as outer:
        assert sorted(outer.getnames()) == ['./control.tar.gz', './data.tar.gz', './debian-binary']
        assert outer.extractfile('./debian-binary').read() == b'2.0\n'
        with tarfile.open(fileobj=outer.extractfile('./data.tar.gz'), mode='r:gz') as inner:
            assert len(inner.getmembers()) == len(files)
            for member in inner.getmembers():
                expected, mode = files[member.name.removeprefix('./')]
                assert inner.extractfile(member).read() == expected
                assert member.uid == member.gid == 0 and member.mode == mode
    print(destination, hashlib.sha256(result).hexdigest(), 'payload files:', len(files))
    return result

if __name__ == '__main__':
    build(Path(sys.argv[1]) if len(sys.argv) > 1 else Path('luci-theme-tealdark_' + VERSION + '_all.ipk'))
