export interface GuideStep {
  id: string
  title: string
  steps: string[]
}

export const INSTALL_GUIDES: GuideStep[] = [
  {
    id: 'gmail',
    title: 'Gmail (وب)',
    steps: [
      'امضای HTML را از این صفحه کپی کنید.',
      'وارد Gmail شوید و روی Settings (چرخ‌دنده) → See all settings کلیک کنید.',
      'در تب General به بخش Signature بروید و Create new را بزنید.',
      'نام امضا را وارد کنید، داخل باکس امضا کلیک کنید و Ctrl+V (یا Cmd+V) بزنید.',
      'در پایین صفحه Save Changes را بزنید و امضا را برای ایمیل‌های جدید انتخاب کنید.',
    ],
  },
  {
    id: 'outlook-desktop',
    title: 'Microsoft Outlook (دسکتاپ)',
    steps: [
      'امضا را از این صفحه کپی کنید.',
      'در Outlook به File → Options → Mail → Signatures بروید.',
      'New را بزنید و یک نام برای امضا انتخاب کنید.',
      'داخل ادیتور امضا کلیک کنید و Paste کنید.',
      'امضا را برای New messages (و در صورت نیاز Replies/Forwards) تنظیم و OK بزنید.',
    ],
  },
  {
    id: 'outlook-web',
    title: 'Outlook در وب',
    steps: [
      'امضا را کپی کنید.',
      'وارد Outlook وب شوید و Settings → Account → Signatures را باز کنید.',
      'امضای جدید بسازید، محتوا را Paste کنید و ذخیره کنید.',
      'امضا را به‌عنوان پیش‌فرض ایمیل‌های جدید انتخاب کنید.',
    ],
  },
  {
    id: 'apple-mail',
    title: 'Apple Mail (مک)',
    steps: [
      'امضا را کپی کنید.',
      'Apple Mail را باز کنید و به Mail → Settings → Signatures بروید.',
      'با دکمه + یک امضای جدید بسازید.',
      'محتوای قبلی را پاک کنید و Paste کنید.',
      'امضا را به اکانت ایمیل خود اختصاص دهید.',
    ],
  },
  {
    id: 'thunderbird',
    title: 'Mozilla Thunderbird',
    steps: [
      'امضا را کپی کنید.',
      'به Account Settings بروید و اکانت خود را انتخاب کنید.',
      'گزینه Use HTML را برای Signature فعال کنید.',
      'امضا را در کادر Signature بچسبانید و تنظیمات را ببندید.',
    ],
  },
]
