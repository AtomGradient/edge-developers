---
sidebar_position: 7
title: Chat & Voice
---

# Chat and voice testing

Chat and voice pages test a loaded model before export or app integration.

## Chat

Route: `/chat`

Chat is the multi-modal test page for the currently loaded model.

Supported modes:

| Mode | Input | Output |
| --- | --- | --- |
| LLM | Text | Streaming text |
| VLM | Image plus text | Streaming text |
| STT | Audio | Transcript text |
| TTS | Text | Generated audio |

Key features:

- Streaming output for text models.
- Multi-turn message history.
- System prompt configuration.
- Temperature and parameter controls.
- Image picker for vision models.
- Audio upload or recording for speech-to-text models.
- Speaker selection or voice instruction when supported by the TTS model.

Use Chat immediately after loading or optimizing a model. It gives a quick qualitative check before running formal validation.

## Duplex Chat

Route: `/duplex`

Duplex Chat is the expert-mode voice conversation page.

Key features:

- Uses ASR, LLM, and TTS models together.
- Supports spoken input and spoken output.
- Provides model slots for the three required model categories.
- Supports continuous conversation-style testing in builds where voice duplex is enabled.

Use Duplex Chat when your app needs a full voice interaction loop. Test it before exporting or integrating the same model set in an application.

## Testing checklist

- Confirm the expected model category is loaded.
- Start with a short prompt or short audio clip.
- Check first response latency.
- Check output quality and failure messages.
- Run the same prompts after optimization and compare behavior.
- For voice workflows, verify the selected ASR, LLM, and TTS models together.
