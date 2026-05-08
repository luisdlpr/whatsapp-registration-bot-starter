import {
  WhatsAppChange,
  WhatsAppWebhookPayload,
} from "./src/types/whatsapp.js";

const incomingMessageNotOptedUsernames: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    contacts: [
      {
        profile: {
          name: "test user name",
        },
        wa_id: "16315551181",
        user_id: "US.13491208655302741918",
      },
    ],
    messages: [
      {
        id: "ABGGFlA5Fpa",
        timestamp: "1504902988",
        from: "16315551181",
        from_user_id: "US.13491208655302741918",
        type: "text",
        text: {
          body: "this is a text message",
        },
      },
    ],
  },
};

const incomingMessageOptedUsernamesNoPhone: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    contacts: [
      {
        profile: {
          name: "test user name",
          username: "@testusername",
        },
        user_id: "US.13491208655302741918",
      },
    ],
    messages: [
      {
        id: "ABGGFlA5Fpa",
        timestamp: "1504902988",
        from_user_id: "US.13491208655302741918",
        type: "text",
        text: {
          body: "this is a text message",
        },
      },
    ],
  },
};

const incomingMessageOptedUsernamesHasPhone: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    contacts: [
      {
        profile: {
          name: "test user name",
          username: "@testusername",
        },
        wa_id: "16315551181",
        user_id: "US.13491208655302741918",
      },
    ],
    messages: [
      {
        id: "ABGGFlA5Fpa",
        timestamp: "1504902988",
        from: "16315551181",
        from_user_id: "US.13491208655302741918",
        type: "text",
        text: {
          body: "this is a text message",
        },
      },
    ],
  },
};

const outboundMessageSentNotOptedUsernames: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "sent",
        timestamp: "1504902988",
        recipient_id: "16315551181",
        conversation: {
          id: "CONVERSATION_ID",
          expiration_timestamp: "1504903988",
          origin: {
            type: "marketing",
          },
        },
        pricing: {
          billable: true,
          pricing_model: "PMP",
          type: "regular",
          category: "marketing",
        },
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
        },
        wa_id: "16315551181",
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const outboundMessageSentOptedUsernamesNoPhone: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "sent",
        timestamp: "1504902988",
        recipient_id: "16315551181",
        conversation: {
          id: "CONVERSATION_ID",
          expiration_timestamp: "1504903988",
          origin: {
            type: "marketing",
          },
        },
        pricing: {
          billable: true,
          pricing_model: "PMP",
          type: "regular",
          category: "marketing",
        },
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
        },
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const outboundMessageSentOptedUsernamesHasPhone: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "sent",
        timestamp: "1504902988",
        recipient_id: "16315551181",
        conversation: {
          id: "CONVERSATION_ID",
          expiration_timestamp: "1504903988",
          origin: {
            type: "marketing",
          },
        },
        pricing: {
          billable: true,
          pricing_model: "PMP",
          type: "regular",
          category: "marketing",
        },
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
        },
        wa_id: "16315551181",
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const outboundMessageDeliveredNotOptedUsernames: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "delivered",
        timestamp: "1504902988",
        recipient_id: "16315551181",
        conversation: {
          id: "CONVERSATION_ID",
          expiration_timestamp: "1504903988",
          origin: {
            type: "marketing",
          },
        },
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
        },
        wa_id: "16315551181",
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const outboundMessageDeliveredOptedUsernamesNoPhone: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "delivered",
        timestamp: "1504902988",
        recipient_id: "16315551181",
        conversation: {
          id: "CONVERSATION_ID",
          expiration_timestamp: "1504903988",
          origin: {
            type: "marketing",
          },
        },
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
          username: "@testusername",
        },
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const outboundMessageDeliveredOptedUsernamesHasPhone: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "delivered",
        timestamp: "1504902988",
        recipient_id: "16315551181",
        conversation: {
          id: "CONVERSATION_ID",
          expiration_timestamp: "1504903988",
          origin: {
            type: "marketing",
          },
        },
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
          username: "@testusername",
        },
        wa_id: "16315551181",
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const outboundMessageReadNotOptedUsernames: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "read",
        timestamp: "1504902988",
        recipient_id: "16315551181",
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
        },
        wa_id: "16315551181",
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const outboundMessageReadOptedUsernamesNoPhone: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "read",
        timestamp: "1504902988",
        recipient_id: "16315551181",
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
          username: "@testusername",
        },
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const outboundMessageReadOptedUsernamesHasPhone: WhatsAppChange = {
  field: "messages",
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "16505551111",
      phone_number_id: "123456123",
    },
    statuses: [
      {
        id: "ABGGFlA5Fpa",
        status: "read",
        timestamp: "1504902988",
        recipient_id: "16315551181",
      },
    ],
    contacts: [
      {
        profile: {
          name: "test user name",
          username: "@testusername",
        },
        wa_id: "16315551181",
        user_id: "US.13491208655302741918",
      },
    ],
  },
};

const fullWebhookMessageInbound: WhatsAppWebhookPayload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "923939957342466",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15556421459",
              phone_number_id: "1113897788473343",
            },
            contacts: [
              {
                profile: {
                  name: "luis",
                },
                wa_id: "61466682252",
                user_id: "AU.824737447359967",
              },
            ],
            messages: [
              {
                from: "61466682252",
                from_user_id: "AU.824737447359967",
                id: "wamid.HBgLNjE0NjY2ODIyNTIVAgASGBQzQTY0MThGMTFGMjEyQzY1MjVGNgA=",
                timestamp: "1777879954",
                text: {
                  body: "gf",
                },
                type: "text",
              },
            ],
          },
          field: "messages",
        },
      ],
    },
  ],
};

const fullWebhookMessageOutbound: WhatsAppWebhookPayload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "923939957342466",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15556421459",
              phone_number_id: "1113897788473343",
            },
            contacts: [
              {
                wa_id: "61466682252",
                user_id: "AU.824737447359967",
              },
            ],
            statuses: [
              {
                id: "wamid.HBgLNjE0NjY2ODIyNTIVAgARGBJDNENDMzNCMjg3OEY5ODlFMEMA",
                status: "sent",
                timestamp: "1777879975",
                recipient_id: "61466682252",
                recipient_user_id: "AU.824737447359967",
                pricing: {
                  billable: false,
                  pricing_model: "PMP",
                  category: "service",
                  type: "free_customer_service",
                },
              },
            ],
          },
          field: "messages",
        },
      ],
    },
  ],
};

export const testMessageWebhooks = [];
