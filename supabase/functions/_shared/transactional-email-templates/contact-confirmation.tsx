/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Mystic AI"

interface ContactConfirmationProps {
  name?: string
}

const ContactConfirmationEmail = ({ name }: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>✦ Thanks for reaching out to {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={starDecor}>✦</Text>
        <Heading style={h1}>
          {name ? `Thank you, ${name}!` : 'Thank you for reaching out!'}
        </Heading>
        <Hr style={divider} />
        <Text style={text}>
          We have received your message and our mystical advisors will get back to you as soon as possible.
        </Text>
        <Text style={text}>
          In the meantime, feel free to explore your daily tarot reading or check your zodiac forecast.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team ✦</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: 'Thanks for contacting Mystic AI ✦',
  displayName: 'Contact form confirmation',
  previewData: { name: 'Sarah' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Heebo', Arial, sans-serif" }
const container = { padding: '30px 25px', textAlign: 'center' as const }
const starDecor = { fontSize: '28px', color: '#C9952B', margin: '0 0 10px', textAlign: 'center' as const }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0B0F1A',
  margin: '0 0 12px',
  fontFamily: "'Cinzel', Georgia, serif",
  textAlign: 'center' as const,
}
const divider = { borderColor: '#C9952B', borderWidth: '1px 0 0', margin: '0 auto 20px', width: '60px' }
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
