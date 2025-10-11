export interface IPostmarkEmailAddress {
  Email: string;
  Name: string;
  MailboxHash: string;
}

export interface IPostmarkAttachment {
  Name: string;
  Content: string;
  ContentType: string;
  ContentLength: number;
  ContentID: string;
}

export interface IPostmarkHeader {
  Name: string;
  Value: string;
}

export interface IPostmarkInboundWebhook {
  From: string;
  MessageStream: string;
  FromName: string;
  FromFull: IPostmarkEmailAddress;
  To: string;
  ToFull: IPostmarkEmailAddress[];
  Cc?: string;
  CcFull?: IPostmarkEmailAddress[];
  Bcc?: string;
  BccFull?: IPostmarkEmailAddress[];
  OriginalRecipient: string;
  ReplyTo?: string;
  Subject: string;
  MessageID: string;
  Date: string;
  MailboxHash: string;
  TextBody: string;
  HtmlBody: string;
  StrippedTextReply?: string;
  Tag?: string;
  Headers: IPostmarkHeader[];
  Attachments?: IPostmarkAttachment[];
}

export interface IPostmarkMessage {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  strippedTextReply?: string;
  timestamp: string;
  type: "email";
  replyTo?: string;
  cc?: string[];
  attachments?: IPostmarkAttachment[];
  mailboxHash: string;
  messageStream: string;
  inReplyTo?: string;
  references?: string;
}
