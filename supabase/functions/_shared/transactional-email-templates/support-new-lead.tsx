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
  Section,
} from 'npm:@react-email/components@0.0.22'

import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Mystic AI"

interface SupportNewLeadProps {
  name?: string
  email?: string
  phone?: string
  interest?: string
  message?: string
  submittedAt?: string
}

const SupportNewLeadEmail = ({
  name,
  email,
  phone,
  interest,
  message,
  submittedAt,
}: SupportNewLeadProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>✦ New contact form submission from {name || 'a visitor'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={starDecor}>✦</Text>
        <Heading style={h1}>New Lead Submitted</Heading>
        <Hr style={divider} />
        <Text style={intro}>
          A new contact form submission has been received on {SITE_NAME}.
        </Text>

        <Section style={card}>
          <Row label="Name" value={name} />
          <Row label="Email" value={email} />
          <Row label="Phone" value={phone} />
          <Row label="Interest" value={interest} />
          <Row label="Submitted" value={submittedAt} />
        </Section>

        {message ? (
          <Section style={messageCard}>
            <Text style={messageLabel}>Message</Text>
            <Text style={messageText}>{message}</Text>
          </Section>
        ) : null}

        <Text style={footer}>— {SITE_NAME} contact form ✦</Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value?: string }) => (
  <Text style={rowText}>
    <span style={rowLabel}>{label}: </span>
    <span style={rowValue}>{value && value.trim().length > 0 ? value : '—'}</span>
  </Text>
)

export const template = {
  component: SupportNewLeadEmail,
  subject: (data: Record<string, any>) =>
    `✦ New lead${data?.name ? ` — ${data.name}` : ''}${data?.interest ? ` (${data.interest})` : ''}`,
  displayName: 'Support: new lead notification',
  to: 'support@myastrologai.com',
  previewData: {
    name: 'Sarah Cohen',
    email: 'sarah@example.com',
    phone: '+972500000000',
    interest: 'astrology',
    message: 'I would love a full natal chart reading.',
    submittedAt: '2026-04-28 14:32 UTC',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Heebo', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const starDecor = { fontSize: '28px', color: '#C9952B', margin: '0 0 10px', textAlign: 'center' as const }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#0B0F1A',
  margin: '0 0 12px',
  fontFamily: "'Cinzel', Georgia, serif",
  textAlign: 'center' as const,
}
const divider = { borderColor: '#C9952B', borderWidth: '1px 0 0', margin: '0 auto 20px', width: '60px' }
const intro = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const card = {
  backgroundColor: '#F7F4EC',
  border: '1px solid #E7DFC9',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '0 0 16px',
}
const rowText = { fontSize: '14px', color: '#0B0F1A', lineHeight: '1.7', margin: '0 0 6px' }
const rowLabel = { color: '#7a6b3d', fontWeight: 'bold' as const }
const rowValue = { color: '#0B0F1A' }
const messageCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #E7DFC9',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '0 0 20px',
}
const messageLabel = {
  fontSize: '12px',
  color: '#7a6b3d',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 8px',
}
const messageText = {
  fontSize: '14px',
  color: '#0B0F1A',
  lineHeight: '1.6',
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '20px 0 0', textAlign: 'center' as const }
