import { Resvg } from '@resvg/resvg-js'
import fs from 'node:fs'
import path from 'node:path'

const outDir = 'public/signature'
fs.mkdirSync(outDir, { recursive: true })

const faMark = `<svg xmlns="http://www.w3.org/2000/svg" width="204" height="82" viewBox="285.84 62.79 101.71 40.6" fill="none"><path d="M319.82 83.4502L285.92 69.2602C285.84 75.1702 285.84 75.7202 285.84 81.6402L320.22 96.5402C331.02 92.0402 343.32 86.8402 353.65 82.5102C359.33 84.8802 381.4 94.1002 387.55 96.7002V84.4002L353.73 69.1802C353.73 69.1802 329.68 79.2702 319.83 83.4502" fill="#000"/><path d="M353.33 90.3099L337.87 96.7699L353.33 103.24L353.56 103.39L369.25 96.7699L353.56 90.1499L353.33 90.3099Z" fill="#000"/><path d="M335.19 69.33L319.74 62.79L304.21 69.33L319.74 75.8L335.19 69.33Z" fill="#000"/></svg>`

const enMark = `<svg xmlns="http://www.w3.org/2000/svg" width="204" height="82" viewBox="23.38 62.79 101.71 40.6" fill="none"><path d="M57.3599 83.4502L23.4599 69.2602C23.3799 75.1702 23.3799 75.7202 23.3799 81.6402L57.7599 96.5402C68.5599 92.0402 80.8599 86.8402 91.1899 82.5102C96.8699 84.8802 118.94 94.1002 125.09 96.7002V84.4002L91.2699 69.1802C91.2699 69.1802 67.2199 79.2702 57.3699 83.4502" fill="#000"/><path d="M90.8597 90.3099L75.4097 96.7699L90.8597 103.24L91.0997 103.39L106.79 96.7699L91.0997 90.1499L90.8597 90.3099Z" fill="#000"/><path d="M72.73 69.33L57.28 62.79L41.75 69.33L57.28 75.8L72.73 69.33Z" fill="#000"/></svg>`

const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" width="196" height="46" viewBox="153.77 126.46 97.62 22.77" fill="none"><path d="M193.8 130.54H205.67V135.38L193.8 137.94V149.19H197.92V141.03L209.8 138.52V126.46H193.8V130.54Z" fill="#000"/><path d="M173.8 149.19H189.76V145.11H177.88V140H189.76V135.83H177.88V130.54H189.76V126.46H173.8V149.19Z" fill="#000"/><path d="M213.83 149.19H229.79V145.11H217.95V140H229.79V135.83H217.95V130.54H229.79V126.46H213.83V149.19Z" fill="#000"/><path d="M251.39 126.47H246.68L242.65 133.64L238.57 126.47H233.87L240.28 137.85L233.87 149.19L238.53 149.23L242.65 141.97L246.73 149.23L251.39 149.19L244.98 137.85L251.39 126.47Z" fill="#000"/><path d="M153.77 138.52L165.65 141.03V145.11H153.77V149.19H165.65H169.73V137.94L157.89 135.38V130.54H169.73V126.47H153.77V138.52Z" fill="#000"/></svg>`

const jobs = [
  ['mark-fa.png', faMark, 204],
  ['mark-en.png', enMark, 204],
  ['wordmark.png', wordmark, 196],
]

for (const [name, svg, width] of jobs) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
  const png = resvg.render().asPng()
  fs.writeFileSync(path.join(outDir, name), png)
  console.log(name, png.length)
}
