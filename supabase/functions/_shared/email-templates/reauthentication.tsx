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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>✦ Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={starDecor}>✦</Text>
        <Heading style={h1}>Confirm Reauthentication</Heading>
        <Hr style={divider} />
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#C9952B',
  margin: '0 0 30px',
  letterSpacing: '4px',
  textAlign: 'center' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
