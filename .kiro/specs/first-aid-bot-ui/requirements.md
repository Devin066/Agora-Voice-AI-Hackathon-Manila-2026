# Requirements Document

## Introduction

First Aid Bot is a mobile-first emergency response web application built for the Agora Voice AI Hackathon Manila 2026. The application connects patients in distress with nearby first responders through real-time alerts and voice AI guidance. It features a dual-view interface (Patient and Responder), an SOS emergency trigger, Emergency Action Plan (EAP) display, voice AI integration via Agora, and a dark-mode emergency theme. The existing Next.js scaffold will be rebuilt with Tailwind CSS v4, shadcn/ui, and Lucide React icons following a mobile-first approach.

## Glossary

- **First Aid Bot**: The emergency response web application described in this document
- **Patient**: A user who is experiencing a medical emergency and needs assistance
- **Responder**: A nearby civilian first responder who can provide aid
- **SOS Alert**: An emergency distress signal triggered by the Patient
- **EAP (Emergency Action Plan)**: A card displaying the patient's medical condition, required actions, and emergency contacts
- **Voice AI**: The Agora Conversational AI Engine providing real-time voice guidance during emergencies
- **Status Indicator**: A pill-shaped UI badge showing the current connection state of the application
- **Incoming Alert Card**: A UI card displayed to Responders showing details of a nearby emergency
- **Audio Wave Visualizer**: An animated set of vertical bars indicating active voice AI audio
- **Tabs Component**: A shadcn/ui component allowing users to switch between Patient and Responder views
- **Dark Emergency Theme**: The application's color scheme using deep charcoal blue backgrounds and high-contrast emergency colors

## Requirements

### Requirement 1: Tab-Based View Switching

**User Story:** As a user, I want to switch between Patient and Responder views using tabs, so that I can access the appropriate interface for my role.

#### Acceptance Criteria

1. WHEN the user opens the application, THE First Aid Bot SHALL display a Tabs component with "Patient" and "Responder" tab options.
2. WHEN the user selects the "Patient" tab, THE First Aid Bot SHALL render the Patient View component.
3. WHEN the user selects the "Responder" tab, THE First Aid Bot SHALL render the Responder View component.
4. THE First Aid Bot SHALL display a sticky header containing the app logo (Heart icon in a red square with a green status dot), the app name "First Aid Bot", and the label "Agora Voice AI Hackathon".
5. THE First Aid Bot SHALL display a footer containing hackathon credit text and emergency hotline numbers 911 and 143.

### Requirement 2: SOS Emergency Trigger

**User Story:** As a Patient, I want to press a large SOS button to trigger an emergency alert, so that nearby responders are notified of my distress.

#### Acceptance Criteria

1. THE First Aid Bot SHALL display a circular SOS button with dimensions of 192×192 pixels, a red emergency background, an AlertTriangle icon, the text "SOS", and the text "TULONG!".
2. WHILE the SOS button is in its idle state, THE First Aid Bot SHALL apply a pulsing red glow animation (`pulse-emergency`) to the SOS button.
3. WHEN the Patient presses the SOS button, THE First Aid Bot SHALL transition the emergency state from "idle" to "alerting" and disable the SOS button.
4. WHILE the emergency state is "alerting", THE First Aid Bot SHALL display the helper text "Hold tight, help is on the way..." below the SOS button.
5. WHILE the emergency state is "idle", THE First Aid Bot SHALL display the helper text "Press the button in case of emergency" below the SOS button.

### Requirement 3: Emergency Action Plan Display

**User Story:** As a user (Patient or Responder), I want to see the patient's Emergency Action Plan, so that I know the medical condition, required actions, and emergency contacts.

#### Acceptance Criteria

1. THE First Aid Bot SHALL display an EAP card containing a FileText icon header, the patient's medical condition, the action required, and an emergency contact number.
2. THE First Aid Bot SHALL use a warning color for the condition icon and a success color for the phone icon within the EAP card.
3. WHERE the `compact` prop is set to true, THE First Aid Bot SHALL render the EAP card in a smaller, condensed layout.

### Requirement 4: Connection Status Indicator

**User Story:** As a user, I want to see a visual indicator of my connection status, so that I know whether the system is ready, alerting, connected, or offline.

#### Acceptance Criteria

1. THE First Aid Bot SHALL display a pill-shaped Status Indicator badge in the Patient View.
2. WHILE the status is "idle", THE Status Indicator SHALL display a green background, a Wifi icon, and the text "Ready".
3. WHILE the status is "alerting", THE Status Indicator SHALL display a yellow background, a Radio icon with a pulse effect, and the text "Alerting".
4. WHILE the status is "connected", THE Status Indicator SHALL display a green background and the text "Connected".
5. WHILE the status is "offline", THE Status Indicator SHALL display a red background and the text "Offline".

### Requirement 5: Incoming Alert for Responders

**User Story:** As a Responder, I want to receive and review incoming emergency alerts, so that I can decide whether to accept and respond to a nearby emergency.

#### Acceptance Criteria

1. WHEN the Responder view is in the "waiting" state, THE First Aid Bot SHALL display a Shield icon, the text "You're on standby", and a "Connected to Supabase Realtime" indicator.
2. WHEN an SOS alert is triggered (simulated with a 2-second delay for demo), THE First Aid Bot SHALL transition the Responder view to the "alert-received" state and display an Incoming Alert Card.
3. THE Incoming Alert Card SHALL display the patient's avatar, name, an "URGENT" badge, location, distance, time, and medical condition.
4. THE Incoming Alert Card SHALL display a "Decline" button with an outline style and an "Accept & Respond" button with a green success background.
5. WHEN the Responder presses the "Accept & Respond" button, THE First Aid Bot SHALL transition the Responder view to the "responding" state.
6. WHEN the Responder presses the "Decline" button, THE First Aid Bot SHALL transition the Responder view back to the "waiting" state.

### Requirement 6: Voice AI Interface

**User Story:** As a Responder in the "responding" state, I want to connect to the Agora Voice AI, so that I receive real-time voice guidance while assisting the patient.

#### Acceptance Criteria

1. WHILE the Voice AI is disconnected, THE First Aid Bot SHALL display a large green "Connect to Voice AI (Agora)" button.
2. WHEN the Responder presses the "Connect to Voice AI" button, THE First Aid Bot SHALL transition the Voice AI interface to the connected state.
3. WHILE the Voice AI is connected, THE First Aid Bot SHALL display a card with the text "Voice AI Active", an audio wave visualizer with 8 vertical bars, a mute toggle button, and a red "End Call" button.
4. THE audio wave visualizer SHALL animate each of the 8 bars with staggered animation delays using the `audio-wave` CSS animation.
5. WHEN the Responder presses the mute toggle, THE First Aid Bot SHALL toggle the muted state and update the mute button icon accordingly.
6. WHEN the Responder presses the "End Call" button, THE First Aid Bot SHALL transition the Voice AI interface back to the disconnected state.

### Requirement 7: Responder Active Response View

**User Story:** As a Responder who has accepted an alert, I want to see navigation info, the patient's EAP, and a way to mark the emergency complete, so that I can effectively respond to the emergency.

#### Acceptance Criteria

1. WHILE the Responder view is in the "responding" state, THE First Aid Bot SHALL display a navigation card showing the distance to the patient.
2. WHILE the Responder view is in the "responding" state, THE First Aid Bot SHALL display the EAP card in compact mode.
3. WHILE the Responder view is in the "responding" state, THE First Aid Bot SHALL display the Voice AI interface.
4. WHILE the Responder view is in the "responding" state, THE First Aid Bot SHALL display a "Mark Complete" button.
5. WHEN the Responder presses the "Mark Complete" button, THE First Aid Bot SHALL transition the Responder view back to the "waiting" state.

### Requirement 8: Dark Emergency Theme and Mobile-First Layout

**User Story:** As a user, I want the application to use a dark emergency theme optimized for mobile screens, so that the interface is readable in high-stress situations and usable on handheld devices.

#### Acceptance Criteria

1. THE First Aid Bot SHALL use a dark emergency color theme with background `oklch(0.13 0.005 260)`, foreground `oklch(0.98 0 0)`, card `oklch(0.18 0.005 260)`, destructive red `oklch(0.55 0.22 25)`, success green `oklch(0.65 0.18 145)`, warning amber `oklch(0.75 0.15 85)`, muted gray `oklch(0.65 0 0)`, and border `oklch(0.28 0.005 260)`.
2. THE First Aid Bot SHALL implement a mobile-first responsive layout where the primary design targets viewport widths of 375 pixels and scales up for larger screens.
3. THE First Aid Bot SHALL define a `pulse-emergency` CSS animation that produces a pulsing red box-shadow glow effect.
4. THE First Aid Bot SHALL define an `audio-wave` CSS animation that vertically scales elements for the voice AI audio visualizer.

### Requirement 9: Accessibility

**User Story:** As a user with assistive technology, I want the application to be accessible, so that I can use all features with a screen reader or keyboard.

#### Acceptance Criteria

1. THE First Aid Bot SHALL provide ARIA labels on all interactive elements including buttons, tabs, and toggles.
2. THE First Aid Bot SHALL apply `role="status"` with `aria-live="polite"` to the Status Indicator component so that screen readers announce state changes.
3. THE First Aid Bot SHALL apply `aria-hidden="true"` to all decorative icons that do not convey meaningful information.
4. THE First Aid Bot SHALL provide visually hidden screen reader text for all state changes in the SOS button and Responder view transitions.

### Requirement 10: Patient View Layout

**User Story:** As a Patient, I want a centered, focused layout showing my status, the SOS button, my EAP, and my current location, so that I can quickly trigger an emergency and see relevant information.

#### Acceptance Criteria

1. THE First Aid Bot SHALL display the Patient View with a vertically centered layout containing the Status Indicator, the SOS button, the EAP card, and a current location text element.
2. THE First Aid Bot SHALL include code comments indicating Supabase integration points for inserting emergency records in the Patient View.
