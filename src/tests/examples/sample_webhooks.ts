import {
  ImageMessage,
  InteractiveMessage,
  LocationMessage,
  Message,
  Status,
  TextMessage,
  WhatsAppChange,
  WhatsAppEntry,
  WhatsAppWebhookPayload,
} from "@/types/whatsapp.js";

// ---------------------------------------------------------------------------
// Generic builder functions
// ---------------------------------------------------------------------------

function makeTextMessage(
  overrides: Partial<TextMessage> & {
    id: string;
    from_user_id: string;
    timestamp: string;
  },
): TextMessage {
  return {
    type: "text",
    text: { body: "Hello!" },
    ...overrides,
  };
}

function makeImageMessage(
  overrides: Partial<ImageMessage> & {
    id: string;
    from_user_id: string;
    timestamp: string;
  },
): ImageMessage {
  return {
    type: "image",
    image: {
      id: "img-001",
      mime_type: "image/jpeg",
      sha256: "abc123def456",
    },
    ...overrides,
  };
}

function makeInteractiveButtonReply(
  overrides: Partial<InteractiveMessage> & {
    id: string;
    from_user_id: string;
    timestamp: string;
  },
): InteractiveMessage {
  return {
    type: "interactive",
    interactive: {
      type: "button_reply",
      button_reply: { id: "btn-yes", title: "Yes" },
    },
    ...overrides,
  };
}

function makeInteractiveListReply(
  overrides: Partial<InteractiveMessage> & {
    id: string;
    from_user_id: string;
    timestamp: string;
  },
): InteractiveMessage {
  return {
    type: "interactive",
    interactive: {
      type: "list_reply",
      list_reply: {
        id: "item-1",
        title: "Option 1",
        description: "First option",
      },
    },
    ...overrides,
  };
}

function makeLocationMessage(
  overrides: Partial<LocationMessage> & {
    id: string;
    from_user_id: string;
    timestamp: string;
  },
): LocationMessage {
  return {
    type: "location",
    location: {
      latitude: -33.8688,
      longitude: 151.2093,
      name: "Sydney CBD",
      address: "Sydney NSW 2000, Australia",
    },
    ...overrides,
  };
}

function makeSentStatus(
  overrides: Partial<Status> & {
    id: string;
    recipient_id: string;
    timestamp: string;
  },
): Status {
  return {
    status: "sent",
    conversation: {
      id: "CONV_ID",
      expiration_timestamp: String(Number(overrides.timestamp) + 86400),
      origin: { type: "service" },
    },
    pricing: {
      billable: false,
      pricing_model: "PMP",
      type: "free_customer_service",
      category: "service",
    },
    ...overrides,
  };
}

function makeDeliveredStatus(
  overrides: Partial<Status> & {
    id: string;
    recipient_id: string;
    timestamp: string;
  },
): Status {
  return {
    status: "delivered",
    conversation: {
      id: "CONV_ID",
      expiration_timestamp: String(Number(overrides.timestamp) + 86400),
      origin: { type: "service" },
    },
    ...overrides,
  };
}

function makeReadStatus(
  overrides: Partial<Status> & {
    id: string;
    recipient_id: string;
    timestamp: string;
  },
): Status {
  return {
    status: "read",
    ...overrides,
  };
}

function makeFailedStatus(
  overrides: Partial<Status> & {
    id: string;
    recipient_id: string;
    timestamp: string;
  },
): Status {
  return {
    status: "failed",
    errors: [
      {
        code: 131026,
        title: "Message Undeliverable",
        message: "Recipient is not a WhatsApp user",
      },
    ],
    ...overrides,
  };
}

function makeMessagesChange(opts: {
  displayPhone?: string;
  phoneNumberId?: string;
  contacts?: WhatsAppChange["value"]["contacts"];
  messages?: Message[];
  statuses?: Status[];
}): WhatsAppChange {
  return {
    field: "messages",
    value: {
      messaging_product: "whatsapp",
      metadata: {
        display_phone_number: opts.displayPhone ?? "15556421459",
        phone_number_id: opts.phoneNumberId ?? "1113897788473343",
      },
      ...(opts.contacts ? { contacts: opts.contacts } : {}),
      ...(opts.messages ? { messages: opts.messages } : {}),
      ...(opts.statuses ? { statuses: opts.statuses } : {}),
    },
  };
}

function makeEntry(id: string, changes: WhatsAppChange[]): WhatsAppEntry {
  return { id, changes };
}

function makeWebhookPayload(entries: WhatsAppEntry[]): WhatsAppWebhookPayload {
  return { object: "whatsapp_business_account", entry: entries };
}

// ---------------------------------------------------------------------------
// Reusable contact fixtures
// ---------------------------------------------------------------------------

const contactWithPhone = {
  profile: { name: "Luis Alvarez" },
  wa_id: "61466682252",
  user_id: "AU.824737447359967",
};

const contactWithPhoneAndUsername = {
  profile: { name: "Jane Doe", username: "@janedoe" },
  wa_id: "16315551181",
  user_id: "US.13491208655302741918",
};

const contactUsernameOnly = {
  profile: { name: "Bob Smith", username: "@bobsmith" },
  user_id: "US.99988877766655544",
};

const contactNoUsernameNoPhone = {
  profile: { name: "Anonymous User" },
  user_id: "US.11122233344455566",
};

// ---------------------------------------------------------------------------
// Single-change, single-message examples (preserving original intent)
// ---------------------------------------------------------------------------

export const incomingTextNotOptedUsername: WhatsAppWebhookPayload =
  makeWebhookPayload([
    makeEntry("923939957342466", [
      makeMessagesChange({
        contacts: [contactWithPhone],
        messages: [
          makeTextMessage({
            id: "wamid.AAA001",
            from: "61466682252",
            from_user_id: "AU.824737447359967",
            timestamp: "1777879954",
            text: { body: "Hey, how are you?" },
          }),
        ],
      }),
    ]),
  ]);

export const incomingTextOptedUsernameNoPhone: WhatsAppWebhookPayload =
  makeWebhookPayload([
    makeEntry("923939957342466", [
      makeMessagesChange({
        contacts: [contactUsernameOnly],
        messages: [
          makeTextMessage({
            id: "wamid.AAA002",
            from_user_id: "US.99988877766655544",
            timestamp: "1777879960",
            text: { body: "Username-only user message" },
          }),
        ],
      }),
    ]),
  ]);

export const incomingTextOptedUsernameHasPhone: WhatsAppWebhookPayload =
  makeWebhookPayload([
    makeEntry("923939957342466", [
      makeMessagesChange({
        contacts: [contactWithPhoneAndUsername],
        messages: [
          makeTextMessage({
            id: "wamid.AAA003",
            from: "16315551181",
            from_user_id: "US.13491208655302741918",
            timestamp: "1777879970",
            text: { body: "Message from opted-in user with phone" },
          }),
        ],
      }),
    ]),
  ]);

export const incomingImageMessage: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [contactWithPhone],
      messages: [
        makeImageMessage({
          id: "wamid.AAA004",
          from: "61466682252",
          from_user_id: "AU.824737447359967",
          timestamp: "1777880000",
          image: {
            id: "img-media-001",
            mime_type: "image/jpeg",
            sha256: "deadbeef1234",
            caption: "Check this out!",
          },
        }),
      ],
    }),
  ]),
]);

export const incomingReplyToMessage: WhatsAppWebhookPayload =
  makeWebhookPayload([
    makeEntry("923939957342466", [
      makeMessagesChange({
        contacts: [contactWithPhone],
        messages: [
          makeTextMessage({
            id: "wamid.AAA005",
            from: "61466682252",
            from_user_id: "AU.824737447359967",
            timestamp: "1777880100",
            text: { body: "Replying to your last message!" },
            context: {
              from: "61466682252",
              id: "wamid.HBgLNjE0NjY2ODIyNTIVAgASGBQzQTY0MThGMTFGMjEyQzY1MjVGNgA=",
            },
          }),
        ],
      }),
    ]),
  ]);

export const incomingButtonReply: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [contactWithPhone],
      messages: [
        makeInteractiveButtonReply({
          id: "wamid.AAA006",
          from: "61466682252",
          from_user_id: "AU.824737447359967",
          timestamp: "1777880200",
          interactive: {
            type: "button_reply",
            button_reply: { id: "btn-confirm", title: "Confirm" },
          },
        }),
      ],
    }),
  ]),
]);

export const incomingListReply: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [contactWithPhone],
      messages: [
        makeInteractiveListReply({
          id: "wamid.AAA007",
          from: "61466682252",
          from_user_id: "AU.824737447359967",
          timestamp: "1777880300",
          interactive: {
            type: "list_reply",
            list_reply: {
              id: "item-pizza",
              title: "Pizza",
              description: "Pepperoni pizza",
            },
          },
        }),
      ],
    }),
  ]),
]);

export const incomingLocationMessage: WhatsAppWebhookPayload =
  makeWebhookPayload([
    makeEntry("923939957342466", [
      makeMessagesChange({
        contacts: [contactWithPhone],
        messages: [
          makeLocationMessage({
            id: "wamid.AAA008",
            from: "61466682252",
            from_user_id: "AU.824737447359967",
            timestamp: "1777880400",
            location: {
              latitude: -33.8688,
              longitude: 151.2093,
              name: "Sydney Opera House",
              address: "Bennelong Point, Sydney NSW 2000",
            },
          }),
        ],
      }),
    ]),
  ]);

export const outboundSent: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [{ wa_id: "61466682252", user_id: "AU.824737447359967" }],
      statuses: [
        makeSentStatus({
          id: "wamid.BBB001",
          recipient_id: "61466682252",
          recipient_user_id: "AU.824737447359967",
          timestamp: "1777879975",
          pricing: {
            billable: false,
            pricing_model: "PMP",
            type: "free_customer_service",
            category: "service",
          },
        }),
      ],
    }),
  ]),
]);

export const outboundDelivered: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [{ wa_id: "61466682252", user_id: "AU.824737447359967" }],
      statuses: [
        makeDeliveredStatus({
          id: "wamid.BBB001",
          recipient_id: "61466682252",
          recipient_user_id: "AU.824737447359967",
          timestamp: "1777879990",
          conversation: {
            id: "CONV_SERVICE_001",
            expiration_timestamp: "1777966390",
            origin: { type: "service" },
          },
        }),
      ],
    }),
  ]),
]);

export const outboundRead: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [{ wa_id: "61466682252", user_id: "AU.824737447359967" }],
      statuses: [
        makeReadStatus({
          id: "wamid.BBB001",
          recipient_id: "61466682252",
          recipient_user_id: "AU.824737447359967",
          timestamp: "1777880010",
        }),
      ],
    }),
  ]),
]);

export const outboundFailed: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [contactNoUsernameNoPhone],
      statuses: [
        makeFailedStatus({
          id: "wamid.BBB002",
          recipient_id: "19995550001",
          timestamp: "1777880020",
          errors: [
            {
              code: 131026,
              title: "Message Undeliverable",
              message: "Recipient phone not on WhatsApp",
            },
          ],
        }),
      ],
    }),
  ]),
]);

export const outboundMarketingSent: WhatsAppWebhookPayload = makeWebhookPayload(
  [
    makeEntry("923939957342466", [
      makeMessagesChange({
        contacts: [{ wa_id: "61466682252", user_id: "AU.824737447359967" }],
        statuses: [
          makeSentStatus({
            id: "wamid.BBB003",
            recipient_id: "61466682252",
            timestamp: "1777880030",
            conversation: {
              id: "CONV_MKT_001",
              expiration_timestamp: "1777966430",
              origin: { type: "marketing" },
            },
            pricing: {
              billable: true,
              pricing_model: "PMP",
              type: "regular",
              category: "marketing",
            },
          }),
        ],
      }),
    ]),
  ],
);

// ---------------------------------------------------------------------------
// Multi-message in a single change (burst from same user)
// ---------------------------------------------------------------------------

export const multiMessageBurst: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [contactWithPhone],
      messages: [
        makeTextMessage({
          id: "wamid.CCC001",
          from: "61466682252",
          from_user_id: "AU.824737447359967",
          timestamp: "1777881000",
          text: { body: "First message" },
        }),
        makeTextMessage({
          id: "wamid.CCC002",
          from: "61466682252",
          from_user_id: "AU.824737447359967",
          timestamp: "1777881002",
          text: { body: "Second message right after" },
        }),
        makeImageMessage({
          id: "wamid.CCC003",
          from: "61466682252",
          from_user_id: "AU.824737447359967",
          timestamp: "1777881005",
          image: {
            id: "img-media-burst",
            mime_type: "image/png",
            sha256: "cafebabe0000",
            caption: "And a photo",
          },
        }),
      ],
    }),
  ]),
]);

// ---------------------------------------------------------------------------
// Multi-status update (sent → delivered → read in one webhook call)
// ---------------------------------------------------------------------------

export const multiStatusLifecycle: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      contacts: [{ wa_id: "61466682252", user_id: "AU.824737447359967" }],
      statuses: [
        makeSentStatus({
          id: "wamid.DDD001",
          recipient_id: "61466682252",
          recipient_user_id: "AU.824737447359967",
          timestamp: "1777882000",
          conversation: {
            id: "CONV_SVC_002",
            expiration_timestamp: "1777968400",
            origin: { type: "service" },
          },
          pricing: {
            billable: false,
            pricing_model: "PMP",
            type: "free_customer_service",
            category: "service",
          },
        }),
        makeDeliveredStatus({
          id: "wamid.DDD001",
          recipient_id: "61466682252",
          recipient_user_id: "AU.824737447359967",
          timestamp: "1777882003",
          conversation: {
            id: "CONV_SVC_002",
            expiration_timestamp: "1777968403",
            origin: { type: "service" },
          },
        }),
        makeReadStatus({
          id: "wamid.DDD001",
          recipient_id: "61466682252",
          recipient_user_id: "AU.824737447359967",
          timestamp: "1777882010",
        }),
      ],
    }),
  ]),
]);

// ---------------------------------------------------------------------------
// Multiple changes in one entry (e.g. two different phone numbers on same WABA)
// ---------------------------------------------------------------------------

export const multiChangeEntry: WhatsAppWebhookPayload = makeWebhookPayload([
  makeEntry("923939957342466", [
    makeMessagesChange({
      displayPhone: "15556421459",
      phoneNumberId: "1113897788473343",
      contacts: [contactWithPhone],
      messages: [
        makeTextMessage({
          id: "wamid.EEE001",
          from: "61466682252",
          from_user_id: "AU.824737447359967",
          timestamp: "1777883000",
          text: { body: "Message to number one" },
        }),
      ],
    }),
    makeMessagesChange({
      displayPhone: "15556429999",
      phoneNumberId: "2224897788473999",
      contacts: [contactWithPhoneAndUsername],
      messages: [
        makeTextMessage({
          id: "wamid.EEE002",
          from: "16315551181",
          from_user_id: "US.13491208655302741918",
          timestamp: "1777883001",
          text: { body: "Message to number two" },
        }),
      ],
    }),
  ]),
]);

// ---------------------------------------------------------------------------
// Multiple entries (multi-tenant / multiple WABAs in one webhook delivery)
// ---------------------------------------------------------------------------

export const multiEntryMultiTenant: WhatsAppWebhookPayload = makeWebhookPayload(
  [
    makeEntry("923939957342466", [
      makeMessagesChange({
        displayPhone: "15556421459",
        phoneNumberId: "1113897788473343",
        contacts: [contactWithPhone],
        messages: [
          makeTextMessage({
            id: "wamid.FFF001",
            from: "61466682252",
            from_user_id: "AU.824737447359967",
            timestamp: "1777884000",
            text: { body: "Tenant A inbound" },
          }),
        ],
      }),
    ]),
    makeEntry("111222333444555", [
      makeMessagesChange({
        displayPhone: "442071234567",
        phoneNumberId: "9998887776665554",
        contacts: [contactWithPhoneAndUsername],
        messages: [
          makeTextMessage({
            id: "wamid.FFF002",
            from: "16315551181",
            from_user_id: "US.13491208655302741918",
            timestamp: "1777884001",
            text: { body: "Tenant B inbound" },
          }),
        ],
      }),
      makeMessagesChange({
        displayPhone: "442071234567",
        phoneNumberId: "9998887776665554",
        contacts: [
          { wa_id: "16315551181", user_id: "US.13491208655302741918" },
        ],
        statuses: [
          makeSentStatus({
            id: "wamid.FFF003",
            recipient_id: "16315551181",
            timestamp: "1777884002",
            conversation: {
              id: "CONV_B_001",
              expiration_timestamp: "1777970402",
              origin: { type: "utility" },
            },
            pricing: {
              billable: true,
              pricing_model: "PMP",
              type: "regular",
              category: "utility",
            },
          }),
        ],
      }),
    ]),
    makeEntry("666777888999000", [
      makeMessagesChange({
        displayPhone: "61299998888",
        phoneNumberId: "3331117776664443",
        contacts: [contactUsernameOnly],
        messages: [
          makeLocationMessage({
            id: "wamid.FFF004",
            from_user_id: "US.99988877766655544",
            timestamp: "1777884010",
            location: {
              latitude: 51.5074,
              longitude: -0.1278,
              name: "London",
              address: "London, UK",
            },
          }),
          makeInteractiveButtonReply({
            id: "wamid.FFF005",
            from_user_id: "US.99988877766655544",
            timestamp: "1777884015",
            interactive: {
              type: "button_reply",
              button_reply: { id: "btn-ok", title: "OK" },
            },
          }),
        ],
      }),
    ]),
  ],
);

// ---------------------------------------------------------------------------
// Mixed inbound + outbound statuses in same entry (real-world burst scenario)
// ---------------------------------------------------------------------------

export const mixedInboundAndStatuses: WhatsAppWebhookPayload =
  makeWebhookPayload([
    makeEntry("923939957342466", [
      makeMessagesChange({
        contacts: [contactWithPhone],
        messages: [
          makeTextMessage({
            id: "wamid.GGG001",
            from: "61466682252",
            from_user_id: "AU.824737447359967",
            timestamp: "1777885000",
            text: { body: "New inquiry from user" },
          }),
        ],
      }),
      makeMessagesChange({
        contacts: [{ wa_id: "61466682252", user_id: "AU.824737447359967" }],
        statuses: [
          makeDeliveredStatus({
            id: "wamid.GGG_PREV",
            recipient_id: "61466682252",
            recipient_user_id: "AU.824737447359967",
            timestamp: "1777884999",
            conversation: {
              id: "CONV_SVC_003",
              expiration_timestamp: "1777971399",
              origin: { type: "service" },
            },
          }),
          makeReadStatus({
            id: "wamid.GGG_PREV2",
            recipient_id: "61466682252",
            recipient_user_id: "AU.824737447359967",
            timestamp: "1777885001",
          }),
        ],
      }),
    ]),
  ]);

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const testMessageWebhooks: WhatsAppWebhookPayload[] = [
  incomingTextNotOptedUsername,
  incomingTextOptedUsernameNoPhone,
  incomingTextOptedUsernameHasPhone,
  incomingImageMessage,
  incomingReplyToMessage,
  incomingButtonReply,
  incomingListReply,
  incomingLocationMessage,
  outboundSent,
  outboundDelivered,
  outboundRead,
  outboundFailed,
  outboundMarketingSent,
  multiMessageBurst,
  multiStatusLifecycle,
  multiChangeEntry,
  multiEntryMultiTenant,
  mixedInboundAndStatuses,
];
