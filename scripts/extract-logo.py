from PIL import Image
import base64
import io
from pathlib import Path

root = Path(__file__).resolve().parent.parent
en = Image.open(root / "public" / "template-en.png").convert("RGB")

# Fuller crop including diamond accents above/below the zigzag
logo = en.crop((2, 20, 125, 150))
px = logo.load()
for y in range(logo.height):
    for x in range(logo.width):
        r, g, b = px[x, y]
        if r > 170 and g > 130 and b < 90:
            px[x, y] = (255, 204, 4)
        elif (r + g + b) / 3 < 110:
            px[x, y] = (0, 0, 0)

logo.save(root / "src" / "assets" / "sepex-logo-yellow.png")
logo.save(root / "public" / "sepex-logo.png")

big = logo.resize((logo.width * 3, logo.height * 3), Image.Resampling.NEAREST)
buf = io.BytesIO()
big.save(buf, format="PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
(root / "src" / "lib" / "logoData.ts").write_text(
    f"export const SEPEX_LOGO_DATA_URL =\n  'data:image/png;base64,{b64}';\n",
    encoding="utf-8",
)
print("cropped", logo.size, "b64", len(b64))
