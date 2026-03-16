# Charmaine — AI Study Partner

Charmaine is an AI-powered study companion that transforms documents into interactive learning tools.

Students often struggle with large amounts of reading material. Charmaine helps by converting documents into structured study resources such as quizzes, narrated eBooks, and interactive AI tutoring.

The system extracts text from PDFs and images, allows users to review and edit content, and then generates learning tools powered by AI.

---

# Problem

Students frequently face several challenges when studying from documents:

- Large PDFs and notes are difficult to review quickly
- Passive reading leads to poor retention
- Students lack interactive explanations when studying alone
- Study materials are not always accessible when offline
- Converting notes into quizzes or audio content requires multiple tools

Traditional study workflows are fragmented and inefficient.

---

# Solution

Charmaine provides a unified AI-powered study platform that converts documents into interactive learning experiences.

The application allows users to:

- Extract text from PDFs and images
- Clean and edit extracted notes
- Automatically generate quizzes
- Convert notes into narrated eBooks
- Interact with an AI voice tutor that can explain concepts

The system also supports offline reading using device-based text-to-speech when internet connectivity is unavailable.

---

# Key Features

## Document Text Extraction

### PDF to Text
Import PDF files and extract readable text for study.

### Image to Text (OCR)
Extract text from images using on-device optical character recognition.

### Unified Text Editor
Both OCR and PDF content are merged into a single review editor where users can clean and edit extracted text before generating study materials.

---

# Study Tools

## Quiz Architect

Generate quizzes directly from extracted study notes.

Powered by Google Gemini, the system can generate:

- Multiple choice questions
- True/False questions
- Concept understanding questions

Users can control:

- Difficulty level
- Number of questions

Generated quizzes are stored locally for later review.

---

# eBook Reader with AI Narration

Extracted content can be converted into an interactive eBook reader with narration.

## Online Mode

When connected to the internet, the system uses:

- Agora Conversational AI
- High-quality AI voice narration
- Interactive AI voice tutoring

The AI can:

- Read chapters naturally
- Answer questions about the material
- Explain difficult concepts

---

## Offline Mode

If the device is offline, the system automatically switches to Expo Speech.

This provides:

- Device-based text-to-speech
- Play, pause, resume, and stop controls
- Chapter navigation

This ensures the reading experience continues even without internet access.

---

# Interactive AI Voice Tutor

The eBook reader includes a conversational voice agent powered by Agora Conversational AI.

The voice tutor can:

- Explain difficult concepts
- Answer questions about the current chapter
- Guide the student through the material

The AI receives the current chapter text as context to provide accurate explanations.

Currently supported on web builds.

---

# Technology Stack

## Frontend

- Expo SDK 54
- React Native
- Expo Router
- NativeWind

## Storage

- MMKV for local storage of settings and quiz history

## Artificial Intelligence

- Google Gemini for quiz generation and Q&A

## Voice Systems

- Agora Conversational AI for high-quality online voice synthesis
- Expo Speech for offline text-to-speech fallback

---

# System Architecture

The system consists of three major components:

1. **Mobile/Web Application**
2. **AI Services**
3. **Voice Agent Server**

The application extracts and processes text locally, while AI services generate quizzes and provide explanations.

The voice agent server handles authentication and session creation for Agora Conversational AI.

---

# Project Structure
