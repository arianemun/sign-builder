from PIL import Image, ImageDraw
import base64
import io
from pathlib import Path

root = Path(__file__).resolve().parent.parent
assets = root / "src" / "assets"
lib = root / "src" / "lib"
public = root / "public"
assets.mkdir(parents=True, exist_ok=True)
lib.mkdir(parents=True, exist_ok=True)

W, H = 220, 100
img = Image.new("RGB", (W, H), (255, 204, 4))
d = ImageDraw.Draw(img)


def poly(pts: list[tuple[float, float]]) -> None:
    d.polygon(pts, fill=(0, 0, 0))


def scale(
    pts: list[tuple[float, float]],
    ox: float = 10,
    oy: float = 8,
    sx: float = 0.85,
    sy: float = 0.85,
) -> list[tuple[float, float]]:
    return [(ox + x * sx, oy + y * sy) for x, y in pts]


poly(scale([(36, 6), (54, 24), (36, 42), (18, 24)]))
poly(scale([(54, 12), (128, 12), (112, 34), (38, 34)]))
poly(scale([(112, 34), (156, 72), (132, 90), (88, 52)]))
poly(scale([(132, 68), (214, 68), (198, 90), (116, 90)]))
poly(scale([(214, 62), (232, 80), (214, 98), (196, 80)]))

img.save(assets / "sepex-logo-yellow.png")
img.save(public / "sepex-logo.png")

big = img.resize((440, 200), Image.Resampling.NEAREST)
buf = io.BytesIO()
big.save(buf, format="PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()

(lib / "logoData.ts").write_text(
    f"export const SEPEX_LOGO_DATA_URL =\n  'data:image/png;base64,{b64}';\n",
    encoding="utf-8",
)

print("ok", len(b64))
