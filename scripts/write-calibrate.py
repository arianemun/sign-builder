/**
 * Open in browser via Vite to calibrate font sizes against SVG ink heights.
 * http://127.0.0.1:5173/calibrate.html
 */
from pathlib import Path

html = r"""<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Font calibrate</title>
  <style>
    @font-face {
      font-family: 'Peyda';
      src: url('/fonts/peyda/Peyda-Bold.woff2') format('woff2');
      font-weight: 700;
    }
    @font-face {
      font-family: 'Peyda';
      src: url('/fonts/peyda/Peyda-Medium.woff2') format('woff2');
      font-weight: 500;
    }
    @font-face {
      font-family: 'Peyda';
      src: url('/fonts/peyda/Peyda-Regular.woff2') format('woff2');
      font-weight: 400;
    }
    body { font-family: Helvetica, Arial, sans-serif; background:#111; color:#eee; padding:20px; }
    canvas { background:#ffcc04; margin:8px 0; }
    pre { background:#222; padding:12px; overflow:auto; }
  </style>
</head>
<body>
  <h1>Calibrate font sizes to SVG ink heights</h1>
  <canvas id="c" width="411" height="172"></canvas>
  <pre id="out"></pre>
  <script>
    async function measure(text, font, weight, targetHeight) {
      // binary search font-size so ink height ~= targetHeight
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      let lo = 6, hi = 48, best = 12
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2
        ctx.font = `${weight} ${mid}px ${font}`
        const m = ctx.measureText(text)
        const h = (m.actualBoundingBoxAscent || mid * 0.8) + (m.actualBoundingBoxDescent || mid * 0.2)
        if (Math.abs(h - targetHeight) < 0.05) { best = mid; break }
        if (h > targetHeight) hi = mid
        else lo = mid
        best = mid
      }
      ctx.font = `${weight} ${best}px ${font}`
      const m = ctx.measureText(text)
      return {
        fontSize: +best.toFixed(2),
        inkH: +((m.actualBoundingBoxAscent||0)+(m.actualBoundingBoxDescent||0)).toFixed(2),
        ascent: +(m.actualBoundingBoxAscent||0).toFixed(2),
        descent: +(m.actualBoundingBoxDescent||0).toFixed(2),
        width: +(m.width).toFixed(2),
      }
    }

    const targets = [
      ['EN name', 'Hossein Samani', 'Helvetica, Arial, sans-serif', 700, 18.98],
      ['EN title', 'Sales manager', 'Helvetica, Arial, sans-serif', 400, 9.57],
      ['EN Phone:', 'Phone:', 'Helvetica, Arial, sans-serif', 400, 7.39],
      ['EN phone#', '021-62040(454)', 'Helvetica, Arial, sans-serif', 400, 9.33],
      ['EN mobile', '0912 3366 155', 'Helvetica, Arial, sans-serif', 400, 7.35],
      ['EN Email:', 'Email:', 'Helvetica, Arial, sans-serif', 400, 7.35],
      ['EN email', 'salesmanager@sepex.net', 'Helvetica, Arial, sans-serif', 400, 9.60],
      ['EN Contact', 'Contact Us', 'Helvetica, Arial, sans-serif', 400, 6.06],
      ['EN web', 'sepex.net', 'Helvetica, Arial, sans-serif', 600, 7.08],
      ['FA name', 'حسین سامانی', 'Peyda, Tahoma, sans-serif', 700, 23.35],
      ['FA title', 'مدیر فروش', 'Peyda, Tahoma, sans-serif', 500, 10.08],
      ['FA تلفن:', 'تلفن:', 'Peyda, Tahoma, sans-serif', 400, 8.45],
      ['FA phone#', '۰۲۱-۶۲۰۴۰(۴۵۴)', 'Peyda, Tahoma, sans-serif', 400, 10.10],
      ['FA mobile', '۰۹۱۲۳۳۶۶۱۵۵', 'Peyda, Tahoma, sans-serif', 400, 7.92],
      ['FA ایمیل:', 'ایمیل:', 'Peyda, Tahoma, sans-serif', 400, 8.82],
      ['FA stay', 'با ما در ارتباط باشید', 'Peyda, Tahoma, sans-serif', 400, 7.50],
    ]

    // wait for fonts
    await document.fonts.ready
    await document.fonts.load('700 24px Peyda')
    await document.fonts.load('700 24px Helvetica')

    const rows = []
    for (const [label, text, font, weight, target] of targets) {
      const r = await measure(text, font, weight, target)
      rows.push({ label, text, target, ...r })
    }
    document.getElementById('out').textContent = JSON.stringify(rows, null, 2)

    // draw EN preview with calibrated sizes on yellow
    const canvas = document.getElementById('c')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 411, 172)
      // dim text area? leave logos
    }
    img.src = '/signature-base-en.svg'
  </script>
</body>
</html>
"""

Path(r"D:\Github\sign-builder\public\calibrate.html").write_text(html, encoding="utf-8")
print("calibrate.html written")
