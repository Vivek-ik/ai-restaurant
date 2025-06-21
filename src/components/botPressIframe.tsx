// src/components/BotpressIframe.js
import React from 'react';

export default function BotpressIframe() {
  return (
    <iframe
      src="https://cdn.botpress.cloud/webchat/v0?botId=order-bot"
      width="400"
      height="600"
      style={{
        border: 'none',
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
      allow="microphone; clipboard-write" // Allow permissions if using voice/chat input
      title="Shrimaya Assistant"
    />
  );
}
