"""IPK byte/permission checks and isolated lifecycle tests; no router access."""
from pathlib import Path
import importlib.util
import os
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('package_ipk', root / 'tools/package-ipk.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
with tempfile.TemporaryDirectory() as directory:
    temp = Path(directory)
    assert builder.build(temp / 'first.ipk') == builder.build(temp / 'second.ipk')
    # Mock UCI records writes; this never invokes system UCI or modifies settings.
    uci = temp / 'uci'
    uci.write_text('#!/bin/sh\nif [ "$1" = "-q" ] && [ "$2" = get ]; then\n'
                   ' printf "%s\\n" "$MOCK_CURRENT_THEME"\nelse\n'
                   ' printf "%s\\n" "$*" >> "$MOCK_UCI_LOG"\nfi\n')
    uci.chmod(0o755)
    log = temp / 'calls'
    env = dict(os.environ, PATH=str(temp) + os.pathsep + os.environ['PATH'],
               MOCK_UCI_LOG=str(log), MOCK_CURRENT_THEME='/luci-static/tealdark')
    def run(name, args=(), instroot=''):
        log.write_text('')
        subprocess.run(['sh', str(root / 'tools/ipk' / name), *args],
                       env=dict(env, IPKG_INSTROOT=instroot), check=True)
        return log.read_text()
    assert run('postinst', instroot='/offline') == ''
    assert run('postrm', instroot='/offline') == ''
    assert run('postrm', ('upgrade',)) == ''
    assert "set luci.themes.TealDark=/luci-static/tealdark" in run('postinst')
    assert 'set luci.main.mediaurlbase=/luci-static/bootstrap' in run('postrm', ('remove',))
    env['MOCK_CURRENT_THEME'] = '/luci-static/bootstrap'
    assert 'set luci.main.mediaurlbase' not in run('postrm', ('remove',))
print('REPRODUCIBLE_IPK_PAYLOAD_PERMISSIONS_AND_ISOLATED_LIFECYCLE_PASSED')
