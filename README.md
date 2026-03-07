<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/acb7e52b-e4ca-4363-8c8f-9c0fdb2e16c3

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
   - By default, the app uses the Gemini model `google/gemini-2.5-flash-image`.
   - Override the model by setting `AI_MODEL` (e.g. `google/gemini-2.5-flash-image`).
3. Start the dev server:
   `npm run dev`

---

## Features

- **Upload & optimize**: Drag & drop or select a photo (JPG/PNG, max 10MB).
- **Crop to passport dimensions** with a live preview.
- **Background removal** using Gemini image-editing model.
- **AI enhancement** for sharper, better-lit passport photos.
- **Multiple output sizes**: Choose standard passport sizes or custom dimensions.
- **Print-ready A4 layout**: Generates a printable A4 sheet with multiple copies.
- **Download as image or PDF**.

## Workflow

1. **Upload a photo** and the app will auto-optimize it for printing.
2. **Crop** to your desired passport framing.
3. **Remove background** and optionally select a solid or transparent background.
4. **Enhance** with automatic lighting/sharpness improvements.
5. **Pick a size**, number of copies, and optionally upscale for high-resolution output.
6. **Download** a single passport photo or a full A4 print layout.
