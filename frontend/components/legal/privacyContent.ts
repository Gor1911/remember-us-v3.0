import type { LegalSection } from '@/components/legal/legalTypes';

export const PRIVACY_SECTIONS: LegalSection[] = [
  { id: 'who-we-are', title: 'Who we are', summary: 'The identity of the data controller, [Company legal name], at [Company address].' },
  { id: 'collect', title: 'Information we collect', summary: 'The categories of personal information collected when you use the service.' },
  { id: 'use', title: 'How we use information', summary: 'The purposes for which information is used.' },
  { id: 'sharing', title: 'Sharing and disclosure', summary: 'When and with whom information may be shared.' },
  { id: 'retention', title: 'Data retention', summary: 'How long information is kept.' },
  { id: 'rights', title: 'Your rights (GDPR and CCPA)', summary: 'The rights available to you over your personal information.' },
  { id: 'deleting', title: 'Deleting your account', summary: 'You can delete your account from your dashboard, which permanently removes the memorials you created.' },
  { id: 'cookies', title: 'Cookies and local storage', summary: 'Your login token is stored in your browser’s local storage so you stay signed in.' },
  { id: 'children', title: 'Children’s privacy', summary: 'How the service treats information relating to children.' },
  { id: 'changes', title: 'Changes to this policy', summary: 'How updates to this policy are made and communicated.' },
  { id: 'contact', title: 'Contact', summary: 'How to reach us at [Contact email].' },
];
