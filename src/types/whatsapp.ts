export interface WhatsAppWebhookPayload {
  object: string; // CHECK what subscription triggered the webhook
  entry: WhatsAppEntry[]; // can have multiple for multi tenant etc
}

// Each entry represents one WhatsApp Business Account (WABA) event batch.
export interface WhatsAppEntry {
  id: string; // WABA ID
  changes: WhatsAppChange[]; // specific update type - we only care about messages
}

// specific update event
export interface WhatsAppChange {
  field: string; // type of change
  value: {
    messaging_product: string; // CHECK whatsapp
    metadata: {
      // details for the number we received it at. use this for
      // sending out messages
      display_phone_number: string; // human readable number
      phone_number_id: string; // internal id of number
    };
    contacts?: any[]; // optional/unreliable field

    // next two are mutually exclusive
    // not necessarily in-order, check timestamps

    // only present for events regarding incoming messages
    // multiple can be present in one request
    messages?: Message[];
    // only present for events with outbound messages
    // lifecycle updates
    statuses?: Status[];
  };
}

export type Message =
  | TextMessage
  | ImageMessage
  | InteractiveMessage
  | LocationMessage
  | UnknownMessage;

type BaseMessage = {
  id: string;
  from_user_id: string; // user id
  from?: string; // number - looks like its getting depricated for above
  timestamp: string;
  type: string;
  context?: {
    from?: string;
    id?: string;
  };
};

export type TextMessage = BaseMessage & {
  type: "text";
  text: {
    body: string;
  };
};

export type ImageMessage = BaseMessage & {
  type: "image";
  image: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
};

export type InteractiveMessage = BaseMessage & {
  type: "interactive";
  interactive: {
    type: "button_reply" | "list_reply";
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
};

export type LocationMessage = BaseMessage & {
  type: "location";
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
};

// fallback so your app never breaks on new types
export type UnknownMessage = BaseMessage & {
  type: string;
  [key: string]: unknown;
};

export interface Status {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  recipient_user_id?: string;

  conversation?: {
    id: string;
    expiration_timestamp: string;
    origin: {
      type: string;
    };
  };

  pricing?: {
    billable: boolean;
    pricing_model: string;
    type: string;
    category: string;
  };

  errors?: Array<{
    code: number;
    title: string;
    message?: string;
  }>;
}

export interface SendMessageContext {
  message_id: string;
}

export interface SendMessagePayload {
  messaging_product: "whatsapp";
  to?: string;
  recipient: string; // new field for bsuid's apparently defaults to 'to' if it exists
  context?: SendMessageContext;
  type: "text";
  text: { body: string };
}
