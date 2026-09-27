from pathlib import Path
import re


def parse_path_coords(d: str):
    tokens = re.findall(
        r"[MmLlHhVvCcSsQqTtAaZz]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", d
    )
    xs, ys = [], []
    i = 0
    cx = cy = 0.0
    while i < len(tokens):
        t = tokens[i]
        if t.isalpha():
            cmd = t
            i += 1
            if cmd in "Zz":
                continue
            while i < len(tokens) and not tokens[i].isalpha():
                if cmd in "MmLlTt":
                    x = float(tokens[i])
                    y = float(tokens[i + 1])
                    i += 2
                    if cmd.islower() and (xs or ys or cmd in "ml"):
                        if cmd in "mltt":
                            x += cx
                            y += cy
                    cx, cy = x, y
                    xs.append(x)
                    ys.append(y)
                    if cmd == "M":
                        cmd = "L"
                    elif cmd == "m":
                        cmd = "l"
                elif cmd in "Hh":
                    x = float(tokens[i])
                    i += 1
                    if cmd == "h":
                        x += cx
                    cx = x
                    xs.append(x)
                    ys.append(cy)
                elif cmd in "Vv":
                    y = float(tokens[i])
                    i += 1
                    if cmd == "v":
                        y += cy
                    cy = y
                    xs.append(cx)
                    ys.append(y)
                elif cmd in "Cc":
                    pts = [float(tokens[i + j]) for j in range(6)]
                    i += 6
                    if cmd == "c":
                        pts = [
                            pts[0] + cx,
                            pts[1] + cy,
                            pts[2] + cx,
                            pts[3] + cy,
                            pts[4] + cx,
                            pts[5] + cy,
                        ]
                    xs += pts[0::2]
                    ys += pts[1::2]
                    cx, cy = pts[4], pts[5]
                elif cmd in "SsQq":
                    n = 4
                    pts = [float(tokens[i + j]) for j in range(n)]
                    i += n
                    if cmd.islower():
                        pts = [
                            pts[j] + (cx if j % 2 == 0 else cy) for j in range(n)
                        ]
                    xs += pts[0::2]
                    ys += pts[1::2]
                    cx, cy = pts[-2], pts[-1]
                elif cmd in "Aa":
                    # rx ry xrot large sweep x y
                    pts = [float(tokens[i + j]) for j in range(7)]
                    i += 7
                    x, y = pts[5], pts[6]
                    if cmd == "a":
                        x += cx
                        y += cy
                    cx, cy = x, y
                    xs.append(x)
                    ys.append(y)
                else:
                    break
        else:
            i += 1
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


for label, path in [
    ("EN", Path(r"C:\Users\Arian Pezeshki\Desktop\New folder (4)\EN.svg")),
    ("FA", Path(r"C:\Users\Arian Pezeshki\Desktop\New folder (4)\FA.svg")),
]:
    text = path.read_text(encoding="utf-8")
    paths = re.findall(r'<path d="([^"]+)" fill="([^"]+)"/>', text)
    print("====", label, "paths", len(paths))
    for i, (d, fill) in enumerate(paths):
        bb = parse_path_coords(d)
        if not bb:
            continue
        x0, y0, x1, y1 = bb
        print(
            f"{i:2d} fill={fill:8s} x={x0:7.2f}-{x1:7.2f} "
            f"y={y0:7.2f}-{y1:7.2f} w={x1 - x0:6.2f} h={y1 - y0:6.2f}"
        )
