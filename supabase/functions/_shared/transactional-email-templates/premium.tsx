/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface PremiumInquiry {
  name?: string
  email?: string
  phone?: string
  message?: string
  submittedAt?: string
}

function PremiumEmail({ title, preview, children }: {
  title: string
  preview: string
  children: React.ReactNode
}) {
  return (
    <Html lang="he" dir="rtl">
      <Head />
      <Preview>{preview}</Preview>
      <Body dir="rtl" style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#25222b' }}>
        <Container dir="rtl" style={{ maxWidth: '560px', padding: '24px', textAlign: 'right' }}>
          <Heading as="h1" style={{ fontSize: '22px' }}>{title}</Heading>
          {children}
          <Text>צוות אסטרולוגאי</Text>
        </Container>
      </Body>
    </Html>
  )
}

const customerSubject = 'קיבלנו את הפנייה שלך לגבי מנוי פרימיום'

function CustomerConfirmation({ name }: PremiumInquiry) {
  return (
    <PremiumEmail title={customerSubject} preview="תודה על הפנייה. נחזור אליך במייל עם פרטים על המנוי.">
      <Text>{name ? `שלום ${name},` : 'שלום,'}</Text>
      <Text>תודה על ההתעניינות במנוי פרימיום של אסטרולוגאי. הפרטים הגיעו אלינו ונחזור אליך במייל בהקדם.</Text>
    </PremiumEmail>
  )
}

function SupportNotification({ name, email, phone, message, submittedAt }: PremiumInquiry) {
  const date = submittedAt ? new Date(submittedAt) : null
  const localTime = date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Jerusalem' }).format(date)
    : undefined
  return (
    <PremiumEmail title="פנייה חדשה לגבי מנוי פרימיום" preview="התקבלה פנייה מטופס הפרימיום באתר אסטרולוגאי.">
      {name && <Text><strong>שם הפונה</strong> · {name}</Text>}
      {email && <Text><strong>דואר אלקטרוני</strong> · <span dir="ltr">{email}</span></Text>}
      {phone && <Text><strong>טלפון</strong> · <span dir="ltr">{phone}</span></Text>}
      {localTime && <Text><strong>מועד הפנייה לפי שעון ישראל</strong> · {localTime}</Text>}
      {message && <Text style={{ whiteSpace: 'pre-wrap' }}><strong>הודעת הפונה</strong><br />{message}</Text>}
    </PremiumEmail>
  )
}

export const premiumConfirmation = {
  component: CustomerConfirmation,
  subject: customerSubject,
  displayName: 'אישור פניית פרימיום ללקוח',
  previewData: { name: 'נועה' },
} satisfies TemplateEntry

export const premiumNotification = {
  component: SupportNotification,
  subject: ({ name }: PremiumInquiry) => name ? `פניית פרימיום חדשה — ${name}` : 'פניית פרימיום חדשה',
  to: 'support@myastrologai.com',
  displayName: 'התראת פניית פרימיום למנהל',
  previewData: { name: 'נועה', email: 'noa@example.com', message: 'אשמח לקבל פרטים על המנוי.' },
} satisfies TemplateEntry
