# TRAE Usage: Lead Documentation Specialist & System Architect

In the **VisionVoice** project, we leverage **TRAE IDE** not just as a code editor, but as an **AI-Driven System Architect**. By defining a specialized agent role, we ensure that every technical decision is documented, aligned with Agora's constraints, and ready for rapid implementation.

## **How: Setting Up the Agent**

- **Agent Mode:** We utilize Trae's **Agent Mode** to handle high-level planning, complex multi-file edits, and architectural documentation.
- **Custom Instructions (Role Definition):** We configured the agent with a specialized profile: **Lead Documentation Specialist and System Architect**. This ensures its responses are technical, structured, and focused on system integrity.
- **Contextual Intelligence:** The agent is given full visibility of the project root, allowing it to maintain a "Single Source of Truth" across all documentation and source code.

## **Why: Rationale and Benefits**

- **Architectural Integrity:** With a complex data flow (Webcam → Local CV → Context Builder → Agora ConvoAI), the agent acts as a "gatekeeper" to ensure the pipeline remains efficient and logical.
- **Constraint Enforcement:** The agent is programmed to strictly adhere to the **Official Hackathon Constraints** (Required Agora RTC/ConvoAI usage, no local-only audio), preventing the team from pursuing non-compliant technical paths.
- **Accelerated Handoff:** The agent translates high-level design into actionable developer tickets, significantly reducing the "planning-to-coding" latency.

## **When: Trigger Points for Usage**

- **During Planning:** To refine system design, create Mermaid flowcharts, and break down the MVP scope.
- **During Major Implementation Shifts:** When new local CV capabilities (like `Face-API` or `TensorFlow.js`) are integrated, the agent updates the architecture and task lists.
- **Before Submissions:** To ensure the documentation highlights the most competitive differentiators for the judges.
- **Technical Debugging:** When data flow issues occur between the local environment and Agora's cloud services, the agent helps trace the architectural flaw.

## **Core Use Cases**

### **1. Automated Task & Handoff Management**
When the project scope changes, the agent automatically updates the development roadmap. This ensures developers always have clear, atomic tickets to work on without manual management.

### **2. Architectural Visualization**
The agent maintains and updates text-based Mermaid diagrams, ensuring the team always has a visual representation of the Webcam → Cloud pipeline.

### **3. Strategic Pitch Alignment**
The agent analyzes the project's unique features (e.g., Caregiver Escalation) and ensures they are framed as "Winning Differentiators" in the judge-facing documentation.

### **4. Agora Integration Guardrail**
The agent proactively checks if voice-interaction features are using **Agora ConvoAI** rather than standard local TTS/STT, ensuring compliance with hackathon rules.
