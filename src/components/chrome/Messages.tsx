'use client';

// Ports the `.fx-messages` block from base.html — Django's messages
// framework replaced by MessageContext, but the markup/classes/dismiss
// behavior (auto-dismiss handled in MessageContext) are unchanged.

import { useMessages } from '@/context/MessageContext';

export default function Messages() {
  const { messages, dismissMessage } = useMessages();

  return (
    <div className="fx-messages">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`fx-message ${m.tag}`}
          onClick={() => dismissMessage(m.id)}
          role="status"
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}
