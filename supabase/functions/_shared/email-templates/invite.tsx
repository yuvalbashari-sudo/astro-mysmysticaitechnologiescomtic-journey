/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>✦ You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={starDecor}>✦</Text>
        <Heading style={h1}>You've Been Invited</Heading>
        <Hr style={divider} />
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          ✦ Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
const link = { color: '#C9952B', textDecoration: 'underline' }
const button = {
  backgroundColor: '#C9952B',
  color: '#0B0F1A',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  fontFamily: "'Heebo', Arial, sans-serif",
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
