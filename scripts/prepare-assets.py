from pathlib import Path
import re
import base64

root = Path(r"D:\Github\sign-builder")
assets = root / "src" / "assets"
lib = root / "src" / "lib"
public = root / "public"

en_src = Path(r"C:\Users\Arian Pezeshki\Desktop\New folder (4)\EN.svg").read_text(
    encoding="utf-8"
)
fa_src = Path(r"C:\Users\Arian Pezeshki\Desktop\New folder (4)\FA.svg").read_text(
    encoding="utf-8"
)


def split_paths(svg: str):
    return re.findall(r'(<path d="[^"]+" fill="[^"]+"/>)', svg)


en_paths = split_paths(en_src)
fa_paths = split_paths(fa_src)

# EN: 0 bg, 1-3 mark, 4-8 wordmark, 9-17 text
en_base = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="411" height="172" '
    'viewBox="0 0 411 172" fill="none">\n'
    + "\n".join(en_paths[0:9])
    + "\n</svg>\n"
)

# FA: 0 bg, 1-3 mark, 9-13 wordmark (S E P E X), rest text
# Order in FA: 0 bg, 1-3 mark, 4-8 text, 9-13 wordmark, 14-18 text
fa_base = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="411" height="172" '
    'viewBox="0 0 411 172" fill="none">\n'
    + "\n".join([fa_paths[0], *fa_paths[1:4], *fa_paths[9:14]])
    + "\n</svg>\n"
)

(assets / "signature-base-en.svg").write_text(en_base, encoding="utf-8")
(assets / "signature-base-fa.svg").write_text(fa_base, encoding="utf-8")
(public / "signature-base-en.svg").write_text(en_base, encoding="utf-8")
(public / "signature-base-fa.svg").write_text(fa_base, encoding="utf-8")

# Keep separate mark/wordmark for reference
mark_paths = [re.search(r'd="([^"]+)"', p).group(1) for p in en_paths[1:4]]
word_paths = [re.search(r'd="([^"]+)"', p).group(1) for p in en_paths[4:9]]
mark_svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="101.71" height="40.6" '
    'viewBox="23.38 62.79 101.71 40.6" fill="none">\n'
    + "\n".join(f'<path d="{d}" fill="#000000"/>' for d in mark_paths)
    + "\n</svg>\n"
)
word_svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="97.62" height="22.77" '
    'viewBox="153.77 126.46 97.62 22.77" fill="none">\n'
    + "\n".join(f'<path d="{d}" fill="#000000"/>' for d in word_paths)
    + "\n</svg>\n"
)
(assets / "sepex-mark.svg").write_text(mark_svg, encoding="utf-8")
(assets / "sepex-wordmark.svg").write_text(word_svg, encoding="utf-8")


def to_data_url(svg: str) -> str:
    compact = " ".join(svg.split())
    return "data:image/svg+xml;base64," + base64.b64encode(compact.encode()).decode()


(lib / "logoData.ts").write_text(
    "export const SEPEX_MARK_DATA_URL =\n"
    f"  '{to_data_url(mark_svg)}';\n\n"
    "export const SEPEX_WORDMARK_DATA_URL =\n"
    f"  '{to_data_url(word_svg)}';\n\n"
    "export const SIGNATURE_BASE_EN_DATA_URL =\n"
    f"  '{to_data_url(en_base)}';\n\n"
    "export const SIGNATURE_BASE_FA_DATA_URL =\n"
    f"  '{to_data_url(fa_base)}';\n",
    encoding="utf-8",
)
print("base templates ready", len(en_paths), len(fa_paths))
