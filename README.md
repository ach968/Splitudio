![icon](https://splitudio-iota.vercel.app/favicon.ico)
# Splitudio - Interactive Audio to MIDI and Sheet Music Converter   

**Splitudio** is a web application designed to help users split audio files into individual stems (such as vocals, drums, bass, and other instruments) using Facebook's [demucs](https://github.com/facebookresearch/demucs) stem splitting models. 

## Features

- 2, 4, and 6 stem separation
- Fast and accurate stem separation
- Download separated stems individually
- User-friendly interface

---

## Getting Started

### 1. Visit the App

Go to [https://splitudio-iota.vercel.app/](https://splitudio-iota.vercel.app/) in your web browser.

### 2. Upload Your Audio and choose model

- Click the "Upload" button or drag and drop your audio file into the upload area.
- Supported formats: MP3, WAV, FLAC, and more.
- Choose between the 2, 4 or 6 stem models

### 3. Download Stems

- Once processing is complete, preview or download each stem individually.

### Sample song:
Want a quick showcase of Splitudio capabilities? Here is a popular song split entirely using the app: [check it out](https://splitudio-iota.vercel.app//editor/f59c2e12-1f1d-4ff4-98e3-68ef354ef520).

---

## Technologies Used

- **Frontend:** NextJS with shadcn and Tailwind
- **Backend:** Firestore, Google Cloud Functions, Google Cloud Storage
- **Hosting:** Vercel
- **Tools:** [demucs](https://github.com/facebookresearch/demucs) for stem separation and [basic pitch](https://github.com/spotify/basic-pitch) for mp3 to midi conversion
